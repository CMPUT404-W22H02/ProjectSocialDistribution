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

from rest_framework.serializers import ModelSerializer

from .models import Comment, Inbox, Like, NodeUser, Post


class NodeUserSerializer(ModelSerializer):

    class Meta:
        model = NodeUser
        # TODO: profile image
        fields = ['type', 'id', 'url', 'host', 'display_name', 'github']

class CommentSerializer(ModelSerializer):
    author = NodeUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['type', 'author', 'comment', 'published', 'id']
        ordering_fields = ['published']

class CommentCreationSerializer(ModelSerializer):

    class Meta:
        model = Comment
        fields = '__all__'

class LikeSerializer(ModelSerializer):
    author = NodeUserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = '__all__'

class PostSerializer(ModelSerializer):
    commentSrc = CommentSerializer(read_only=True)

    class Meta:
        model = Post
        fields = '__all__'
        ordering_fields = ['published']

class InboxSerializer(ModelSerializer):

    class Meta:
        model = Inbox
        fields = ['type', 'author','posts']