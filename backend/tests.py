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

from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED
from rest_framework.test import (APIRequestFactory, APITestCase,
                                 force_authenticate)

from .models import Author, NodeUser
from .views import AuthorsAPIView
from .viewsets import RegistrationViewSet


class GenericTestCase(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self._username = 'username'
        self._display_name = 'display_name'
        self._id = 'id'
        self._url = 'url'
        self._hostname = 'hostname'

        self.mock_users = [
            {self._username: 'tuser1', 'password': 'tpass1', self._display_name: 'Test User1'},
            {self._username: 'tuser2', 'password': 'tpass2', self._display_name: 'Test User2'}
        ]
    
    def register_mock_users(self):
        for user in self.mock_users:
            request = self.factory.post('/register/', user)

            response = RegistrationViewSet.as_view(actions={'post': 'create'})(request)
        
            self.assertEqual(response.status_code, HTTP_201_CREATED)

            # Save token to authenticate tests
            token = response.data['token']
            self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

class RegistrationAPITestCase(GenericTestCase):
    def setUp(self):
        super().setUp()
    
    def test_registration(self):
        super().setUp()
        self.register_mock_users()

class AuthorsAPITestCase(GenericTestCase):
    def setUp(self):
        super().setUp()
        self.register_mock_users()
        self.registered_users = len(self.mock_users)
    
    def test_author_created(self):
        request = self.factory.get('/authors/')
        
        force_authenticate(request)
        response = AuthorsAPIView.as_view()(request)

        self.assertContains(response, 'Test User1', status_code=HTTP_200_OK, count=1)
        self.assertContains(response, 'Test User2', status_code=HTTP_200_OK, count=1)

class AuthorDetailsAPITestCase(GenericTestCase):
    def setUp(self):
        super().setUp()
        self.register_mock_users()
    
    def test_author_details(self):
        queryset = Author.objects.all()

        for author in queryset:
            response = self.client.get(author.id)

            self.assertContains(response, 'type')
            self.assertContains(response, 'author')
            self.assertContains(response, 'id')
            self.assertContains(response, 'url')
            self.assertContains(response, 'host')
            self.assertContains(response, 'github')
            # TODO: profile_image

            self.assertContains(response, author.id)
            self.assertContains(response, author.url)
            self.assertContains(response, author.display_name)

class FollowersAPITestCase(GenericTestCase):
    def setUp(self):
        super().setUp()
        self.register_mock_users()

        self.author1 = Author.objects.get(display_name=self.mock_users[0][self._display_name])
        self.author2 = Author.objects.get(display_name=self.mock_users[1][self._display_name])
    
    def test_no_followers(self):
        queryset = Author.objects.all()

        for author in queryset:
            url = author.id + '/followers'
            response = self.client.get(url)

            self.assertContains(response, 'type')
            self.assertContains(response, 'followers')
            self.assertContains(response, 'items')

            self.assertNotContains(response, self.author1.id)
            self.assertNotContains(response, self.author2.id)
    
    def test_add_follower_unidirectional(self):
        url = self.author1.id + '/followers/' + self.author2.id
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTP_200_OK)

        response = self.client.get(url)
        self.assertContains(response, self.author2.id)

        # Should not be symmetric
        url = self.author2.id + '/followers/' + self.author1.id
        response = self.client.get(url)
        self.assertNotContains(response, self.author1.id)

        # Complete the relationship
        response = self.client.put(url)
        response = self.client.get(url)
        self.assertContains(response, self.author1.id)
    
    def test_follower_delete(self):
        url = self.author1.id + '/followers/' + self.author2.id
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTP_200_OK)

        # Verify the relationship exists at both endpoints
        url = self.author1.id + '/followers'
        response = self.client.get(url)
        self.assertContains(response, self.author2.id)

        url = self.author1.id + '/followers/' + self.author2.id
        response = self.client.get(url)
        self.assertContains(response, self.author2.id)

        # Delete and verify the relationship is gone
        response = self.client.delete(url)
        self.assertNotContains(response, self.author2.id)