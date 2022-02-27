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

from uuid import uuid4

import requests
from django.http import Http404
from django.template.response import TemplateResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.views.generic.base import RedirectView
from django.views.generic.edit import CreateView
from rest_framework import status
from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     ListCreateAPIView, RetrieveUpdateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.response import Response

from socialdisto.pagination import CustomPagination

from .forms import RegistrationForm
from .models import NodeUser, Post
from .serializers import NodeUserSerializer, PostSerializer


class RegisterCreateView(CreateView):
    template_name = 'accounts/register.html'
    form_class = RegistrationForm

    def form_valid(self, form):
        host = self.request.get_host()
        form.instance.host = host
        form.instance.id = 'http://' + host + reverse('accounts:api_author_details', kwargs={'author_id': str(uuid4())}) 
        form.instance.url = form.instance.id
        
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

    _author_id = 'author_id'

    def get_object(self):
        queryset = self.get_queryset().filter(id__contains=self.kwargs[self._author_id])

        obj = get_object_or_404(queryset)

        self.check_object_permissions(self.request, obj)

        return obj

    def retrieve(self, request, *args, **kwargs):
        """Match to profile url to avoid potential collisions with copies of remote authors."""
        instance = self.get_queryset().filter(id__contains=request.path)
        if not instance:
            raise Http404

        serializer = self.get_serializer(instance, many=True)
        # TODO: Figure out why this indexing hack is needed when we didn't need it before.
        return Response(serializer.data[0])

    def post(self, request, *args, **kwargs):
        """Override - POST instead of PUT for partial update."""
        return self.partial_update(request, *args, **kwargs)

class FollowerListView(ListAPIView):
    """GET a list of authors who follow a specific author."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer

    _author_id = 'author_id'
    
    def get_author_id(self, request):
        return request.get_host() + '/authors/' + self.kwargs[self._author_id]

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

        queryset = self.get_author_followers_queryset(request)
    
        serializer = self.get_serializer(queryset, many=True)
        template[items] = serializer.data
        return Response(template)
    
class FollowerExistsView(RetrieveUpdateDestroyAPIView):
    """GET, PUT, and DELETE follower relationships."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    http_method_names = ['get', 'put', 'delete', 'head', 'options']

    _items = 'items'
    _author_id = 'author_id'
    _follower_id = 'follower_id'
    
    def get_author_object(self, request):
        queryset = self.get_queryset()
        id = request.get_host() + '/authors/' + self.kwargs[self._author_id]
        author = get_object_or_404(queryset, id__contains=id)
        
        return author
    
    def follower_profile(self):
        """GET Request follower profile."""
        id = self.kwargs[self._follower_id] + '/'
        response = requests.get(id)
        
        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise Http404
        
        return response.json()

    def get(self, request, *args, **kwargs):
        """Check if FOREIGN_AUTHOR_ID is a follower of AUTHOR_ID."""
        author = self.get_author_object(request)
        queryset = author.followers.all().filter(id__contains=self.kwargs[self._follower_id])
        
        serializer = self.get_serializer(queryset, many=True)

        template = {'type': 'followers', self._items: serializer.data}
        
        return Response(template)
    
    # TODO: needs to be authenticated.
    def put(self, request, *args, **kwargs):
        """Add FOREIGN_AUTHOR_ID as a follower of AUTHOR_ID."""
        # FOREIGN_AUTHOR_ID may be remote, so need to make a request for the profile.
        profile = self.follower_profile()

        obj, created = NodeUser.objects.get_or_create(id=profile[self._author_id])
        
        author = self.get_author_object(request)
        author.followers.add(obj)

        template = {'type': 'followers', self._items: profile}

        return Response(template)
    
    def delete(self, request, *args, **kwargs):
        """Remove FOREIGN_AUTHOR_ID from AUTHOR_ID followers."""
        author = self.get_author_object(request)
        follower = author.followers.all().get(id__contains=self.kwargs[self._follower_id])

        author.followers.remove(follower)

        return Response(status=status.HTTP_204_NO_CONTENT)

class ProfileView(CreateView):

    def get(self, request, template_name="accounts/profile.html"):
        return TemplateResponse(request, template_name)

class PostListView(ListCreateAPIView):
    """GET recent posts from AUTHOR_ID (paginated) and POST to create a new post with a newly generated POST_ID."""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    http_method_names = ['get', 'post', 'head', 'options']
    view_name = 'accounts:api_post_list'

    _author_id = 'author_id'

    def get_author_id(self, request):
        kwargs = {self._author_id: self.kwargs[self._author_id]}
        return request.get_host() + reverse(self.view_name, kwargs=kwargs)
    
    def get_author_posts_queryset(self, request):
        """Get all posts made created by AUTHOR_ID."""
        queryset = self.get_queryset()

        if not queryset:
            return queryset

        id = self.get_author_id(request)
        queryset = queryset.filter(id__contains=id)
        
        return queryset

    def list(self, request, *args, **kwargs):
        items = 'items'
        template = {'type': 'posts', items: None}

        queryset = self.get_author_posts_queryset(request)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[items] = serializer.data
        return Response(template)

    def post(self, request, *args, **kwargs):
        request.data._mutable = True
        request.data['host'] = request.get_host()
        request.data._mutable = False
        
        return self.create(request, *args, **kwargs)
    
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()

        return serializer_class(*args, **kwargs)

class PostDetailView(RetrieveUpdateDestroyAPIView, CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    view_name = 'accounts:api_post_detail'

    _author_id = 'author_id'
    _post_id = 'post_id'

    def get_post_id(self):
        kwargs = {self._author_id: self.kwargs[self._author_id], self._post_id: self.kwargs[self._post_id]}
        return reverse(self.view_name, kwargs=kwargs)

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())

        if not queryset:
            raise Http404

        queryset = queryset.filter(id__contains=self.get_post_id())

        obj = get_object_or_404(queryset)

        self.check_object_permissions(self.request, obj)

        return obj
    
    # TODO: must be authenticated.
    def post(self, request, *args, **kwargs):
        """Update the post whose id is POST_ID."""
        return self.partial_update(request, *args, **kwargs)
    
    # TODO: PK really shouldn't be editable, need a workaround for duplication checks
    # that isn't complete crap.
    def put(self, request, *args, **kwargs):
        """Create a new post where its id is POST_ID."""
        request.data._mutable = True
        request.data['id'] = 'http://' + request.get_host() + request.path
        request.data.mutable = False
        return self.create(request, *args, **kwargs)
