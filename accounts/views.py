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

from msilib.schema import ListView
from uuid import uuid4
from webbrowser import get

import requests
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.views.generic.base import RedirectView
from django.views.generic.edit import CreateView
from rest_framework import status
from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     ListCreateAPIView, RetrieveUpdateAPIView,
                                     RetrieveUpdateDestroyAPIView)
from rest_framework.mixins import DestroyModelMixin
from rest_framework.response import Response

from socialdisto.pagination import CommentPagination, CustomPagination

from .forms import RegistrationForm
from .models import Comment, Inbox, Like, NodeUser, Post
from .serializers import (CommentCreationSerializer, CommentSerializer,
                          NodeUserSerializer, PostSerializer)


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
    """Retrieve all authors registered on the server."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    pagination_class = CustomPagination
    http_method_names = ['get', 'head', 'options']

    def list(self, request):
        items = 'items'
        template = {'type': 'authors', items: None}

        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.filter(host__contains=self.request.get_host())

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
    
    def author_id(self):
        """Return AUTHOR_ID with hostname prefix."""
        key = 'author_id'
        view_name = 'accounts:api_author_details'
        kwargs = {key: self.kwargs[key]}
        return self.request.get_host() + reverse(view_name, kwargs=kwargs)

    def list(self, request, *args, **kwargs):
        items = 'items'
        template = {'type': 'followers', items: None}

        try:
            queryset = self.get_queryset()
            author = queryset.filter(id__contains=self.author_id())
            queryset = queryset.filter(followers__in=author)
        except:
            # Don't 404 on an empty queryset, just return an empty follower list
            queryset = self.get_queryset()
    
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

    def get(self, request, *args, **kwargs):
        """Check if FOREIGN_AUTHOR_ID is a follower of AUTHOR_ID."""
        queryset = self.get_queryset()
        author = get_object_or_404(queryset, id__contains=self.author_id())
        queryset = author.followers.all().filter(id__contains=self.kwargs[self._follower_id])
        
        serializer = self.get_serializer(queryset, many=True)

        template = {'type': 'followers', self._items: serializer.data}
        
        return Response(template)
    
    # TODO: needs to be authenticated.
    def put(self, request, *args, **kwargs):
        """Add FOREIGN_AUTHOR_ID as a follower of AUTHOR_ID."""
        # FOREIGN_AUTHOR_ID may be remote, so need to make a request for the profile.
        profile = self.follower_profile()

        obj, created = NodeUser.objects.get_or_create(id=profile['id'])
        
        author = self.get_author_object(request)
        author.followers.add(obj)

        template = {'type': 'followers', self._items: profile}

        return Response(template)
    
    def delete(self, request, *args, **kwargs):
        """Remove FOREIGN_AUTHOR_ID from AUTHOR_ID followers."""
        author = self.get_author_object(request)
        queryset = author.followers.all().filter(id__contains=self.kwargs[self._follower_id])
        follower = get_object_or_404(queryset, id__contains=self.author_id)

        follower = author.followers.all().get(id__contains=self.kwargs[self._follower_id])

        author.followers.remove(follower)

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def author_id(self):
        """Return AUTHOR_ID with hostname prefix."""
        key = 'author_id'
        view_name = 'accounts:api_author_details'
        kwargs = {key: self.kwargs[key]}
        return self.request.get_host() + reverse(view_name, kwargs=kwargs)
    
    def get_author_object(self, request):
        queryset = self.get_queryset()
        author = get_object_or_404(queryset, id__contains=self.author_id())
        return author
    
    def follower_profile(self):
        """GET Request follower profile."""
        id = self.kwargs[self._follower_id] + '/'
        response = requests.get(id)
        
        if response.status_code == status.HTTP_404_NOT_FOUND:
            raise Http404
        
        return response.json()

# TODO: Image serializer implementation - base64 decoding
class PostListView(ListCreateAPIView):
    """GET recent posts from AUTHOR_ID (paginated) and POST to create a new post with a newly generated POST_ID."""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    http_method_names = ['get', 'post', 'head', 'options']

    def list(self, request, *args, **kwargs):
        items = 'items'
        template = {'type': 'posts', items: None}

        queryset = self.get_queryset()
        if not queryset:
            return queryset
        
        queryset = queryset.filter(id__contains=self.author_id())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[items] = serializer.data
        return Response(template)

    def author_id(self):
        """Return AUTHOR_ID with hostname prefix."""
        key = 'author_id'
        view_name = 'accounts:api_author_details'
        kwargs = {key: self.kwargs[key]}
        return self.request.get_host() + reverse(view_name, kwargs=kwargs)

class PostDetailView(RetrieveUpdateDestroyAPIView, CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    

    def post_id(self):
        view_name = 'accounts:api_post_detail'
        author_id = 'author_id'
        post_id = 'post_id'
        kwargs = {author_id: self.kwargs[author_id], post_id: self.kwargs[post_id]}
        return reverse(view_name, kwargs=kwargs)

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())

        if not queryset:
            raise Http404

        queryset = queryset.filter(id__contains=self.post_id())

        obj = get_object_or_404(queryset)

        self.check_object_permissions(self.request, obj)

        return obj
    
    # TODO: must be authenticated.
    def post(self, request, *args, **kwargs):
        """Update the post whose id is POST_ID."""
        return self.partial_update(request, *args, **kwargs)
    
    def put(self, request, *args, **kwargs):
        """Create a new post where its id is POST_ID."""
        return self.create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        """Override: need to insert the POST_ID."""
        serializer.save(
            id=f'http://{self.request.get_host()}{self.request.path}'
        )

class CommentListView(ListCreateAPIView):
    queryset = Comment.objects.all()
    pagination_class = CommentPagination
    http_method_names = ['get', 'post', 'head', 'options']

    def list(self, request, *args, **kwargs):
        items = 'items'
        template = {'type': 'comments', items: None}
        
        queryset = self.get_queryset()
        try:
            queryset = queryset.filter(id__contains=self.post_id())
        except:
            raise Http404

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[items] = serializer.data
            return self.get_paginated_response(template)

        serializer = self.get_serializer(queryset, many=True)
        template[items] = serializer.data
        return Response(template)
    
    def get_serializer(self, *args, **kwargs):
        kwargs['context'] = self.get_serializer_context()
        if 'data' in kwargs:
            return CommentCreationSerializer(*args, **kwargs)
        return CommentSerializer(*args, **kwargs)
    
    def perform_create(self, serializer):
        """Override: need to insert the POST_ID."""
        serializer.save(
            id=f'http://{self.post_id()}/comments/{str(uuid4())}'
        )
    
    def post_id(self):
        view_name = 'accounts:api_post_detail'
        author_id = 'author_id'
        post_id = 'post_id'
        kwargs = {author_id: self.kwargs[author_id], post_id: self.kwargs[post_id]}
        return self.request.get_host() + reverse(view_name, kwargs=kwargs)
    
class PostLikesView(ListAPIView):
    serializer_class = CommentSerializer
    http_method_names = ['get', 'head', 'options']

    _author_id = 'author_id'
    _post_id = 'post_id'

    def get_post_id(self):
        kwargs = {self._author_id: self.kwargs[self._author_id], self._post_id: self.kwargs[self._post_id]}
        return self.request.get_host() + reverse('accounts:api_post_detail', kwargs=kwargs)

    def get_queryset(self):
        queryset = Like.objects.all()

        # Don't 404 if there are no likes at all
        if not queryset:
            return queryset

        try:
            queryset = queryset.filter(object__contains=self.get_post_id())
        except:
            raise Http404
        
        return queryset

class AuthorLikedView(ListAPIView):
    serializer_class = CommentSerializer
    http_method_names = ['get', 'head', 'options']

    _author_id = 'author_id'

    def get_author_id(self):
        kwargs = {self._author_id: self.kwargs[self._author_id]}
        return self.request.get_host() + reverse('accounts:api_author_details')

    def get_queryset(self):
        queryset = Like.objects.all()

        # Don't 404 if there are no likes at all
        if not queryset:
            return queryset

        try:
            queryset = queryset.filter(author__id__contains=self.get_author_id())
        except:
            raise Http404
        
        return queryset

class InboxView(ListCreateAPIView, DestroyModelMixin):
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    http_method_names = ['get', 'post', 'head', 'options']

    _type = 'type'
    _items = 'items'
    _inbox = 'inbox'
    _author = 'author'
    _author_id = 'author_id'
    _type_post = 'post'
    _type_follow = 'follow'
    _type_like = 'like'

    def get_author_id(self):
        kwargs = {self._author_id: self.kwargs[self._author_id]}
        return self.request.get_host() + reverse('accounts:api_author_details', kwargs=kwargs)

    def queryset_post(self):
        if self.request[self._type] == self._type_post:
            try:
                queryset = Inbox.objects.filter(author__contains=self.get_author_id())
            except:
                raise Http404
        elif self.request[self._type] == self._type_follow:
            pass
        elif self.request[self._type] == self._type_like:
            pass
    
    def queryset_get(self):
        queryset = Post.objects.all()

        if not queryset:
            return queryset
        
        try:
            queryset = queryset.filter(id__contains=self.get_author_id())
        except:
            raise Http404
        
        return queryset

    def queryset_delete(self):
        pass

    def get_queryset(self):
        if self.request.method == 'GET':
            return self.queryset_get()
        elif self.request.method == 'POST':
            return self.queryset_post()
        elif self.request.method == 'DELETE':
            pass

    def list(self, request, *args, **kwargs):
        template = {self._type: self._inbox, self._author: 'http://' + self.get_author_id(), self._items: None}
        queryset = self.queryset_get()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[self._items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[self._items] = serializer.data
        return Response(template)