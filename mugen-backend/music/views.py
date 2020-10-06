import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from .models import Album, Song, Artist, User
from .serializers import AlbumSerializer, ArtistSerializer, SongSerializer, UserSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils import json
# global variable to store JSON
mode_json = []
active_user = ""
path = "C:/Users/Kripa.Shankar/Desktop/Mugen/configurations/modeInfo.json"


def __init__():
    read_file = open(path, "r")
    global mode_json
    mode_json = json.load(read_file)
    read_file.close()


def addValueToJSON(value_type, user, value):
    for entry in mode_json:
        if entry["user"] == user:
            entry.get(value_type).append(value)
            break


def deleteValueFromJSON(value_type, user, value):
    values = []
    for entry in mode_json:
        if entry["user"] == user:
            values = entry.get(value_type)
            break
    '''@value may be a list or int'''
    if type(value) == int:
        values.remove(value)
    else:
        for i in value:
            values.remove(i)


def getListFromJSON(list_type, user) -> list:
    for entry in mode_json:
        if entry["user"] == user:
            return entry.get(list_type)


def writeToFile():
    file = open(path, "w")
    json.dump(mode_json, file, indent=4)


class HomePageView(TemplateView):
    __init__()
    
    def get(self, request, **kwargs):
        return render(request, 'index.html', context=None)


'''
this api is used to get the playlist of active-user friend
'''
@api_view(["GET"])
def friends_playlist(request):
    friend = str(request.GET.get('friend', ''))
    song_id = []
    for entry in mode_json:
        if entry["friends"].count(friend) == 1:
            song_id.extend(entry["song_id"])
    context = {
        'song_id': list(song_id)
    }
    return JsonResponse(context)


'''
this api return the active-user albums list
'''
@api_view(["GET"])
def all_albums(request):
    albums_id = getListFromJSON("album_id", active_user)
    albums = list(Album.objects.filter(id__in=albums_id).values())
    context = {
        'albums': albums
    }
    return JsonResponse(context)


'''
this api return the active-user songs list
'''
@api_view(["GET"])
def all_songs(request):
    song_id = getListFromJSON("song_id", active_user)
    songs = list(Song.objects.filter(id__in=song_id).values())
    context = {
        'songs': songs
    }
    return JsonResponse(context)


'''
this api return the active-user artist list
'''
@api_view(["GET"])
def all_artists(request):
    artist_id = getListFromJSON("artist_id", active_user)
    artists = list(Artist.objects.filter(id__in=artist_id).values())
    context = {
        'artists': artists
    }
    return JsonResponse(context)


@api_view(["POST"])
def add_album(request):
    album_serializer = AlbumSerializer(data=request.data)
    if album_serializer.is_valid():
        album_serializer.save()
        album_id = Album.objects.last().id
        addValueToJSON("album_id", active_user, album_id)
        writeToFile()
        return Response(album_serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(album_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def add_song(request):
    song_serializer = SongSerializer(data=request.data)
    if song_serializer.is_valid():
        song_serializer.save()
        song_id = Song.objects.last().id
        addValueToJSON("song_id", active_user, song_id)
        writeToFile()
        return Response(song_serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(song_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def add_artist(request):
    artist_serializer = ArtistSerializer(data=request.data)
    if artist_serializer.is_valid():
        artist_serializer.save()
        artist_id = Artist.objects.last().id
        addValueToJSON("artist_id", active_user, artist_id)
        writeToFile()
        return Response(artist_serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(artist_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def delete_album(request):
    try:
        album_id = int(request.GET.get('delete_album_id', ''))
        Album.objects.filter(id=album_id).delete()
        albums = list(Album.objects.values())
        context = {
            'albums': albums
        }
        deleteValueFromJSON("album_id", active_user, album_id)
        writeToFile()
        return JsonResponse(context)
    except ValueError as e:
        return Response(e.args[0], status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def delete_artist(request):
    try:
        artist = str(request.GET.get('delete_artist', ''))
        artist = json.loads(artist)
        Artist.objects.filter(id__in=artist).delete()
        artists = list(Artist.objects.values())
        context = {
            'artists': artists
        }
        deleteValueFromJSON("artist_id", active_user, artist)
        writeToFile()
        return JsonResponse(context)
    except ValueError as e:
        return Response(e.args[0], status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def add_user(request):
    username = str(request.POST.get('username', ''))
    email = str(request.POST.get('email', ''))
    user = User.objects.filter(username__exact=username)
    if user.exists():
        return Response("USER_ALREADY_EXIST", status=status.HTTP_200_OK)
    user = User.objects.filter(email__exact=email)
    if user.exists():
        return Response("EMAIL_ALREADY_EXIST", status=status.HTTP_200_OK)
    user_obj = {
        'username': 'dummy',
        'id': -1
    }
    context = {
        'user': user_obj
    }
    user_serializer = UserSerializer(data=request.data)
    if user_serializer.is_valid():
        user_serializer.save()
        global active_user
        active_user = username
        user_obj['username'] = User.objects.last().username
        user_obj['id'] = User.objects.last().id
        context['user'] = user_obj
        return JsonResponse(context)
    else:
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def validate_user(request):
    try:
        username = str(request.GET.get('username', ''))
        password = str(request.GET.get('password', ''))
        user = User.objects.filter(username__exact=username, password__exact=password)
        user_obj = {
            'username': 'dummy',
            'id': -1
        }
        context = {
            "user": user_obj
        }
        if user.exists():
            global active_user
            active_user = username
            user_obj['username'] = user.get().username
            user_obj['id'] = user.get().id
            context['user'] = user_obj
            return JsonResponse(context)
        return Response("INVALID", status=status.HTTP_200_OK)
    except ValueError as e:
        return Response(e.args[0], status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def userFriends(request):
    username = str(request.GET.get('username', ''))
    user_friends = getListFromJSON('friends', username)
    context = {
        'userFriends': user_friends
    }
    return JsonResponse(context)


@api_view(["GET"])
def userFriendsPlaylist(request):
    friends_list = request.GET.get('friendsList', '')
    _arr = friends_list.split(',')
    song_id = []
    album_id = []
    artist_id = []
    for friend in _arr:
        friend_songs = getListFromJSON('song_id', friend)
        friend_albums = getListFromJSON('album_id', friend)
        friend_artists = getListFromJSON('artist_id', friend)
        if len(friend_songs) > 0:
            song_id.extend(friend_songs)
        if len(friend_albums) > 0:
            album_id.extend(friend_albums)
        if len(friend_artists) > 0:
            artist_id.extend(friend_artists)

    song_list = list(Song.objects.filter(id__in=song_id).values())
    album_list = list(Album.objects.filter(id__in=album_id).values())
    artist_list = list(Artist.objects.filter(id__in=artist_id).values())
    
    context = {
        'songList': song_list,
        'albumList': album_list,
        'artistList': artist_list
    }
    return JsonResponse(context)







