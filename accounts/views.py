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

from django.views.generic.base import RedirectView
from django.views.generic.edit import CreateView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response

from socialdisto.pagination import CustomPagination

from .forms import RegistrationForm
from .models import NodeUser
from .serializers import NodeUserSerializer


class RegisterCreateView(CreateView):
    template_name = 'accounts/register.html'
    form_class = RegistrationForm

class HomeRedirectView(RedirectView):
    pattern_name = 'accounts:login'

class LoggedInRedirectView(RedirectView):
    pattern_name = 'inbox:home'

class AuthorList(ListAPIView):
    """Get all authors on the server with optional pagination."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer
    pagination_class = CustomPagination

    items = 'items'

    def list(self, request):
        """Override: key-value output for author list, pagination only enabled if query params specified"""
        template = {'type': 'authors', 'items': None }

        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            template[self.items] = serializer.data
            return self.get_paginated_response(template)
        
        serializer = self.get_serializer(queryset, many=True)
        template[self.items] = serializer.data
        return Response(template)

class AuthorDetail(RetrieveAPIView):
    """GET a specific author on the server by id"""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer