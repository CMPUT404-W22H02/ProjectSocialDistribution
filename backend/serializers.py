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

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import update_last_login
from django.shortcuts import get_object_or_404
from rest_framework.serializers import (ModelSerializer, ReadOnlyField,
                                        SerializerMethodField)
from rest_framework_simplejwt.serializers import (TokenObtainPairSerializer,
                                                  api_settings)

from socialdisto.pagination import CommentPagination

from .models import Author, Comment, Follow, Like, NodeUser, Post


class NodeUserSerializer(ModelSerializer):

    class Meta:
        model = NodeUser
        fields = ['username']

class AuthorSerializer(ModelSerializer):

    class Meta:
        model = Author
        fields = ['type', 'id', 'url', 'host', 'display_name', 'github']

class LoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data['user'] = RegistrationSerializer(self.user).data
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)
        
        return data

class RegistrationSerializer(ModelSerializer):

    class Meta:
        model = NodeUser
        fields = ['username', 'password']
    
    def validate_password(self, value):
        return make_password(value)

class AuthorCreationSerializer(ModelSerializer):

    class Meta:
        model = Author
        fields = '__all__'

class PostDetailsSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Post.type))
    author = AuthorSerializer(read_only=True)
    comment_src = SerializerMethodField('paginate_comment_src')
    
    class Meta:
        model = Post
        fields = '__all__'
    
    def paginate_comment_src(self, obj):
        comments = Comment.objects.filter(post=obj)
        paginator = CommentPagination()
        page = paginator.paginate_queryset(comments)
        serializer = CommentSerializer(page, many=True)
        return serializer.data
    
class PostCreationSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Post.type))

    class Meta:
        model = Post
        fields = '__all__'
    
    def create(self, validated_data):
        validated_data['id'] = self.context['id']
        validated_data['author'] = self.context['author']
        validated_data['comments'] = self.context['comments']
        return super().create(validated_data)

class PostSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Post.type))
    author = AuthorSerializer()

    class Meta:
        model = Post
        fields = '__all__'

class CommentSerializer(ModelSerializer):
    """Use to serialize the first 5 comments nested in a Post object."""
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['type', 'author', 'comment', 'published', 'id']
        ordering_fields = ['-published']

class CommentCreationSerializer(ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
    
    def create(self, validated_data):
        validated_data['id'] = self.context['id']
        validated_data['post'] = self.context['post']
        validated_data['author'] = self.context['author']
        return super().create(validated_data)

class LikeSerializer(ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['type', 'author', 'object']

class FollowSerializer(ModelSerializer):
    """Object and author may already exist on the server."""
    type = ReadOnlyField(default=str(Follow.type))
    author = AuthorSerializer()
    object = AuthorSerializer()

    class Meta:
        model = Follow
    
    def create(self, validated_data):
        # Check to see if the author exists on server before creating
        breakpoint()
        try:
            author = Author.objects.get(validated_data['id'])
            return author
        except:
            return super().create(validated_data)

class InboxPostSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Post.type))

    class Meta:
        model = Post
        exclude = ['author']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['author']
        return super().create(validated_data)

class InboxCommentSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Comment.type))

    class Meta:
        model = Comment
        exclude = ['author', 'post']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['author']
        validated_data['post'] = self.context['post']
        return super().create(validated_data)

class InboxLikeSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Like.type))

    class Meta:
        model = Like
        exclude = ['author']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['author']
        return super().create(validated_data)

class InboxFollowSerializer(ModelSerializer):
    type = ReadOnlyField(default=str(Follow.type))

    class Meta:
        model = Follow
        exclude = ['actor', 'object']
    
    def create(self, validated_data):
        validated_data['actor'] = self.context['actor']
        validated_data['object'] = self.context['object']
        return super().create(validated_data)
