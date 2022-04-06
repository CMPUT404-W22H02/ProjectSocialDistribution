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

from datetime import datetime

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager, PermissionsMixin
from django.db.models import (CASCADE, BooleanField, CharField, DateTimeField,
                              ForeignKey, IntegerField, JSONField,
                              ManyToManyField, Model, OneToOneField, URLField, ImageField)
from django.utils.timezone import now
from .storage import OverwriteStorage

URL_MAX = 255
CHAR_MAX = 255

def profile_img_path(instance, filename):
    id = instance.id.split("/")[-1]
    fileExtension = filename.split(".")[-1]
    return 'profile/{user}/{fileName}'.format(user=id, fileName="profile."+fileExtension)

def post_img_path(instance, filename):
    return 'posts/{filename}'.format(filename=filename)

class Node(Model):
    api_domain = URLField(primary_key=True)
    api_prefix = CharField(max_length=255, blank=True, null=True)
    username = CharField(max_length=255)
    password = CharField(max_length=255)

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
    # profile_image = URLField(blank=True)
    profile_image = ImageField(upload_to=profile_img_path, blank=True, null=True, storage=OverwriteStorage())

    # TODO: profile image

    user = ForeignKey(NodeUser, on_delete=CASCADE, null=True)

    followers = ManyToManyField('self', symmetrical=False)

    class Meta:
        ordering = ['-id']

    @property
    def type(self):
        return 'author'
    
    def get_absolute_url(self):
        return self.id

class Like(Model):
    object = URLField(blank=True)
    author = ForeignKey(Author, on_delete=CASCADE, null=True)

    @property
    def type(self):
        return 'like'

class Post(Model):
    id = URLField(primary_key=True, blank=True)
    title = CharField(max_length=50, blank=True)
    source = URLField(blank=True)
    origin = URLField(blank=True)
    description = CharField(max_length=50, blank=True)

    content_type = CharField(blank=True, max_length=255, null=True)
    content = CharField(blank=True, max_length=5000, null=True)

    author = ForeignKey(Author, on_delete=CASCADE, null=True)
    image = ImageField(upload_to=post_img_path, blank=True, null=True)
    image_id = URLField(blank=True)

    # SQLite does not support JSONField, so only enable for production
    categories = JSONField(default=list)
    # categories = CharField(max_length=255, blank=True, null=True)

    # Comment data
    count = IntegerField(default=0)
    comments = URLField(blank=True)
    comments_src = URLField(blank=True, null=True)

    # Post meta-data
    published = DateTimeField(default=datetime.isoformat(now(), sep='T', timespec='seconds'), editable=False)
    visibility_choices = (
        ('PUBLIC', 'PUBLIC'),
        ('FRIENDS', 'FRIENDS')
    )
    visibility = CharField(default='PUBLIC', choices=visibility_choices, max_length=255)
    unlisted = BooleanField(default=False)

    class Meta:
        ordering = ['-published']
    
    def get_absolute_url(self):
        return self.id
    
    @property
    def type(self):
        return 'post'

class Comment(Model):
    author = ForeignKey(Author, on_delete=CASCADE)
    comment = CharField(max_length=500)

    published = DateTimeField(default=datetime.isoformat(now(), sep='T', timespec='seconds'), editable=False)
    id = URLField(primary_key=True, blank=True)

    post = ForeignKey(Post, on_delete=CASCADE, null=True)

    class Meta:
        ordering = ['-published']

    @property
    def type(self):
        return 'comment'
    
class Follow(Model):
    """Actor wants to follow the object."""
    actor = ForeignKey(Author, on_delete=CASCADE, related_name='sender')
    object = ForeignKey(Author, on_delete=CASCADE, related_name='recipient')

    class Meta:
        pass

    @property
    def type(self):
        return 'follow'

class Inbox(Model):
    author  = OneToOneField(Author, on_delete=CASCADE, related_name='author_inbox')
    posts = ManyToManyField(Post, related_name='inbox_posts')
    comments = ManyToManyField(Comment)
    likes = ManyToManyField(Like)
    follows = ManyToManyField(Follow)

    @property
    def type(self):
        return 'inbox'
