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

from base64 import b64encode
from uuid import uuid4

from django.test import tag
from rest_framework.status import (HTTP_200_OK, HTTP_201_CREATED,
                                   HTTP_204_NO_CONTENT, HTTP_401_UNAUTHORIZED,
                                   HTTP_404_NOT_FOUND)
from rest_framework.test import APIRequestFactory, APITestCase

from .models import Author, Like
from .viewsets import LoginViewSet, RefreshViewSet, RegistrationViewSet


class GenericTestCase(APITestCase):
    """Test Case is authenticated by default."""
    def setUp(self):
        self.factory = APIRequestFactory()
        self.host = 'http://testserver/'

        # Register mock users and authenticate the Test Case
        users = self.mock_users()
        for user in users:
            request = self.factory.post('/register/', user)

            response = RegistrationViewSet.as_view(actions={"post": "create"})(request)
            self.assertEqual(response.status_code, HTTP_201_CREATED)
        
        self.authenticate()
    
    def tearDown(self):
        """Reset auth between Test Cases."""
        self.reset_auth()
    
    def authenticate(self):
        """Call to obtain token for the APIClient."""
        self.factory = APIRequestFactory()

        user = self.mock_users()[0]
        request = self.factory.post('/login/', user)
        response = LoginViewSet.as_view(actions={"post": "create"})(request)

        # Validate token refresh scheme
        refresh = response.data['refresh']
        request = self.factory.post('/refresh/', {"refresh": refresh})
        response = RefreshViewSet.as_view(actions={"post": "create"})(request)
        access = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)

    def reset_auth(self):
        """Remove auth token from the APIClient."""    
        self.client.credentials()
    
    def mock_users(self):
        self._username = 'username'
        self._display_name = 'display_name'
        users = [
            {
                self._username: "tuser1",
                self._display_name: "Test User1",
                "password": "tpass1",
            },
            {
                self._username: "tuser2",
                self._display_name: "Test User2",
                "password": "tpass2",
            }
        ]
        return users
    
    def mock_authors(self):
        """Author objects corresponding to the mock users."""
        self.author1 = Author.objects.get(display_name='Test User1')
        self.author2 = Author.objects.get(display_name='Test User2')
        self.authors = [self.author1, self.author2]
    
    def mock_post(self):
        post = {
            "type": "post",
            "title": "Hello, World!",
            "id": "",
            "source": "",
            "origin": "",
            "author": "",
            "description": "",
            "count": 0,
            "comments": "",
            "published": "",
            "visibility": "PUBLIC",
            "unlisted": False
        }
        return post
    
    def expected_post_keys(self):
        expected = self.mock_post()
        expected.update(
            {
                "comment_src": "",
            }
        )
        return expected.keys()
    
    def basic_authenticate(self):
        """Call to set basic HTTP auth credentials to the client."""
        user1 = self.mock_users()[0]
        username = user1['username']
        password = user1['password']
        credentials = f'{username}:{password}'
        credential_bytes = credentials.encode('ascii')
        base64_bytes = b64encode(credential_bytes)
        base64_credentials = base64_bytes.decode('ascii')
        self.client.credentials(HTTP_AUTHORIZATION=f'Basic {base64_credentials}')

class AuthorListAPITests(GenericTestCase):
    """GET authors/."""
    def setUp(self):
        super().setUp()
        self.mock_authors()
        self.url = f'{self.host}authors/'

    def test_unauthenticated(self):
        self.reset_auth()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_authenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, HTTP_200_OK)

        self.basic_authenticate()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, HTTP_200_OK)

    def test_response_content(self):
        response = self.client.get(self.url)
        data = response.data
        
        assert 'type' in data.keys()
        assert 'items' in data.keys()
        self.assertEqual(data['type'], 'authors')

        items = data['items']
        fields = {'type', 'id', 'url', 'host', 'display_name', 'github'}

        # Verify all author keys present in response
        for item in items:
            for k in item.keys():
                assert k in fields
        
        # Content verification
        for item in items:
            if item['id'] == self.author1.id:
                self.assertEqual(item['url'], self.author1.id)
                self.assertEqual(item['display_name'], self.author1.display_name)
                self.assertEqual(item['host'], self.author1.host)
                self.assertEqual(item['github'], self.author1.github)
            elif item['id'] == self.author2.id:
                self.assertEqual(item['url'], self.author2.id)
                self.assertEqual(item['display_name'], self.author2.display_name)
                self.assertEqual(item['host'], self.author2.host)
                self.assertEqual(item['github'], self.author2.github)
    
    def test_pagination(self):
        response = self.client.get(f'{self.url}?page=1&size=1')
        self.assertContains(response, 'id', count=1)

