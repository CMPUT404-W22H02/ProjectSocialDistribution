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


from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (AdaptView, AuthorDetailAPIView, AuthorLikedAPIView,
                    AuthorsAPIView, CommentLikesAPIView, CommentsAPIView,
                    FollowerDetailAPIView, FollowersAPIView, InboxAPIView, InboxCommentsAPIView,
                    PostDetailAPIView, PostLikesAPIView, PostsAPIView,
                    PublicFeedView, InboxLikesAPIView, InboxFollowsAPIView, ImagePostAPIView)
from .viewsets import LoginViewSet, RefreshViewSet, RegistrationViewSet

router = DefaultRouter()
router.register(r'register', RegistrationViewSet, basename='auth_register')
router.register(r'login', LoginViewSet, basename='auth_login')
router.register(r'refresh', RefreshViewSet, basename='auth_refresh')

urlpatterns = [
    path('authors/', AuthorsAPIView.as_view(), name='api_authors'),
    path('authors/<str:author_id>', AuthorDetailAPIView.as_view(), name='api_author_details'),
    path('authors/<str:author_id>/followers', FollowersAPIView.as_view(), name='api_followers'),
    path('authors/<str:author_id>/followers/<path:follower_id>', FollowerDetailAPIView.as_view(), name='api_follower_details'),
    path('authors/<str:author_id>/posts/', PostsAPIView.as_view(), name='api_posts'),
    path('authors/<str:author_id>/posts/<str:post_id>', PostDetailAPIView.as_view(), name='api_post_detail'),
    path('authors/<str:author_id>/posts/<str:post_id>/comments', CommentsAPIView.as_view(), name='api_comments'),
    path('authors/<str:author_id>/posts/<str:post_id>/image', ImagePostAPIView.as_view(), name='api_image_post'),

    # Likes
    path('authors/<str:author_id>/posts/<str:post_id>/likes', PostLikesAPIView.as_view(), name='api_post_likes'),
    path('authors/<str:author_id>/posts/<str:post_id>/comments/<str:comment_id>/likes', CommentLikesAPIView.as_view(), name='api_comment_likes'),
    path('authors/<str:author_id>/liked', AuthorLikedAPIView.as_view(), name='api_author_liked'),
    
    # Inbox
    path('authors/<str:author_id>/inbox', InboxAPIView.as_view(), name='api_inbox'),
    path('authors/<str:author_id>/inboxlikes', InboxLikesAPIView.as_view(), name='api_inbox_likes'),
    path('authors/<str:author_id>/inboxfollows', InboxFollowsAPIView.as_view(), name='api_inbox_follows'),
    path('authors/<str:author_id>/inboxcomments', InboxCommentsAPIView.as_view(), name='api_inbox_comments'),

    # Public feed
    path('publicposts/', PublicFeedView.as_view(), name='public_posts'),

    # Adapter
    path('adapt', AdaptView.as_view(), name='adapter'),

    # Viewsets
    *router.urls
]