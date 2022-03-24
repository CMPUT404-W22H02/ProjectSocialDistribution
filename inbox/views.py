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


from django.http import Http404, HttpResponse
from django.template.response import TemplateResponse
from django.urls import reverse
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.mixins import DestroyModelMixin

from accounts.models import Inbox, Post
from accounts.serializers import (FollowRequestSerializer, LikeSerializer,
                                  PostSerializer)
from socialdisto.pagination import CustomPagination


class InboxxView(ListCreateAPIView, DestroyModelMixin):
    
    queryset = Post.objects.all()
    pagination_class = CustomPagination

    _items = 'items'

    def get(self, request, template_name='accounts/inbox.html',*args, **kwargs):
        template = {'type': 'inbox', 'author': f'http://{self.author_id()}', self._items: None}
        queryset = self.get_queryset()
        
        try:
            inbox = Inbox.objects.filter(author__id__contains=self.author_id())
            queryset = queryset.filter(inbox__in=inbox)
        except:
            raise Http404
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[self._items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[self._items] = serializer.data
        author=self.author_id()
        new_list = template[self._items]
        context={'author': author,
                'template': new_list, 'uid':request.user.id, 'author_id': self.kwargs['author_id']}

        return TemplateResponse(request, template_name, context)

    def delete(self, request, template_name='accounts/inbox.html',*args, **kwargs):
        if (not request.user or request.user.is_anonymous):
            return HttpResponse('Unauthorized', status=401)
       
        try:

            inbox = Inbox.objects.filter(author__id__contains=self.author_id())
            if(inbox):
                for each in inbox:
                    each.delete()
            context={'uid':request.user.id, 'author_id': self.kwargs['author_id']}

            return HttpResponse(status=status.HTTP_204_NO_CONTENT)
        except:
            return Http404



    def get_serializer_class(self):
        if self.request.method == 'GET':

            return PostSerializer

        elif self.request.method == 'POST':
            # Must be a type in the payload
            if self._type not in self.request.data.keys():
                return PostSerializer

            if self.request.data[self._type] == 'post':
                return PostSerializer
            elif self.request.data[self._type] == 'follow':
                return FollowRequestSerializer
            elif self.request.data[self._type] == 'like':
                return LikeSerializer
        
    def author_id(self):
        """Return AUTHOR_ID with hostname prefix."""
        key = 'author_id'
        view_name = 'accounts:api_author_details'
        kwargs = {key: self.kwargs[key]}
        return self.request.get_host() + reverse(view_name, kwargs=kwargs)