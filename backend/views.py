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
from django.urls import reverse
from requests import get
from requests.auth import HTTPBasicAuth
from rest_framework import status
from rest_framework.authentication import BasicAuthentication
from rest_framework.generics import (CreateAPIView, ListAPIView,
                                     ListCreateAPIView, RetrieveUpdateAPIView,
                                     RetrieveUpdateDestroyAPIView,
                                     UpdateAPIView)
from rest_framework.mixins import DestroyModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTTokenUserAuthentication

from socialdisto.pagination import CustomPagination

from .adapters import RemoteAdapter
from .models import Author, Comment, Inbox, Like, Node, NodeUser, Post, Follow
from .serializers import (AuthorSerializer, CommentCreationSerializer,
                          CommentSerializer, FollowSerializer, InboxCommentSerializer,
                          InboxFollowSerializer, InboxLikeSerializer,
                          InboxPostSerializer, LikeSerializer,
                          PostCreationSerializer, PostDetailsSerializer, PublicPostSerializer)


class UtilityAPI(APIView):
    # Itemized response templates
    ritems = 'items'
    rtype = 'type'
    authors_response_template = {
        rtype: "authors",
        ritems: []
    }
    followers_response_template = {
        rtype: "followers",
        ritems: []
    }
    likes_response_template = {
        rtype: "likes",
        ritems: []
    }
    liked_response_template = {
        rtype: "liked",
        ritems: []
    }
    inbox_response_template = {
        rtype: "inbox",
        "author": "",
        ritems: []
    }
    posts_response_template = {
        rtype: "posts",
        ritems: []
    }

    _author_id = 'author_id'
    _follower_id = 'follower_id'
    _post_id = 'post_id'
    _comment_id = 'comment_id'

    _id = 'id'
    _type = 'type'
    _items = 'items'
    _authors = 'authors'
    _followers = 'followers'
    _posts = 'posts'
    _comments = 'comments'

    def get_author_id(self):
        """Return the full path id for the request author."""
        author_id = self.kwargs[self._author_id]
        path = reverse('api_author_details', args=[author_id])
        return self.request.build_absolute_uri(path)
    
    def get_post_id(self):
        """Return the full path id for the request post."""
        author_id = self.kwargs[self._author_id]
        post_id = self.kwargs[self._post_id]
        path = reverse('api_post_detail', args=[author_id, post_id])
        return self.request.build_absolute_uri(path)
    
    def get_comment_id(self):
        """Return the full path id for the request comment."""
        author_id = self.kwargs[self._author_id]
        post_id = self.kwargs[self._post_id]
        comment_id = self.kwargs[self._comment_id]
        path = reverse('api_comment_likes', args=[author_id, post_id, comment_id])
        return self.request.build_absolute_uri(path)
        
class AuthorsAPIView(ListAPIView, UtilityAPI):
    """Retrieve all authors registered on the server."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer
    pagination_class = CustomPagination

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        users = NodeUser.objects.all()
        return queryset.filter(user__in=users)

    def list(self, request, *args, **kwargs):
        response = self.authors_response_template
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response[self.ritems] = serializer.data
            return self.get_paginated_response(response)

        serializer = self.get_serializer(queryset, many=True)
        response[self.ritems] = serializer.data
        return Response(response)

class AuthorDetailAPIView(RetrieveUpdateAPIView, UtilityAPI):
    """Retrieve and update an author profile."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    local_methods = ['POST']

    http_method_names = ['get', 'post']

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def get_object(self):
        queryset = self.get_queryset()

        id = self.get_author_id()
        obj = get_object_or_404(queryset, id=id)

        return obj

    def get_authenticators(self):
        if self.request.method  == 'POST':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()

