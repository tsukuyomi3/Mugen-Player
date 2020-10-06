from django.db import models
from django.urls import reverse


class Artist(models.Model):
    artist_name = models.CharField(max_length=100)
    artist_logo = models.ImageField(default='default.png', max_length=500)
    # artist_logo = models.FileField(max_length=500)

    def __str__(self):
        return self.artist_name


class Album(models.Model):
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    album_title = models.CharField(max_length=100)
    genre = models.CharField(max_length=100)
    album_logo = models.ImageField(default='default_album.jpg', max_length=500)

    def __str__(self):
        return self.album_title


class Song(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    song_title = models.CharField(max_length=100)
    audio = models.FileField(max_length=500, upload_to='audio/')

    def __str__(self):
        return self.song_title


class User(models.Model):
    username = models.CharField(max_length=50)
    email = models.EmailField(max_length=50)
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.username

