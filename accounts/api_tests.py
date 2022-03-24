import requests
from rest_framework import status


class RESTAPITests():
    """Tests REST API endpoints against a live Heroku test deployment."""
    def __init__(self, deployment):
        self.service = deployment

        # Users registered to the deployment
        self._uuid = 'uuid'
        self._id = 'id'
        self._display_name = 'display_name'
        self.author_1 = {
            self._uuid: '092cd520-d548-44e8-a2fa-eb1bf9b9c66f',
            self._id: 'http://socialdistodev.herokuapp.com/authors/092cd520-d548-44e8-a2fa-eb1bf9b9c66f/',
            self._display_name: 'Tester A'
        }
        self.author_2 = {
            self._uuid: '00d4d649-34ae-42d8-acc9-cddd24da0d9b',
            self._id: 'http://socialdistodev.herokuapp.com/authors/00d4d649-34ae-42d8-acc9-cddd24da0d9b/',
            self._display_name: 'Tester B'
        }

    def run(self):
        self.authors()
        self.profile()
        self.followers()
        self.posts()
        self.inbox()
    
    def authors(self):
        """service/authors/"""
        url = f'{self.service}/authors/'
        r = requests.get(url)

        assert r.status_code == status.HTTP_200_OK
        assert str.encode(self.author_1[self._display_name]) in r.content
        assert str.encode(self.author_2[self._display_name]) in r.content

        # Pagination template check
        url = f'{self.service}/authors/?page=1&size=1'
        r = requests.get(url)

        assert r.status_code == status.HTTP_200_OK
        assert str.encode('count') in r.content
        assert str.encode('next') in r.content
        assert str.encode('previous') in r.content
        assert str.encode('results') in r.content
    
    def profile(self):
        """service/authors/AUTHOR_ID"""
        url = self.author_1[self._id]
        r = requests.get(url)

        assert r.status_code == status.HTTP_200_OK
        assert str.encode(self.author_1[self._display_name]) in r.content
        assert str.encode(self.author_1[self._id]) in r.content
    
    def followers(self):
        """service/authors/AUTHOR_ID/followers"""
        url = f'{self.author_1[self._id]}followers/'
        r = requests.get(url)

        assert r.status_code == status.HTTP_200_OK
    
    def posts(self):
        """service/authors/AUTHOR_ID/posts/"""
        url = f'{self.author_1[self._id]}posts/'
        r = requests.get(url)
        
        assert r.status_code == status.HTTP_200_OK
    
    def inbox(self):
        """serivce/authors/AUTHOR_ID/inbox/"""
        url = f'{self.author_1[self._id]}inbox'
        r = requests.get(url)

        assert r.status_code == status.HTTP_200_OK

if __name__ == '__main__':
    deployment = 'http://socialdistodev.herokuapp.com'
    tester = RESTAPITests(deployment)
    tester.run()