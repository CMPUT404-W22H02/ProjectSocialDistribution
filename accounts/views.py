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
from rest_framework import generics
from rest_framework.response import Response

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

class AuthorList(generics.ListAPIView):
    """Get all authors on the server."""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer

    def list(self, request):
        """Override: key-value output for author list"""
        queryset = self.get_queryset()
        serializer = NodeUserSerializer(queryset, many=True)
        return Response({'type': 'authors', 'items': serializer.data})

class AuthorDetail(generics.RetrieveAPIView):
    """GET a specific author on the server by id"""
    queryset = NodeUser.objects.all()
    serializer_class = NodeUserSerializer