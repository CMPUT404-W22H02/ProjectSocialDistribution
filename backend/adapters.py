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

class RemoteAdapter():
    """Object adapter for all incoming content from remote nodes."""
    def __init__(self, request_data):
        self.data = request_data
        self.adapted = None
    
    def adapt_data(self):
        """Execute object adaption, including nested objects."""
        obj = self.data
        self.type_adapter(obj)

        if not obj:
            return obj
        type = obj['type']

        # GET /authors/, can be paginated
        if type == 'authors':
            self.items_adapter(obj)
            authors = obj['items']
            self.authors_adapter(authors)
        
        # GET /authors/{id} remote
        elif type == 'author':
            self.author_adapter(obj)
        
        # GET /authors/{id}/followers
        elif type == 'followers':
            self.items_adapter(obj)
            followers = obj['items']
            self.followers_adapter(followers)
        
        # GET /authors/{id}/followers/{fid}
        # TODO: this one is highly service dependent...

        # Friend/Follow request object
        elif type == 'follow':
            self.follow_adapter(obj)
        
        # GET likes on posts and comments
        elif type == 'likes':
            self.items_adapter(obj)
            likes = obj['items']
            self.likes_adapter(likes)
            
        # GET liked objects of an author
        elif type == 'liked':
            self.items_adapter(obj)
            likes = obj['items']
            self.likes_adapter(likes)
        
        # Like object
        elif type == 'like':
            self.like_adapter(obj)

        # GET /authors/{id}/posts/, can be paginated
        elif type == 'posts':
            self.items_adapter(obj)
            posts = obj['items']
            self.posts_adapter(posts)
    
        # GET /authors/{id}/posts/{pid}
        elif type == 'post':
            self.post_adapter(obj)
    
        # GET /authors/{id}/posts/{pid}/comments/, can be paginated
        elif type == 'comments':
            self.items_adapter(obj)
            comments = obj['items']
            self.comments_adapter(comments)

        return obj

    def items_adapter(self, obj):
        """Plural responses tied to an items key."""
        local_field = 'items'
        remote_fields = ['comments']

        try:
            obj[local_field]
        except:
            self.key_replacement(obj, local_field, remote_fields)

    def type_adapter(self, obj):
        """Determines the type of object in the request and normalizes the type."""
        local_field = 'type'
        remote_fields = ()

        try:
            obj[local_field]
        except:
            obj.clear()

        # Type values should all be lowercase
        if obj:
            obj[local_field] = (obj[local_field]).lower()      

    def authors_adapter(self, authors):
        for author in authors:
            self.author_adapter(author)

    def author_adapter(self, obj):
        self.type_adapter(obj)
        # Sanity check, if groups don't have the correct types set reject that garbage
        if obj['type'] != 'author':
            return None

        field_adaptation = {
            "id": (),
            "host": (),
            "display_name": ("displayName",),
            "url": (),
            "github": (),
            "profile_image": ("profileImage",)
        }

        self.adapt_fields(obj, field_adaptation)

    def posts_adapter(self, posts):
        for post in posts:
            self.post_adapter(post)

    def post_adapter(self, obj):
        self.type_adapter(obj)
        # Sanity check, if groups don't have the correct types set reject that garbage
        if obj['type'] != 'post':
            return None
        
        field_adaptation = {
            "id": (),
            "title": (),
            "source": (),
            "origin": (),
            "description": (),
            "content_type": ("contentType",),
            "author": (),
            "categories": (),
            "count": (),
            "comments": (),
            "comments_src": ("commentsSrc",),
            "published": ("publishedDate"),
            "visibility": (),
            "unlisted": ()
        }

        self.adapt_fields(obj, field_adaptation)

        # Adapt nested author
        self.author_adapter(obj['author'])

        # TODO: comments_src

    def comments_adapter(self, comments):
        for comment in comments:
            self.comment_adapter(comment)

    def comment_adapter(self, obj):
        self.type_adapter(obj)
        # Sanity check, if groups don't have the correct types set reject that garbage
        if obj['type'] != 'comment':
            return None
        
        field_adaption = {
            "author": (),
            "comment": (),
            "content_type": ('contentType'),
            "published": (),
            "id": ()
        }

        self.adapt_fields(obj, field_adaption)

        # Adapt nested author
        self.author_adapter(obj['author'])

    def likes_adapter(self, likes):
        for like in likes:
            self.like_adapter(like)

    def like_adapter(self, obj):
        field_adaption = {
            "author": (),
            "object": ()
        }

        self.adapt_fields(obj, field_adaption)
        
        # Adapt nested author object
        self.author_adapter(obj['author'])

    def follow_adapter(self, obj):
        field_adaption = {
            "actor": (),
            "object": ()
        }

        self.adapt_fields(obj, field_adaption)
        
        # Adapt the nested authors in each field
        self.author_adapter(obj['actor'])
        self.author_adapter(obj['object'])

    def followers_adapter(self, followers):
        for follower in followers:
            self.author_adapter(follower)

    def adapt_fields(self, obj, field_adaptation):
        for field in field_adaptation:
            try:
                obj[field]
            except:
                self.key_replacement(obj, field, field_adaptation[field])

    def key_replacement(self, obj, local_field, remote_fields):
        """Finds the matching remote field and replaces the key with one compatible with our service."""      
        for field in remote_fields:
            try:
                obj[local_field] = obj.pop(field)
                return
            except Exception as e:
                pass
        
        # Field doesn't exist or there is no adapter for it
        obj[local_field] = None

