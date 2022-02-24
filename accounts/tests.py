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

from django.test import TestCase
from django.urls import reverse

from .models import NodeUser


class PermissionTests(TestCase):
    """Test redirect for unauthenticated access."""
    def test_login_redirect(self):
        url = reverse('inbox:home')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 302)

class AuthorsTests(TestCase):
    """Test authors/ endpoints"""
    def setUp(self):
        NodeUser.objects.create(display_name='John Doe', username='johndoe')
        NodeUser.objects.create(display_name='Jane Doe', username='janedoe')
    
    def test_authors_all(self):
        """Test endpoint for all authors, no pagination."""
        url = reverse('accounts:api_authors')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'John')
        self.assertContains(response, 'Jane')

    def test_author_pagination_response(self):
        """Test correctness of pagination response fields."""
        page = 1
        size = 1
        url = reverse('accounts:api_authors') + f'?page={page}&size={size}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'count')
        self.assertContains(response, 'next')
        self.assertContains(response, 'previous')
        self.assertContains(response, 'results')
    
    def test_author_pagination_next(self):
        """Test second page of the pagination."""
        page = 2
        size = 1
        url = reverse('accounts:api_authors') + f'?page={page}&size={size}'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
    
    def test_author_pagination_not_found(self):
        """Test a page outside of pagination range."""
        page = 2
        size = 2
        url = reverse('accounts:api_authors') + f'?page={page}&size={size}'
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
    
    def test_author_profile_found(self):
        """Test authors/{id} endpoint for an existing author."""
        id = NodeUser.objects.filter(display_name='John Doe').values('uuid_id')[0]
        url = reverse('accounts:api_author', kwargs={'pk': id['uuid_id']})
        response = self.client.get(url)

        self.assertContains(response, 'John')
        self.assertNotContains(response, 'Jane')

        id = NodeUser.objects.filter(display_name='Jane Doe').values('uuid_id')[0]
        url = reverse('accounts:api_author', kwargs={'pk': id['uuid_id']})
        response = self.client.get(url)

        self.assertContains(response, 'Jane')
        self.assertNotContains(response, 'John')
    
    def test_author_profile_not_found(self):
        """Test authors/{id} endpoint not found."""
        url = reverse('accounts:api_author', kwargs={'pk': 'doesnotexist'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
    
    def test_author_profile_update_full_success(self):
        """Update using POST, updating all/many editable fields."""
        id = NodeUser.objects.filter(display_name='John Doe').values('uuid_id')[0]
        url = reverse('accounts:api_author', kwargs={'pk': id['uuid_id']})
        
        new_display_name = 'Jon Doe'
        new_github_url = 'https://github.com/jondoe'
        response = self.client.post(url, data={'display_name': new_display_name, 'github': new_github_url})

        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(url)
        self.assertContains(response, new_display_name)
        self.assertContains(response, new_github_url)
        self.assertNotContains(response, 'John Doe')
    
    def test_author_profile_update_partial_success(self):
        """Update using POST, updating only one editable field."""
        id = NodeUser.objects.filter(display_name='John Doe').values('uuid_id')[0]
        url = reverse('accounts:api_author', kwargs={'pk': id['uuid_id']})
        
        new_display_name = 'Jon Doe'
        response = self.client.post(url, data={'display_name': new_display_name})

        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(url)
        self.assertContains(response, new_display_name)
        self.assertNotContains(response, 'John Doe')