class AuthorDetailsAPITests(GenericTestCase):
    """GET, POST authors/<id>."""
    def setUp(self):
        super().setUp()
        self.mock_authors()
        self.urls = [self.author1.url, self.author2.url]
        self.methods = [self.client.get, self.client.post]
        self.local_only_methods = [self.client.post]

        self.author1_expected = {
            "type": "author",
            "id": self.author1.id,
            "url": self.author1.url,
            "host": self.author1.host,
            "github": self.author1.github,
            "display_name": self.author1.display_name
        }

    def test_unauthenticated(self):
        self.reset_auth()
        for method, url in zip(self.methods, self.urls):
            response = method(url)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        # POST local only
        self.basic_authenticate()
        for url, method in zip(self.urls, self.local_only_methods):
            response = method(url)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_authenticated(self):
        for method, url in zip(self.methods, self.urls):
            response = method(url)
            self.assertEqual(response.status_code, HTTP_200_OK)
        
        # Can remote GET
        self.basic_authenticate()
        for url in self.urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, HTTP_200_OK)
    
    def test_404(self):
        for method, url in zip(self.methods, self.urls):
            response = method(url)
            self.assertEqual(response.status_code, HTTP_200_OK)
    
    def test_get_author_content(self):
        response = self.client.get(self.author1.url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        
        data = response.data
        for key in data.keys():
            assert key in self.author1_expected.keys()
            self.assertEqual(data[key], self.author1_expected[key])
    
    def test_post_author_updates(self):
        update = {
            "display_name": "Test User100"
        }
        expected = self.author1_expected
        expected.update(update)
        response = self.client.post(self.author1.url, data=update)
        self.assertEqual(response.status_code, HTTP_200_OK)
        
        data = response.data
        for key in data.keys():
            assert key in expected.keys()
            self.assertEqual(data[key], expected[key])

class FollowerDetailAPITests(GenericTestCase):
    """GET, PUT, DELETE authors/<id>/followers/<id>."""
    def setUp(self):
        super().setUp()
        self.mock_authors()
        self.url1 = f'{self.author1.id}/followers/{self.author2.id}'
        self.url2 = f'{self.author2.id}/followers/{self.author1.id}'
        self.urls = [self.url1, self.url2]
        self.methods = [self.client.get, self.client.put, self.client.delete]
        self.local_only_methods = [self.client.put, self.client.delete]
        self.remote_methods = [self.client.get]
    
    def test_unauthenticated(self):
        self.reset_auth()
        for method in self.methods:
            response = method(self.url1)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        self.basic_authenticate()
        for method in self.local_only_methods:
            response = method(self.url1)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_authenticated(self):
        for method in self.methods:
            response = method(self.url1)
            self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        self.basic_authenticate()
        for method in self.remote_methods:
            response = method(self.url1)
            self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_get_follower(self):
        for url in self.urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, HTTP_200_OK)
    
    def test_put_follower(self):
        for url in self.urls:
            response = self.client.put(url)
            self.assertEqual(response.status_code, HTTP_200_OK)
    
    def test_delete_follower(self):
        for url in self.urls:
            response = self.client.delete(url)
            # 204 on deleting relationships which do not exist
            self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)
    
    def test_follower_usage(self):
        # Create unidirectional follow
        response = self.client.put(self.url1)
        self.assertEqual(response.status_code, HTTP_200_OK)

        # Verify relationship exists
        response = self.client.get(self.url1)
        self.assertContains(response, self.author2.id)

        # Verify relationship is not symmetric
        response = self.client.get(self.url2)
        self.assertNotContains(response, self.author1.id)

        # Complete the relationship
        response = self.client.put(self.url2)
        self.assertEqual(response.status_code, HTTP_200_OK)

        # Verify completed relationship exists
        response = self.client.get(self.url2)
        self.assertContains(response, self.author1.id)

        # Remove one relationship
        response = self.client.delete(self.url1)
        self.assertEqual(response.status_code, HTTP_200_OK)

        # Verify unidirectional relationship
        response = self.client.get(self.url1)
        assert response.data['items'] == []
        response = self.client.get(self.url2)
        self.assertContains(response, self.author1.id)

        # Delete remaining relationship
        response = self.client.delete(self.url2)
        self.assertEqual(response.status_code, HTTP_200_OK)
        
        # Verify both relationships deleted
        response = self.client.get(self.url1)
        assert response.data['items'] == []
        response = self.client.get(self.url2)
        assert response.data['items'] == []

