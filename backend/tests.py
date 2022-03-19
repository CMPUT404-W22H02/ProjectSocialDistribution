from django.test import TestCase
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED
from rest_framework.test import APIRequestFactory, force_authenticate, APIClient

from .models import Author
from .views import AuthorsAPIView
from .viewsets import RegistrationViewSet

class GenericTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.client = APIClient()

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
        self.client.force_authenticate()

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
