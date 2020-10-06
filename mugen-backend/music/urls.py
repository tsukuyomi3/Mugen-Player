from django.conf.urls import url
from django.urls import path, include

from music import views
from rest_framework import routers

router = routers.DefaultRouter()
# router.register(r'customers', views.CustViewSet)

urlpatterns = [
    url(r'^$', views.HomePageView.as_view()),
    url(r'^albums$', views.all_albums),
    url(r'^artists$', views.all_artists),
    url(r'^songs$', views.all_songs),
    url(r'^delete_album$', views.delete_album),
    url(r'^add_album$', views.add_album),
    url(r'^add_song$', views.add_song),
    url(r'^add_artist$', views.add_artist),
    url(r'^delete_artist$', views.delete_artist),
    url(r'^add_user$', views.add_user),
    url(r'^validate_user$', views.validate_user),
    url(r'^userFriends$', views.userFriends),
    url(r'^userFriendsPlaylist$', views.userFriendsPlaylist)
]