class FollowersAPITests(GenericTestCase):
    """GET authors/<id>/followers."""
    def setUp(self):
        super().setUp()
        self.mock_authors()
        self.urls = [f'{self.author1.url}/followers', f'{self.author2.url}/followers']
    
    def test_unauthenticated(self):
        self.reset_auth()
        response = self.client.get(self.urls[0])
        self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_authenticated(self):
        response = self.client.get(self.urls[0])
        self.assertEqual(response.status_code, HTTP_200_OK)

        self.basic_authenticate()
        response = self.client.get(self.urls[0])
        self.assertEqual(response.status_code, HTTP_200_OK)
    
    def test_response_structure(self):
        for url in self.urls:
            response = self.client.get(url)
            data = response.data

            expected = ['type', 'items']
            for key in data.keys():
                assert key in expected
            self.assertEqual(data['type'], 'followers')
    
    def test_no_followers(self):
        for url in self.urls:
            response = self.client.get(url)
            data = response.data
            self.assertEqual(data['items'], [])
    
    def test_followers(self):
        # Add author1 and author2 as followers of author1
        for author in self.authors:
            url= f'{self.author1.url}/followers/{author.id}'
            response = self.client.put(url)
            self.assertEqual(response.status_code, HTTP_200_OK)
        
        response = self.client.get(self.urls[0])
        self.assertContains(response, self.author1.id)
        self.assertContains(response, self.author2.id)

class PostsAPITests(GenericTestCase):
    """GET, POST authors/<id>/posts/."""
    def setUp(self):
        super().setUp()
        self.mock_authors()
        self.url = f'{self.author1.id}/posts/'
        self.methods = [self.client.get, self.client.post]
        self.local_only_methods = [self.client.post]
    
    def test_unauthenticated(self):
        self.reset_auth()
        for method in self.methods:
            response = method(self.url)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        self.basic_authenticate()
        for method in self.local_only_methods:
            response = method(self.url)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_authenticated(self):
        for method in self.methods:
            response = method(self.url)
            self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        self.basic_authenticate()
        response = self.client.get(self.url)
        self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_get_template(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data['type'], 'posts')
        self.assertEqual(response.data['items'], [])
    
    def test_post_creation_url(self):
        post = self.mock_post()
        response = self.client.post(self.url, data=post)
        self.assertEqual(response.status_code, HTTP_201_CREATED)

        # Verify structure
        response = self.client.get(self.url)
        data = response.data['items'][0]

        expected = self.expected_post_keys()
        for key in data.keys():
            assert key in expected, f'Post missing field={key} in response.'
        
        expected_response = {
            "type": "post",
            "title": "Hello, World!",
            # "id": "", We can't know the ID since it's automatically generated by the creation url
            "source": "",
            "origin": "",
            # "author": "", Nested field, test the foreign key relationship
            "description": "",
            "count": 0,
            # "comments": "", Same as id
            # "comment_src": [], Test comment_src content in CommentTests
            # "published": "", Authogenerated timestamp
            "visibility": "PUBLIC",
            "unlisted": False
        }
        
        for field in expected_response.keys():
            self.assertEqual(post[field], data[field])

        # Verify author foreign key integrity
        self.assertEqual(response.data['items'][0]['author']['id'], self.author1.id)
    
    def test_pagination(self):
        post = self.mock_post()
        posts = 10
        for i in range(posts):
            response = self.client.post(self.url, data=post)
            self.assertEqual(response.status_code, HTTP_201_CREATED)
        response = self.client.get(self.url)
        self.assertContains(response, 'title', count=posts)
        
        size = 3
        url = f'{self.url}?page=1&size={size}'
        response = self.client.get(url)
        self.assertContains(response, 'title', count=size)

