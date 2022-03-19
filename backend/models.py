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

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager, PermissionsMixin
from django.db.models import (CASCADE, BooleanField, CharField, ForeignKey,
                              Model, URLField, ManyToManyField)

URL_MAX = 255
CHAR_MAX = 255

class NodeUserManager(BaseUserManager):
    """Create and assign an author to a user once created."""
    def create_user(self, username, password):
        if not username:
            raise ValueError('Username is required.')
        if not password:
            raise ValueError('Password is required.')
        
        user = self.model(
            username=username
        )

        user.set_password(password)
        user.save(using=self._db)

        return user
    
    def create_superuser(self, username, password):
        user = self.create_user(username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)

        return user

class NodeUser(AbstractBaseUser, PermissionsMixin):
    username = CharField(max_length=20, blank=False, null=False, unique=True)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_admin = BooleanField(default=False)

    USERNAME_FIELD = 'username'

    REQUIRED_FIELDS = []

    objects = NodeUserManager()

class Author(Model):
    id = URLField(primary_key=True, max_length=URL_MAX)
    url = URLField(blank=True)
    host = CharField(max_length=CHAR_MAX, blank=True)
    display_name = CharField(max_length=CHAR_MAX, blank=False)
    github = URLField(blank=True)

    # TODO: profile image

    user = ForeignKey(NodeUser, on_delete=CASCADE)

    followers = ManyToManyField('self', symmetrical=False)

    @property
    def type(self):
        return 'author'
    
    def get_absolute_url(self):
        return self.id
