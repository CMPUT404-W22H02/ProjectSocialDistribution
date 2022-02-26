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

import requests
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.views.generic.base import RedirectView
from django.views.generic.edit import CreateView
from rest_framework import status
from rest_framework.generics import (ListAPIView, RetrieveUpdateAPIView,
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

class AuthorListView(ListAPIView):
    """Retrieve all author profiles on the server with optional pagination."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    pagination_class = CustomPagination
    http_method_names = ['get', 'head', 'options']

    def list(self, request):
        """Filter out possible remote profiles created from foreign key relationships."""
        items = 'items'
        template = {'type': 'authors', items: None}

        host = request.get_host()
        queryset = self.filter_queryset(self.get_queryset()).filter(host__contains=host)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[items] = serializer.data
        
        return Response(template)

class AuthorDetailView(RetrieveUpdateAPIView):
    """Retrieve and update an author's profile on the server."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def retrieve(self, request, *args, **kwargs):
        """Match to profile url to avoid potential collisions with copies of remote authors."""
        instance = self.get_queryset().filter(id__contains=request.path)
        if not instance:
            raise Http404

        serializer = self.get_serializer(instance, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """Override - POST instead of PUT for partial update."""
        return self.partial_update(request, *args, **kwargs)

class FollowerListView(ListAPIView):
    """GET a list of authors who follow a specific author."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    
    def get_author_id(self, request):
        return request.get_host() + '/authors/' + self.kwargs['id']

    def get_author_followers_queryset(self, request):
        """Get the followers queryset from an author's profile on the server."""
        queryset = self.get_queryset()
        id = self.get_author_id(request)
        author = get_object_or_404(queryset, id__contains=id)

        self.check_object_permissions(self.request, author)

        return author.followers.all()

    def list(self, request, *args, **kwargs):
        """Filter out possible remote profiles created from forein key relationships."""
        items = 'items'
        template = {'type': 'followers', items: None}

        id = request.get_host() + self.kwargs['id']
        author = self.filter_queryset(self.get_queryset()).filter(id__contains=id)

        queryset = self.get_author_followers_queryset(request)
    
        serializer = self.get_serializer(queryset, many=True)
        template[items] = serializer.data
        return Response(template)
    
class FollowerExistsView(RetrieveUpdateDestroyAPIView):
    """GET, PUT, and DELETE follower relationships."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    http_method_names = ['get', 'put', 'delete', 'head', 'options']

    items = 'items'
    
    def get_author_object(self, request):
        queryset = self.get_queryset()
        id = request.get_host() + '/authors/' + self.kwargs['id']
        author = get_object_or_404(queryset, id__contains=id)
        
        return author
    
    def follower_profile(self):
        """GET Request follower profile."""
        id = self.kwargs['f_id'] + '/'
        response = requests.get(id)
        
        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise Http404
        
        return response.json()

    def get(self, request, *args, **kwargs):
        """Check if FOREIGN_AUTHOR_ID is a follower of AUTHOR_ID."""
        author = self.get_author_object(request)
        queryset = author.followers.all().filter(id__contains=self.kwargs['f_id'])
        
        serializer = self.get_serializer(queryset, many=True)

        template = {'type': 'followers', self.items: serializer.data}
        
        return Response(template)
    
    # TODO: needs to be authenticated.
    def put(self, request, *args, **kwargs):
        """Add FOREIGN_AUTHOR_ID as a follower of AUTHOR_ID."""
        # FOREIGN_AUTHOR_ID may be remote, so need to make a request for the profile.
        profile = self.follower_profile()

        obj, created = NodeUser.objects.get_or_create(id=profile[0]['id'])
        
        author = self.get_author_object(request)
        author.followers.add(obj)

        template = {'type': 'followers', self.items: profile}

        return Response(template)
    
    def delete(self, request, *args, **kwargs):
        """Remove FOREIGN_AUTHOR_ID from AUTHOR_ID followers."""
        author = self.get_author_object(request)
        follower = author.followers.all().get(id__contains=self.kwargs['f_id'])

        author.followers.remove(follower)

        return Response(status=status.HTTP_204_NO_CONTENT)

# class PostListView(ListCreateAPIView):
#     """GET and POST Posts at authors/AUTHOR_ID/posts for recent posts, or create new ones."""
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer
#     http_method_names = ['get', 'post', 'head', 'options']

#     # Response template
#     items = 'items'

#     # def get_queryset(self):
#     #     uuid_id = self.kwargs['pk']
#     #     queryset = NodeUser.objects.filter(uuid_id=uuid_id)
#     #     if not queryset:
#     #         raise Http404
#     #     return queryset

#     def list(self, request, *args, **kwargs):
#         """Override: key-value output for follower list, pagination only enabled if qu"""
#         template = {'type': 'posts', self.items: None}
    
#         serializer = self.get_serializer(self.get_queryset(), many=True)
#         template[self.items] = serializer.data
#         return Response(template)
    
#     def post(self, request, *args, **kwargs):
#         request.data._mutable = True
#         request.data.update({'host': self.request.get_host()})
#         breakpoint()
#         return self.create(request, args, kwargs)


# class PostDetailView(RetrieveUpdateDestroyAPIView, CreateAPIView):
#     """GET, POST, PUT, and DELETE Posts at authors/AUTHOR_ID/posts/POST_ID."""
#     queryset = Post.objects.all()
#     serializer_class = PostSerializer
#     http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

#     def get_post_id(self):
#         """Get and decode the POST_ID."""
#         return self.kwargs['fk'] + '/'

#     def get(self, request, *args, **kwargs):
#         """Get the public post whose id is POST_ID."""
#         post_id = self.get_post_id()
#         queryset = self.get_queryset().filter(id=post_id)
#         if not queryset:
#             raise Http404

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)
    
#     def post(self, request, *args, **kwargs):
#         """Update the post with id of POST_ID."""
#         post_id = self.get_post_id()
#         queryset = self.get_queryset().filter(id=post_id)
#         if not queryset:
#             raise Http404
        
#         return self.partial_update(request, *args, **kwargs)
    
#     def put(self, request, *args, **kwargs):
#         """Create a post with id of POST_ID."""
#         post_id = self.get_post_id()
#         queryset = self.get_queryset().filter(id=post_id)
#         if queryset:
#             return Response(status=status.HTTP_409_CONFLICT)
        
#         return self.create(request, args, kwargs)