class PostDetailAPITests(GenericTestCase):
    """GET, POST, PUT, DELETE authors/<id>/posts/<id>."""
    def setUp(self):
        super().setUp()
        self.mock_authors()
        self.url = f'{self.author1.id}/posts/'
        self.methods = [self.client.put, self.client.get, self.client.post, self.client.delete]
        self.local_only_methods = [self.client.put, self.client.post, self.client.delete]
    
    def test_unauthenticated(self):
        # Some magic in ordering of the methods to not 404
        post_id = str(uuid4())
        url = f'{self.url}{post_id}'
        self.client.put(url)
        self.reset_auth()
        for method in self.methods:
            response = method(url)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        self.basic_authenticate()
        for method in self.local_only_methods:
            response = method(url)
            self.assertEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_authenticated(self):
        for method in self.methods:
            response = method(self.url)
            self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)
        
        self.basic_authenticate()
        response = self.client.get(self.url)
        self.assertNotEqual(response.status_code, HTTP_401_UNAUTHORIZED)
    
    def test_post_usage(self):
        # Create post
        post_id = str(uuid4())
        url = f'{self.url}{post_id}'
        response = self.client.put(url, self.mock_post())
        self.assertEqual(response.status_code, HTTP_201_CREATED)

        # Retrieve the created post
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)

        # Verify author foreign key
        self.assertEqual(response.data['author']['id'], self.author1.id)

        # Edit the post
        edit = {
            "title": "Goodbye, World!"
        }
        response = self.client.post(url, data=edit)

        # Verify the change
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(response.data['title'], edit['title'])

        # Delete the post
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTP_204_NO_CONTENT)
        
        # Verify 404
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_404_NOT_FOUND)

class CommentsAPITests(GenericTestCase):
    """GET, POST authors/<id>/posts/<id>/comments"""
    def setUp(self):
        super().setUp()
        self.mock_authors()

        self.url = f'{self.author1.id}/posts/{str(uuid4())}'
        self.client.put(self.url)

        self.methods = [self.client.get, self.client.post]
        self.local_only_methods = [self.client.post]

        self.comment1 = {
            "type": "comment",
            "author": {
                "type": "author",
                "id": self.author2.id,
                "url": "",
                "host": "",
                "display_name": "",
                "github": ""
            },
            "comment": "First Comment!",
        }
    
    def test_unauthenticated(self):
        pass

    def test_authenticated(self):
        pass

    def test_comment_usage(self):
        url = f'{self.url}/comments'
        response = self.client.post(url, data=self.comment1)
        self.assertEqual(response.status_code, HTTP_201_CREATED)

        # Verify comment structure
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)

        # Verify author and post foreign keys
        self.assertEqual(response.data['items'][0]['author']['id'], self.author2.id)
        self.assertContains(response, url)
    
    def test_pagination(self):
        url = f'{self.url}/comments'
        comments = 10
        for i in range(comments):
            response = self.client.post(url, data=self.comment1)
            self.assertEqual(response.status_code, HTTP_201_CREATED)

        size = 3
        url = f'{self.url}/comments?page=1&size={size}'
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']['items']), size)

@tag('current')
class LikesAPITests(GenericTestCase):
    def setUp(self):
        super().setUp()
        self.mock_authors()

        self.comment1 = {
            "type": "comment",
            "author": {
                "type": "author",
                "id": self.author2.id,
                "url": "",
                "host": "",
                "display_name": "",
                "github": ""
            },
            "comment": "First Comment!",
        }

        # Create a post to like
        self.post_url = f'{self.author1.id}/posts/{str(uuid4())}'
        self.client.put(self.post_url)

        # Create a comment on the post to like
        self.comment_url = f'{self.post_url}/comments'
        response = self.client.post(self.comment_url, data=self.comment1)
        self.assertEqual(response.status_code, HTTP_201_CREATED)

        like = Like.objects.create(
            object=self.post_url,
            author=self.author2
        )
        like.save()
    
    def test_unauthenticated(self):
        pass

    def test_authenticated(self):
        pass

    def test_post_like(self):
        url = f'{self.post_url}/likes'
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertContains(response, self.author2.display_name)
