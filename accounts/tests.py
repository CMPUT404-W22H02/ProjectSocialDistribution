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
from django.test import TestCase
from rest_framework import status

from .models import NodeUser


class PermissionTests(TestCase):
    """Test redirect for unauthenticated access."""
    def test_login_redirect(self):
        url = reverse('inbox:home')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

class APITestCase(TestCase):
    """REST API test case setUp boilerplate."""
    def setUp(self):
        self.pk = 'id'
        self.username = 'username'
        self.display = 'display_name'
        self.github = 'github'
        self.host = 'host'

        self.u1_uuid = str(uuid4())
        self.u1 = {self.pk: '/authors/'+self.u1_uuid+'/', self.username: 'johndoe', self.display: 'John Doe',
                    self.github: 'https://github.com/jondoe'}
        NodeUser.objects.create(id=self.u1[self.pk], username=self.u1[self.username], display_name=self.u1[self.display], 
                                github=self.u1[self.github])
        
        self.u2_uuid = str(uuid4())
        self.u2 = {self.pk: '/authors/'+self.u2_uuid+'/', self.username: 'janendoe', self.display: 'Jane Doe',
                    self.github: 'https://github.com/janedoe'}
        NodeUser.objects.create(id=self.u2[self.pk], username=self.u2[self.username], display_name=self.u2[self.display], 
                                github=self.u2[self.github])
    
