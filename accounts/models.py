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
from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db.models import (CASCADE, BooleanField, CharField, DateTimeField,
                              ForeignKey, IntegerField, ManyToManyField, Model,
                              OneToOneField, URLField, UUIDField)
from django.utils.timezone import now


class NodeUser(AbstractUser):
    # API fields
    id = URLField(primary_key=True, max_length=255)
    url = URLField()
    host = CharField(max_length=255)
    display_name = CharField(max_length=20, blank=False)
    github = URLField(blank=True)
    # TODO: profile images when server image hosting is implemented.

    # Bi-directional follow is a true friend
    followers = ManyToManyField('self')

    # TODO: admin optional enforcement of registration activation
    # Server registration management
    # account_activated = BooleanField(default=False)

    def get_absolute_url(self):
        return self.id
    
    def save(self, *args, **kwargs):
        """Link newly created author to an inbox."""
        inbox = Inbox(author=self.id)
        inbox.save()
        super(NodeUser, self).save(*args, **kwargs)

    @property
    def type(self):
        return 'author'
    
    class Meta:
        ordering = ['id']

class FollowRequest(Model):
    """Object sent to a user to request a follow relationship."""
    actor = OneToOneField(NodeUser, on_delete=CASCADE, related_name='requester')
    object = OneToOneField(NodeUser, on_delete=CASCADE, related_name='requestee')

    @property
    def type(self):
        return 'follow'
    
    class Meta:
        pass

class Post(Model):
    """Post object sent to a NodeUser inbox."""
    id = URLField(primary_key=True, blank=True)
    title = CharField(max_length=255)
    source = URLField(blank=True)
    origin = URLField(blank=True)
    description = CharField(max_length=255)

    content_choices = (
            ('text/markdown', 'text/markdown'),
            ('text/plain', 'text/plain'),
            ('application/base64', 'application/base64'),
            ('image/png;base64', 'image/png;base64'),
            ('image/jpeg;base64', 'image/jpeg;base64')
        )
    content_type = CharField(choices=content_choices, max_length=255)

    author = ForeignKey(NodeUser, on_delete=CASCADE)

    # TODO: categories: need to determine how to put a list of strings here

    count = IntegerField(default=0)
    comments = URLField(unique=True, blank=True)
    # TODO: comment_src to the serializer
    published = DateTimeField(default=datetime.isoformat(now(), sep='T', timespec='seconds'))
    visibility_choices = (
        ('PUBLIC', 'PUBLIC'),
        ('PRIVATE', 'PRIVATE')
    )
    visibility = CharField(choices=visibility_choices, max_length=255)
    unlisted = BooleanField()

    class Meta:
        pass

    def get_absolute_url(self):
        return self.id
    
    # Author id must be traceable to the server the author belongs to
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = self.author.id + f'posts/{str(uuid4())}'
            self.comments = self.id + '/comments/'

        super(Post, self).save(*args, **kwargs)

    @property
    def type(self):
        return 'post'

# TODO: Image posts
class Image(Model):
    pass

class Comment(Model):
    """Comment object sent to a NodeUser inbox, related to a specific Post."""
    author = ForeignKey(NodeUser, on_delete=CASCADE)
    comment = CharField(max_length=500)
    published = DateTimeField(default=datetime.isoformat(now(), sep='T', timespec='seconds'))
    id = URLField(primary_key=True, unique=True, blank=True)
    post = ForeignKey(Post, on_delete=CASCADE)

    @property
    def type(self):
        return 'comment'
    
    class Meta:
        pass

class Like(Model):
    """Like object sent to a NodeUser inbox, related to either a Post or a Comment."""
    summary = CharField(max_length=255)
    author = OneToOneField(NodeUser, on_delete=CASCADE)
    object = URLField()
    uuid = UUIDField(primary_key=True, default=uuid4())

    @property
    def type(self):
        return 'like'

    class Meta:
        pass

class Inbox(Model):
    author = URLField(primary_key=True)
    posts = ManyToManyField(Post)

    @property
    def type(self):
        return 'inbox'