# class AdapterBase():
#     """Base adapter for all incoming content from remote Nodes."""
#     def __init__(self, data):
#         self.data = data

# # Temporary hardcoding
# class Team02Adapter(AdapterBase):
#     def __init__(self, data):
#         super().__init__(data)
#         node = Node.objects.get_or_create(
#             api_domain='https://social-dist-wed.herokuapp.com/service/',
#             username='team02admin',
#             password='admin'
#         )

# class Team05Adapter(AdapterBase):
#     def __init__(self, data):
#         super().__init__(data)
#         node = Node.objects.get_or_create(
#             api_domain='https://cmput404-w22-project-backend.herokuapp.com/service/',
#             username='proxy',
#             password='proxy123'
#         )

# class Team07Adapter(AdapterBase):
#     def __init__(self, data):
#         super().__init__(data)
#         node = Node.objects.get_or_create(
#             api_domain='https://c404-social-distribution.herokuapp.com/service/',
#             username='othergroupadmin',
#             password='othergroupadmin'
#         )

# class Team12Adapter(AdapterBase):
#     def __init__(self, data):
#         super().__init__(data)
#         node = Node.objects.get_or_create(
#             api_domain='https://cmput404-project-t12.herokuapp.com/service/',
#             username='connector',
#             password='1234.com'
#         )

# class Team13Adapter(AdapterBase):
#     def __init__(self, data):
#         super().__init__(data)
#         node = Node.objects.get_or_create(
#             api_domain='https://socialdistribution-t13.herokuapp.com/api/v1/',
#             username='group_11',
#             password='796d09b55a3c19a0f905cb4c003aff2f35be58f532599ba19fc492798b207698'
#         )

# class AdapterDispatcher():
#     """Dispatches the correct adapter for a request based on host."""
#     node_domains = {
#         "https://social-dist-wed.herokuapp.com/service/": Team02Adapter,
#         # "https://social-dist-wed.herokuapp.com/service/": Team05Adapter,
#         "https://c404-social-distribution.herokuapp.com/service/": Team07Adapter,
#         "https://cmput404-project-t12.herokuapp.com/service/": Team12Adapter

#     }

#     def __init__(self, domain):
#         try:
#             self.adapter = self.node_domains['domain']
#         except:
#             self.adapter = None
    
#     def get_adapter(self):
#         return self.adapter