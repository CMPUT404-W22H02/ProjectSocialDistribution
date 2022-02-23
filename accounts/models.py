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

from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from django.db.models import ManyToManyField
from django.db.models import BooleanField, CharField, URLField, UUIDField
from django.urls import reverse


class NodeUser(AbstractUser):
    uuid_id = UUIDField(primary_key=True, default=uuid4, editable=False)
    id = URLField()
    url = URLField()
    host = URLField()
    display_name = CharField(max_length=20, blank=False)
    github = URLField()

    # Bi-directional follow is a true friend
    followers = ManyToManyField('self', symmetrical=False)

    account_activated = BooleanField(default=False)

    def get_absolute_url(self):
        return reverse('accounts:api_author', args=[str(self.uuid_id)])
    
    # Author id must be traceable to the server the author belongs to
    def save(self, *args, **kwargs):
        protocol = 'http://'
        self.id = protocol + self.host + self.get_absolute_url()
        self.url = self.id
        super(NodeUser, self).save(*args, **kwargs)

    @property
    def type(self):
        return 'author'
    
    class Meta:
        ordering = ['uuid_id']
