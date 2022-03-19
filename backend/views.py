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

from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTTokenUserAuthentication

from socialdisto.pagination import CustomPagination
from .serializers import AuthorSerializer
from .models import Author, NodeUser

class AuthorsAPIView(ListAPIView):
    """Retrieve all authors registered on the server."""
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer
    pagination_class = CustomPagination

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        users = NodeUser.objects.all()
        return queryset.filter(user__in=users)

    def list(self, request, *args, **kwargs):
        response = {'type': 'authors', 'items': None}
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response['items'] = serializer.data
            return self.get_paginated_response(response)

        serializer = self.get_serializer(queryset, many=True)
        response['items'] = serializer.data
        return Response(response)

class AuthorDetailAPIView(RetrieveUpdateAPIView):
    queryset = Author.objects.all()

    serializer_class = AuthorSerializer

    permission_classes = [IsAuthenticatedOrReadOnly]

    http_method_names = ['get', 'post']

    def get_object(self):
        queryset = self.get_queryset()

        scheme = self.request.scheme + '://'
        host = self.request.get_host()
        id = scheme + host + self.request.path
        obj = get_object_or_404(queryset, id=id)

        return obj
    
    def check_permissions(self, request):
        if request.method == 'GET':
            self.authentication_classes = [JWTTokenUserAuthentication]
        return super().check_permissions(request)
    
    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