class AuthorListTests(APITestCase):
    """Test GET service/authors/."""   
    def test_get_success(self):
        """GET /authors/ success."""
        response = self.client.get('/authors/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.u1[self.pk])
    
    def test_pagination(self):
        """GET /authors/?page=1&size=1 should split into 2 pages."""
        response = self.client.get('/authors/?page=1&size=1')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, 'count')
        self.assertContains(response, 'next')
        self.assertContains(response, 'previous')
        self.assertContains(response, 'results')

        response = self.client.get('/authors/?page=2&size=1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class SingleAuthorTests(APITestCase):
    """Test GET service/authors/AUTHOR_ID/."""
    def test_get_success(self):
        """GET /authors/AUTHOR_ID/ success."""
        response = self.client.get(f'/authors/{self.u1_uuid}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.u1[self.pk])
        self.assertContains(response, self.u1[self.display])
        self.assertContains(response, self.u1[self.github])

        response = self.client.get(f'/authors/{self.u2_uuid}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.u2[self.pk])
        self.assertContains(response, self.u2[self.display])
        self.assertContains(response, self.u2[self.github])
    
    def test_get_404(self):
        """GET /authors/AUTHOR_ID/ NOT FOUND."""
        response = self.client.get('/authors/11111/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)




# class APITestCase(TestCase):
#     """Setup boilerplate configuration and NodeUser querystring lookups."""
#     def create_users(self):
#         self.kwarg_display_name = 'display_name'
#         self.kwarg_user_name = 'username'
#         self.kwarg_github = 'github'
#         self.node_users = [
#             {self.kwarg_display_name: 'John Doe', self.kwarg_user_name: 'johndoe'},
#             {self.kwarg_display_name: 'Jane Doe', self.kwarg_user_name: 'janedoe'}
#         ]

#         for user in self.node_users:
#             NodeUser.objects.create(display_name=user[self.kwarg_display_name], username=user[self.kwarg_user_name])
    
#     def set_url(self, url_name, *args, **kwargs):
#         self.url = reverse(url_name, kwargs=kwargs)
    
#     def uriencode(self, url):
#         key = 'url'
#         return urlencode({'url': url})[len(key)+1:]
    
#     def set_disallowed_methods(self, disallowed):
#         self.disallowed_methods = disallowed
    
#     def set_pagination_defaults(self, page, size):
#         self.page = page
#         self.size = size
    
#     def get_author_id(self, display_name):
#         return NodeUser.objects.filter(display_name=display_name).values('uuid_id')[0]['uuid_id']
    
#     def get_author_url(self, display_name):
#         return NodeUser.objects.filter(display_name=display_name).values('id')[0]['id']

# class APIAuthorsTests(APITestCase):
#     """Test authors/ URI."""
#     def setUp(self):
#         self.create_users()
#         self.url_name = 'accounts:api_author_list'
#         self.set_url(self.url_name)
#         self.set_disallowed_methods([self.client.post, self.client.delete, self.client.put])
#         self.set_pagination_defaults(page=1, size=1)
    
    # Re-enable once refactors with LiveServerTestCase are complete
    # def test_authors_success(self):
    #     """GET authors/ success."""
    #     response = self.client.get(self.url)

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)

    #     for user in self.node_users:
    #         self.assertContains(response, user[self.kwarg_display_name])

    # def test_authors_pagination_success(self):
    #     """Test correctness of pagination response fields, GET authors/?page=#size=# success."""
    #     self.page = 1
    #     self.size = 1
    #     url = self.url + self.pagination_params
    #     response = self.client.get(url)

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     # Should these fail, pagination scheme may have changed and should be checked to still work.
    #     self.assertContains(response, 'count')
    #     self.assertContains(response, 'next')
    #     self.assertContains(response, 'previous')
    #     self.assertContains(response, 'results')
    
    # Re-enable once refactors with LiveServerTestCase are complete
    # def test_authors_pagination_next(self):
    #     """Test second page of pagination from test_authors_pagination_success()."""
    #     self.page = 2
    #     self.size = len(self.node_users) - 1
    #     url = self.url + self.pagination_params
    #     response = self.client.get(url)
    #     breakpoint()

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    
#     def test_authors_pagination_404(self):
#         """Test page outside of pagination range returns 404."""
#         page = len(self.node_users) + 1
#         size = 1
#         url = self.url + self.pagination_params
#         response = self.client.get(url)
    
#     def test_authors_method_not_allowed(self):
#         """Test disallowed methods return 405."""
#         for method in self.disallowed_methods:
#             response = method(self.url)

#             self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

#     @property
#     def pagination_params(self):
#         return f'?page={self.page}&size={self.size}'

# class APIAuthorProfileTests(APITestCase):
#     """Tests authors/{AUTHOR_ID} URI."""
#     def setUp(self):
#         self.create_users()
#         self.url_name = 'accounts:api_author_details'
#         self.set_disallowed_methods([self.client.delete, self.client.put])
    
#     def test_author_profile_found(self):
#         """GET authors/{author_id} success."""
#         for user in self.node_users:
#             id = self.get_author_id(user[self.kwarg_display_name])
#             self.set_url('accounts:api_author_details', id=id)
#             response = self.client.get(self.url)

#             self.assertEqual(response.status_code, status.HTTP_200_OK)
#             self.assertContains(response, user[self.kwarg_display_name])
    
    # def test_author_profile_404(self):
    #     """GET authors/{author_id} 404."""
    #     self.set_url(self.url_name, pk='AuthorIdDoesNotExist')
    #     response = self.client.get(self.url)

    #     self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    # def test_author_profile_full_update_success(self):
    #     """POST authors/{author_id} success, all editable fields modified."""
    #     updates = [
    #         {self.kwarg_display_name: 'Jon Doe', self.kwarg_github: 'https://github.com/jondoe'},
    #         {self.kwarg_display_name: 'Janet Doe', self.kwarg_github: 'https://github.com/janetdoe'}
    #     ]
    #     for user, update in zip(self.node_users, updates):
    #         id = self.get_author_id(user[self.kwarg_display_name])
    #         self.set_url(self.url_name, id=id)
            
    #         response = self.client.post(self.url, data={self.kwarg_display_name: update[self.kwarg_display_name], 
    #                                                     self.kwarg_github: update[self.kwarg_github]})
            
    #         self.assertEqual(response.status_code, status.HTTP_200_OK)

    #         # Verify updates
    #         response = self.client.get(self.url)
    #         self.assertContains(response, update[self.kwarg_display_name])
    #         self.assertContains(response, update[self.kwarg_github])
    
    # def test_author_profile_partial_update_success(self):
    #     """Post authors/{author_id} success, one editable field modified."""
    #     updates = [
    #         {self.kwarg_github: 'https://github.com/jondoe'},
    #         {self.kwarg_github: 'https://github.com/janetdoe'}
    #     ]
    #     for user, update in zip(self.node_users, updates):
    #         id = self.get_author_id(user[self.kwarg_display_name])
    #         self.set_url(self.url_name, id=id)

    #         response = self.client.post(self.url, data={self.kwarg_github: update[self.kwarg_github]})

    #         self.assertEqual(response.status_code, status.HTTP_200_OK)

    #         # Verify partial update
    #         response = self.client.get(self.url)
    #         self.assertContains(response, update[self.kwarg_github])
    #         self.assertContains(response, user[self.kwarg_display_name])
    
    # def test_author_profile_bad_requests(self):
    #     """Test disallowed methods return 405."""
    #     for user, method in zip(self.node_users, self.disallowed_methods):
    #         id = self.get_author_id(user[self.kwarg_display_name])
    #         self.set_url(self.url_name, id=id)
    #         response = method(self.url)

    #         self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

# class APIFollowersTests(APITestCase):
#     """Test authors/{AUTHOR_ID}/followers URI."""
#     def setUp(self):
#         self.create_users()
#         self.url_name = 'accounts:api_followers'
#         self.set_disallowed_methods([self.client.post, self.client.delete, self.client.put])
    
#     def test_followers_success(self):
#         """GET authors/{AUTHOR_ID}/followers success."""
#         for user in self.node_users:
#             id = self.get_author_id(user[self.kwarg_display_name])
#             self.set_url(self.url_name, pk=id)
#             response = self.client.get(self.url)

#             self.assertEqual(response.status_code, status.HTTP_200_OK)

# TODO: need to configure HOST_NAME to actually test the followers/... URI methods
# as it makes additional HTTP requests.
# class APIFollowerActions(APITestCase):
#     """Test authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID}"""
#     def setUp(self):
#         self.create_users()
#         self.url_name = 'accounts:api_follower_action'
#         self.set_disallowed_methods([self.client.post])
    
#     def test_follower_add_success(self):
#         """PUT authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID} success."""
#         pk = self.get_author_id('John Doe')
#         breakpoint()
#         fk = self.uriencode(self.get_author_url('Jane Doe'))
        
#         self.set_url(self.url_name, pk=pk, fk=fk)
#         response = self.client.put(self.url)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
    
#     def test_follower_check_success(self):
#         """GET authors/{AUTHOR_ID}/followers/{FOREIGN_AUTHOR_ID} success."""


# class FollowersTests(TestCase):
#     """Test followers/ endpoints."""
#     def setUp(self):
#         NodeUser.objects.create(display_name='John Doe', username='johndoe')
#         NodeUser.objects.create(display_name='Jane Doe', username='janedoe')
    
#     def test_author_followers_all_success(self):
#         """Test authors/{id}/followers/ endpoint success."""
#         id = NodeUser.objects.filter(display_name='John Doe').values('uuid_id')[0]
#         url = reverse('accounts:api_followers', kwargs={'pk': id['uuid_id']})
#         response = self.client.get(url)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
    
#     def test_author_followers_404(self):
#         """Author or foreign id not found for authors/{id}/{followers/{f_id} endpoint."""
    
#     def test_author_followers_not_follower(self):
#         """Test authors/{id}/followers/{f_id} where f_id is *not* following id."""
#         id = NodeUser.objects.filter(display_name='John Doe').values('uuid_id')[0]
#         f_id = NodeUser.objects.filter(display_name='Jane Doe').values('id')[0]
#         # f_id must be the full url authors/{id} endpoint of that user and be uriencoded, as the author may be remote.
#         # slice off the 'url=' prefix
#         f_id = urlencode(f_id)[3:]
#         url = reverse('accounts:api_follower_exists', kwargs={'pk': id['uuid_id'], 'fk': f_id})
#         response = self.client.get(url)
        
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertContains(response, 'false')