class FollowersAPIView(ListAPIView, UtilityAPI):
    """Retrieve list of authors who follow a given author."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        id = self.get_author_id()
        try:
            queryset = queryset.get(id=id).followers.all()
        except:
            return Author.objects.none()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        response = self.followers_response_template
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        response[self.ritems] = serializer.data
        return Response(response)
    
class FollowerDetailAPIView(RetrieveUpdateDestroyAPIView, UtilityAPI):
    """Check if follower relationship exists, add and remove followers from an author."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    local_methods = ['PUT', 'DELETE']

    def get_queryset(self):
        queryset = super().get_queryset()

        id = self.get_author_id()

        try:
            followers = queryset.get(id=id).followers.all()
        except:
            followers = Author.objects.none()

        return queryset, followers
    
    def get_object(self):
        authors, followers = self.get_queryset()
        method = self.request.method

        author_id = self.get_author_id()
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
        if self.request.method in self.local_methods:
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
    permission_classes = [IsAuthenticated]
    local_methods = ['POST']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(author__id=self.get_author_id())
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostDetailsSerializer
        return PostCreationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            author_id = self.get_author_id()
            author = get_object_or_404(Author.objects.all(), id=author_id)
            # TODO: assumes no POST ID collisions with the author
            context[self._id] = author_id + '/posts/' + str(uuid4())
            context['author'] = author
            context['comments'] = context[self._id] + '/comments'
        return context
    
    def get_authenticators(self):
        if self.request.method in self.local_methods:
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
    permission_classes = [IsAuthenticated]
    local_methods = ['PUT', 'POST', 'DELETE']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PostDetailsSerializer
        return PostCreationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'PUT':
            author_id = self.get_author_id()
            author = get_object_or_404(Author.objects.all(), id=author_id)
            # TODO: assumes no POST ID collisions with the author
            post_id = self.get_post_id()
            context[self._id] = post_id
            context['author'] = author
            context['comments'] = context[self._id] + '/comments'
        return context

    def get_authenticators(self):
        if self.request.method in self.local_methods:
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()
    
    def get_object(self):
        queryset = self.get_queryset()

        post_id = self.get_post_id()
        obj = get_object_or_404(queryset, id=post_id)

        return obj
    
    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
    def put(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class CommentsAPIView(ListCreateAPIView, UtilityAPI):
    """Get and create comments for a post."""
    queryset = Comment.objects.all()

    serializer_class = CommentSerializer
    pagination_class = CustomPagination

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    local_methods = ['POST']

    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.get_post_id()
        return queryset.filter(post__id=post_id)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CommentSerializer
        return CommentCreationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            post_id = self.get_post_id()
            post = get_object_or_404(Post.objects.all(), id=post_id)
            context['post'] = post
            context['id'] = f'{post_id}/comments/{str(uuid4())}'
            context['author'] = get_object_or_404(Author.objects.all(), id=self.request.data['author']['id'])
        return context
    
    def get_authenticators(self):
        if self.request.method in self.local_methods:
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()
    
    def list(self, request, *args, **kwargs):
        response = {self._type: self._comments, self._items: None}
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response[self._items] = serializer.data
            return self.get_paginated_response(response)
        
        serializer = self.get_serializer(queryset, many=True)
        response[self._items] = serializer.data
        return Response(response)

class PostLikesAPIView(ListAPIView, UtilityAPI):
    """Get the likes on a post."""
    queryset = Like.objects.all()

    serializer_class = LikeSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.get_post_id()
        
        return queryset.filter(object=post_id)
    
    def list(self, request, *args, **kwargs):
        response = self.likes_response_template
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        response[self.ritems] = serializer.data
        return Response(response)

class CommentLikesAPIView(ListAPIView, UtilityAPI):
    """Get the likes on a comment."""
    queryset = Like.objects.all()

    serializer_class = LikeSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        comment_id = self.get_comment_id()
        return queryset.filter(object=comment_id)
    
    def list(self, request, *args, **kwargs):
        response = self.likes_response_template
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        response[self.ritems] = serializer.data
        return Response(response)

class AuthorLikedAPIView(ListAPIView, UtilityAPI):
    """Get the like objects made by an author."""
    queryset = Like.objects.all()

    serializer_class = LikeSerializer

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        author_id = self.get_author_id()
        return queryset.filter(author__id=author_id)
    
    def list(self, request, *args, **kwargs):
        response = self.liked_response_template
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        response[self.ritems] = serializer.data
        return Response(response)

class InboxAPIView(ListCreateAPIView, DestroyModelMixin, UtilityAPI):
    """Get, send, and clear content from an author's inbox."""

    authentication_classes = [JWTTokenUserAuthentication, BasicAuthentication]
    permission_classes = [IsAuthenticated]
    local_only_methods = ['GET']
    http_method_names = ['get', 'post', 'delete', 'head', 'options'] 

    def get_serializer_class(self):
        method = self.request.method

        if method == 'POST':
            serializers = {
                'post': InboxPostSerializer,
                'comment': InboxCommentSerializer,
                'like': InboxLikeSerializer,
                'follow': InboxFollowSerializer
            }
            content_type = self.request.data['type']
            return serializers[content_type]
        return PostDetailsSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            content_type = self.request.data['type']

            if content_type == 'post' or content_type == 'comment' or content_type == 'like':
                author_id = self.request.data['author']['id']
                try:
                    author = Author.objects.get(id=author_id)
                except:
                    serializer = AuthorSerializer(data=self.request.data['author'])
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    author = Author.objects.get(id=author_id)
                context['author'] = author    
            
            if content_type == 'comment':
                comment_id = self.request.data['id']
                sub = comment_id[:comment_id.find('/comments')]
                post = Post.objects.get(id=sub)
                context['post'] = post
        
            if content_type == 'follow':
                actor_id = self.request.data['actor']['id']
                try:
                    actor = Author.objects.get(id=actor_id)
                except:
                    serializer = AuthorSerializer(data=self.request.data['actor'])
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    actor = Author.objects.get(id=actor_id)
                # actor, created = Author.objects.get_or_create(id=actor_id)
                context['actor'] = actor

                object_id = self.request.data['object']['id']
                object = get_object_or_404(Author.objects.all(), id=object_id)
                context['object'] = object
        return context

    def get_authenticators(self):
        if self.request.method in self.local_only_methods:
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().get_authenticators()

    def get_queryset(self):
        method = self.request.method
        inbox = get_object_or_404(Inbox.objects.all(), author__id=self.get_author_id())

        if method == 'DELETE' or method == 'POST':
            return Inbox.objects.all()
        elif method == 'GET':
            queryset = inbox.posts.all()
            return queryset
    
    def get_object(self):
        method = self.request.method
        queryset = self.get_queryset()

        if method == 'DELETE' or method == 'POST':
            obj = get_object_or_404(queryset, author_id=self.get_author_id())
            return obj

    def delete(self):
        """Don't destroy the posts, just remove the relation."""
        inbox = self.get_object()

        inbox.posts.clear()
        inbox.comments.clear()
        inbox.likes.clear()
        inbox.follows.clear()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def list(self, request, *args, **kwargs):
        response = self.inbox_response_template
        response['author'] = self.get_author_id()
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response[self._items] = serializer.data
            return self.get_paginated_response(response)
        
        serializer = self.get_serializer(queryset, many=True)
        response[self._items] = serializer.data
        return Response(response)
    
    def create(self, request, *args, **kwargs):
        object = self.request.data.copy()
        adapter = RemoteAdapter(object)
        adapted_object = adapter.adapt_data()
        request.data.update(adapted_object)
        content_type = request.data['type']

        # If the object already exists on server, skip creation
        serializer = self.get_serializer(data=request.data)
        try:
            if content_type == 'post':
                obj = Post.objects.get(id=request.data['id'])
            elif content_type == 'comment':
                obj = Comment.objects.get(id=request.data['id'])
            elif content_type == 'like':
                obj = Like.objects.get(object=request.data['object'], author__id=request.data['author']['id'])
            elif content_type == 'follow':
                obj = Follow.objects.get(actor__id=request.data['actor']['id'], object__id=request.data['object']['id'])
            response = Response(status=status.HTTP_201_CREATED)
        except:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)

            response = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        # Link the local copy to the inbox
        inbox = self.get_object()
        if content_type == 'post':
            post = get_object_or_404(Post.objects.all(), id=request.data['id'])
            inbox.posts.add(post)
        elif content_type == 'like':
            like = get_object_or_404(Like.objects.all(), object=request.data['object'], author__id=request.data['author']['id'])
            inbox.likes.add(like)
        elif content_type == 'comment':
            comment = get_object_or_404(Comment.objects.all(), id=request.data['id'])
            inbox.comments.add(comment)
        elif content_type == 'follow':
            follow = get_object_or_404(Follow.objects.all(), actor__id=request.data['actor']['id'], object__id=request.data['object']['id'])
            inbox.follows.add(follow)
        return response

