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

from django.urls import include, path

from .views import HomeRedirectView, LoggedInRedirectView, RegisterCreateView

app_name = 'accounts'

urlpatterns = [
    path('', include('django.contrib.auth.urls')),
    path('', HomeRedirectView.as_view(), name='home'),
    path('register/', RegisterCreateView.as_view(), name='register'),
    path('logged-in/', LoggedInRedirectView.as_view(), name='logged_in'),
]