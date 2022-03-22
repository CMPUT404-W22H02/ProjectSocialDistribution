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

from .models import Node

class AdapterDispatcher():
    """Dispatches the correct adapter for a request based on host."""
    pass

class AdapterBase():
    """Base adapter for all incoming content from remote Nodes."""
    def __init__(self, data):
        self.data = data

# Temporary hardcoding
class Team02Adapter(AdapterBase):
    def __init__(self, data):
        super().__init__(data)
        node = Node.objects.get_or_create(
            api_domain='https://social-dist-wed.herokuapp.com/service/',
            username='team02admin',
            password='admin'
        )

class Team05Adapter(AdapterBase):
    def __init__(self, data):
        super().__init__(data)
        # node = Node.objects.get_or_create(
        #     api_domain='https://social-dist-wed.herokuapp.com/service/',
        #     username='othergroupadmin',
        #     password='othergroupadmin'
        # )

class Team07Adapter(AdapterBase):
    def __init__(self, data):
        super().__init__(data)
        node = Node.objects.get_or_create(
            api_domain='https://c404-social-distribution.herokuapp.com/service/',
            username='othergroupadmin',
            password='othergroupadmin'
        )