class PublicFeedView(ListAPIView, UtilityAPI):
    """Gathers public posts from all connected nodes."""

    authentication_classes = [JWTTokenUserAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        public_posts = self.posts_response_template
        # Get all home content first
        home_host = self.request.get_host()
        queryset = Post.objects.filter(author__host__icontains=home_host, visibility='PUBLIC')
        serializer = PublicPostSerializer(queryset, many=True)
        posts = []
        posts += serializer.data
        # public_posts[self.ritems] += serializer.data

        # Remote content
        remote_nodes = Node.objects.all()
        for node in remote_nodes:
            api_domain = node.api_domain
            api_prefix = node.api_prefix
            username = node.username
            password = node.password

            try:
                authors_url = f'{api_domain}authors/'
                authors = get(authors_url, auth=HTTPBasicAuth(username, password)).json()
                adapter = RemoteAdapter(authors)
                adapted_authors = adapter.adapt_data()
                
                for author in adapted_authors['items']:
                    author_url = author['id']
                    # Need to interpolate the api prefix as not all ids and urls are saved with it
                    slice_from = author_url.find('authors/')
                    author_uri = author['id'][slice_from:]
                    
                    posts_url = f'{api_domain}{author_uri}/posts/'
                    
                    author_posts = get(posts_url, auth=HTTPBasicAuth(username, password)).json()
                    
                    adapter = RemoteAdapter(author_posts)
                    adapted_posts = adapter.adapt_data()
   
                    # public_posts[self.ritems] += adapted_posts['items']
                    posts += adapted_posts['items']

            except Exception as e:
                print(e)
        
        public_posts[self.ritems] = posts
        return Response(data=public_posts)
    
class AdaptView(UpdateAPIView):
    """PUT to this endpoint to run content through the adapter."""

    authentication_classes = [JWTTokenUserAuthentication]
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        adapter = RemoteAdapter(request.data)
        adapted_data = adapter.adapt_data()

        return Response(adapted_data)

class InboxLikesAPIView(ListAPIView, UtilityAPI):
    """GET to this endpoint to get the likes in the inbox."""
    queryset = Inbox.objects.all()

    serializer_class = LikeSerializer

    authentication_classes = [JWTTokenUserAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()

        inbox = get_object_or_404(queryset, author__id=self.get_author_id())

        return inbox

    def list(self, request, *args, **kwargs):
        """Omit pagination."""
        response = self.inbox_response_template
        inbox = self.get_object()

        likes = inbox.likes.all()

        serializer = self.get_serializer(likes, many=True)
        response[self.ritems] = serializer.data

        return Response(response)

class InboxFollowsAPIView(ListAPIView, UtilityAPI):
    """GET to this endpoint to get the follows in the inbox."""
    queryset = Inbox.objects.all()

    serializer_class = FollowSerializer

    authentication_classes = [JWTTokenUserAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()

        inbox = get_object_or_404(queryset, author__id=self.get_author_id())

        return inbox

    def list(self, request, *args, **kwargs):
        """Omit pagination."""
        response = self.inbox_response_template
        inbox = self.get_object()

        follows = inbox.follows.all()

        serializer = self.get_serializer(follows, many=True)
        response[self.ritems] = serializer.data

        return Response(response)

class InboxCommentsAPIView(ListAPIView, UtilityAPI):
    """GET to this endpoint to get the comments in the inbox."""
    queryset = Inbox.objects.all()

    serializer_class = CommentSerializer

    authentication_classes = [JWTTokenUserAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()

        inbox = get_object_or_404(queryset, author__id=self.get_author_id())

        return inbox

    def list(self, request, *args, **kwargs):
        """Omit pagination."""
        response = self.inbox_response_template
        inbox = self.get_object()

        comments = inbox.comments.all()

        serializer = self.get_serializer(comments, many=True)
        response[self.ritems] = serializer.data

        return Response(response)
