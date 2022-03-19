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
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.serializers import (TokenObtainPairSerializer,
                                                  api_settings)

from .models import Author, NodeUser


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