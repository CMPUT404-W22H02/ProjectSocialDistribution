from django.test import TestCase
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED
from rest_framework.test import APIRequestFactory, force_authenticate

from .views import AuthorsAPIView
from .viewsets import RegistrationViewSet


class RegistrationAPITestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
    
    def test_registration(self):
        payload = {'username': 'tuser1', 'password': 'tpass1', 'display_name': 'Test User1'}
        request = self.factory.post('/register/', payload)

        response = RegistrationViewSet.as_view(actions={'post': 'create'})(request)
        
        self.assertEqual(response.status_code, HTTP_201_CREATED)

class AuthorsAPITestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        user = {'username': 'tuser1', 'password': 'tpass1', 'display_name': 'Test User1'}

        request = self.factory.post('/register/', user)

        response = RegistrationViewSet.as_view(actions={'post': 'create'})(request)

        self.assertEqual(response.status_code, HTTP_201_CREATED)
    
    def test_author_created(self):
        request = self.factory.get('/authors/')
        
        force_authenticate(request)
        response = AuthorsAPIView.as_view()(request)

        self.assertContains(response, 'Test User1', status_code=HTTP_200_OK, count=1)
