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

from django.http import Http404
from django.views.generic.base import RedirectView
from django.views.generic.edit import CreateView
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
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
        template = {'type': 'authors', 'items': None}

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[self.items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[self.items] = serializer.data
        return Response(template)

class AuthorDetail(RetrieveAPIView):
    """GET a specific author on the server by id."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer

class FollowerList(ListAPIView):
    """GET a list of authors who follow a specific author."""
    serializer_class = NodeUserSerializer

    items = 'items'

    def get_queryset(self):
        uuid_id = self.kwargs['pk']
        queryset = NodeUser.objects.filter(uuid_id=uuid_id)[0].followers.all()
        return queryset

    def list(self, request, *args, **kwargs):
        """Override: key-value output for follower list, pagination only enabled if qu"""
        template = {'type': 'followers', 'items': None}

        queryset = self.filter_queryset(self.get_queryset())
    
        serializer = self.get_serializer(queryset, many=True)
        template[self.items] = serializer.data
        return Response(template)
    
class FollowerExistsView(APIView):
    """GET - check if one author follows another."""
    def get(self, request, *args, **kwargs):
        template = {'type': 'follower exists', 'detail': False}

        author_uuid_id = self.kwargs['pk']
        follower_uuid_id = self.kwargs['fk']
        
        author_queryset = NodeUser.objects.filter(uuid_id=author_uuid_id)
        if not author_queryset.first():
            raise Http404
        
        follower_queryset = author_queryset.first().followers.filter(uuid_id=follower_uuid_id)
        if not follower_queryset.first():
            return Response(template)
        template['exists'] = True
        return Response(template)
