# Project Social Distribution, a distributed social media web application.
# Copyright (C) 2022 Jarrett Knauer
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

from urllib.parse import unquote, urlencode

import requests
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.views.generic.base import RedirectView
from django.views.generic.edit import CreateView
from rest_framework import status
from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     RetrieveUpdateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.response import Response

from socialdisto.pagination import CustomPagination

from .forms import RegistrationForm
from .models import NodeUser
from .serializers import NodeUserSerializer


class RegisterCreateView(CreateView):
    template_name = 'accounts/register.html'
    form_class = RegistrationForm

    def form_valid(self, form):
        host = self.request.get_host()
        form.instance.host = host
        return super(RegisterCreateView, self).form_valid(form)

class HomeRedirectView(RedirectView):
    pattern_name = 'accounts:login'

class LoggedInRedirectView(RedirectView):
    pattern_name = 'inbox:home'

class AuthorList(ListAPIView):
    """Get all authors on the server with optional pagination."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    pagination_class = CustomPagination

    items = 'items'

    def list(self, request):
        """Override: key-value output for author list, pagination only enabled if query params specified."""
        template = {'type': 'authors', self.items: None}

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[self.items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[self.items] = serializer.data
        return Response(template)

class AuthorDetail(RetrieveUpdateAPIView):
    """GET a specific author on the server by id."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    # Override the default UpdateAPIView PUT with POST instead
    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class FollowerList(ListAPIView):
    """GET a list of authors who follow a specific author."""
    serializer_class = NodeUserSerializer

    # Response template
    items = 'items'

    def get_queryset(self):
        uuid_id = self.kwargs['pk']
        queryset = NodeUser.objects.filter(uuid_id=uuid_id)
        if not queryset:
            raise Http404
        return queryset

    def list(self, request, *args, **kwargs):
        """Override: key-value output for follower list, pagination only enabled if qu"""
        template = {'type': 'followers', self.items: None}

        queryset = self.get_queryset()[0].followers.all()
    
        serializer = self.get_serializer(queryset, many=True)
        template[self.items] = serializer.data
        return Response(template)
    
class FollowerExistsView(RetrieveUpdateDestroyAPIView):
    """GET, PUT, and DELETE follower relationships."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    http_method_names = ['get', 'put', 'delete', 'head', 'options']

    # Response template
    items = 'items'
    
    def get_author(self):
        """Get authors/{AUTHOR_ID} object."""
        return get_object_or_404(self.get_queryset(), uuid_id=self.kwargs['pk'])

    def get_follower(self):
        """Get the authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID} object."""
        return get_object_or_404(self.get_author().followers, id=self.get_follower_id())
    
    def get_follower_id(self):
        """Get and decode the FOREIGN_AUTHOR_ID object."""
        return unquote(self.kwargs['fk']) + '/'
    
    def get(self, request, *args, **kwargs):
        """Check if FOREIGN_AUTHOR_ID is a follower of AUTHOR_ID."""
        template = {'type': 'followers', self.items: None}
        
        queryset = self.get_author().followers.all().filter(id=self.get_follower_id())
        

        serializer = self.get_serializer(queryset, many=True)
        template[self.items] = serializer.data
        return Response(template)
    
    def put(self, request, *args, **kwargs):
        """Only updating the follower field for the AUTHOR_ID with FOREIGN_AUTHOR_ID."""
        # Follower may be remote, need to request the FOREIGN_AUTHOR_ID profile
        template = {'type': 'followers', self.items: None}
        
        f_id = self.get_follower_id()
        r = requests.get(f_id)
        json = r.json()
        
        if r.status_code == status.HTTP_404_NOT_FOUND:
            raise Http404

        obj, created = NodeUser.objects.get_or_create(id=json['id'])
        
        a = self.get_author()
        a.followers.add(obj)
        template[self.items] = r.json()
        return Response(template)
    
    def delete(self, request, *args, **kwargs):
        """Remove FOREIGN_AUTHOR_ID from AUTHOR_ID followers."""
        # FOREIGN_AUTHOR_ID may be a remote author, so the id may be urlencoded
        f_author_id = unquote(self.kwargs['fk'])
        a = self.get_author()
        breakpoint()
        f = a.followers.all().get(id=self.get_follower_id())
        
        a.followers.remove(f)
        return Response(status=status.HTTP_204_NO_CONTENT)

class PostDetailView(RetrieveUpdateDestroyAPIView, CreateAPIView):
    """GET, POST, PUT, and DELETE Posts at authors/AUTHOR_ID/posts/POST_ID."""
