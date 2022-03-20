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

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authentication import BasicAuthentication
from rest_framework.generics import (ListAPIView, ListCreateAPIView,
                                     RetrieveUpdateAPIView,
                                     RetrieveUpdateDestroyAPIView, CreateAPIView)
from rest_framework.permissions import (IsAuthenticated,
                                        IsAuthenticatedOrReadOnly)
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTTokenUserAuthentication

from socialdisto.pagination import CustomPagination

from .models import Author, NodeUser, Post
from .serializers import (AuthorSerializer, PostCreationSerializer,
                          PostDetailsSerializer)


class UtilityAPI():
    _author_id = 'author_id'
    _follower_id = 'follower_id'
    _post_id = 'post_id'

    _id = 'id'
    _type = 'type'
    _items = 'items'
    _authors = 'authors'
    _followers = 'followers'
    _posts = 'posts'

    def get_author_id(self, request, author_id):
        """Return fully qualified id from author_id."""
        return request.build_absolute_uri(f'/authors/{author_id}')
    
    def get_post_id(self, request, author_id, post_id):
        return request.build_absolute_uri(f'/authors/{author_id}/posts/{post_id}')
        

class AuthorsAPIView(ListAPIView, UtilityAPI):
    """Retrieve all authors registered on the server."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer
    pagination_class = CustomPagination

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        users = NodeUser.objects.all()
        return queryset.filter(user__in=users)

    def list(self, request, *args, **kwargs):
        response = {self._type: self._authors, self._items: None}
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response[self._items] = serializer.data
            return self.get_paginated_response(response)

        serializer = self.get_serializer(queryset, many=True)
        response[self._items] = serializer.data
        return Response(response)

class AuthorDetailAPIView(RetrieveUpdateAPIView, UtilityAPI):
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    http_method_names = ['get', 'post']

    def get_object(self):
        queryset = self.get_queryset()

        id = self.get_author_id(self.request, self.kwargs[self._author_id])
        obj = get_object_or_404(queryset, id=id)

        return obj
    
    def get_authenticators(self):
        if self.request.method == 'POST':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()
    
    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class FollowersAPIView(ListAPIView, UtilityAPI):
    """Retrieve list of authors who follow a given author."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        id = self.get_author_id(self.request, self.kwargs[self._author_id])

        try:
            queryset = queryset.get(id=id).followers.all()
        except:
            return Author.objects.none()
        
        return queryset
    
    def get_authenticators(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()
    
    def list(self, request, *args, **kwargs):
        response = {self._type: self._followers, self._items: None}
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        response[self._items] = serializer.data
        return Response(response)
    
class FollowerDetailAPIView(RetrieveUpdateDestroyAPIView, UtilityAPI):
    """Check if follower relationship exists, add and remove followers from an author."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()

        id = self.get_author_id(self.request, self.kwargs[self._author_id])

        try:
            followers = queryset.get(id=id).followers.all()
        except:
            followers = Author.objects.none()

        return queryset, followers
    
    def get_object(self):
        authors, followers = self.get_queryset()
        method = self.request.method

        author_id = self.get_author_id(self.request, self.kwargs[self._author_id])
        author = get_object_or_404(authors, id=author_id)
        
        try:
            if method == 'GET' or method == 'DELETE':
                follower = author.followers.get(id=self.kwargs[self._follower_id])
            elif method == 'PUT':
                follower = authors.get(id=self.kwargs[self._follower_id])
        except:
            follower = Author.objects.none()
        
        return author, follower
    
    def get_authenticators(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()
    
    def retrieve(self, request, *args, **kwargs):
        """Check if the follower followers the author."""
        response = {self._type: self._followers, self._items: None}
        authors, followers = self.get_queryset()

        follower = followers.filter(id=self.kwargs[self._follower_id])
        serializer = self.get_serializer(follower, many=True)
        response[self._items] = serializer.data

        return Response(response)
    
    def put(self, request, *args, **kwargs):
        """Add a follower to an author."""
        author, follower = self.get_object()

        if not follower:
            return Response(status=status.HTTP_204_NO_CONTENT)

        author.followers.add(follower)
        
        response = {self._type: self._followers, self._items: None}
        serializer = self.get_serializer(follower)
        response[self._items] = serializer.data

        return Response(response)
    
    def delete(self, request, *args, **kwargs):
        """Remove a follower from an author."""
        author, follower = self.get_object()

        if not follower:
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        author.followers.remove(follower)

        return Response(status.HTTP_200_OK)

class PostsAPIView(ListCreateAPIView, UtilityAPI):
    """Get recent posts from an author, and create a new post with a newly generated id."""
    queryset = Post.objects.all()

    pagination_class = CustomPagination

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(author__id=self.get_author_id(self.request, self.kwargs[self._author_id]))
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostDetailsSerializer
        return PostCreationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            author_id = self.get_author_id(self.request, self.kwargs[self._author_id])
            author = get_object_or_404(Author.objects.all(), id=author_id)
            # TODO: assumes no POST ID collisions with the author
            post_id = str(uuid4())
            context[self._id] = author_id + '/posts/' + post_id
            context['author'] = author
            context['comments'] = context[self._id] + '/comments'
        return context
    
    def get_authenticators(self):
        if self.request.method == 'POST':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()

    def list(self, request, *args, **kwargs):
        response = {self._type: self._posts, self._items: None}
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response[self._items] = serializer.data
            return self.get_paginated_response(response)
        
        serializer = self.get_serializer(queryset, many=True)
        response[self._items] = serializer.data
        return Response(response)

class PostDetailAPIView(RetrieveUpdateDestroyAPIView, CreateAPIView, UtilityAPI):
    """Retrieve, create, update, and delete a post."""
    queryset = Post.objects.all()

    serializer_class = PostDetailsSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostDetailsSerializer
        return PostCreationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'PUT':
            author_id = self.get_author_id(self.request, self.kwargs[self._author_id])
            author = get_object_or_404(Author.objects.all(), id=author_id)
            # TODO: assumes no POST ID collisions with the author
            post_id = self.get_post_id(self.request, self.kwargs[self._author_id], self.kwargs[self._post_id])
            context[self._id] = post_id
            context['author'] = author
            context['comments'] = context[self._id] + '/comments'
        return context

    def get_authenticators(self):
        if self.request.method == 'POST' or self.request.method == 'PUT' or self.request.method == 'DELETE':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()
    
    def get_object(self):
        queryset = self.get_queryset()

        post_id = self.get_post_id(self.request, self.kwargs[self._author_id], self.kwargs[self._post_id])
        obj = get_object_or_404(queryset, id=post_id)

        return obj
    
    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
    def put(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
