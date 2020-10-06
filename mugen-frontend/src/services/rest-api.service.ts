import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { MugenDataHandlerService } from './mugen-data-handler.service'

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  artist_list: any[] = [];
  album_list: any[] = [];
  song_list: any[] = [];
  userFriendList: any[] = [];
  userFriendsPlaylist: any[] = [];
  userFriendsAlbumlist: any[] = [];
  userFriendsArtistlist: any[] = [];
  DJANGO_SERVER: string = "http://127.0.0.1:8000/";
  isAlbumVisited : boolean = false;

  constructor(private http: HttpClient, private dataHandlerService: MugenDataHandlerService) { }

  // returns an array of objects containing all albums data
  get_albums(callback) {
    let url = this.DJANGO_SERVER + "albums";
    let tmpAlbum_list = [];
    this.http.get(url).subscribe((querySet) => {
      try {
        querySet['albums'].forEach(element => {
          tmpAlbum_list.push(element);
        });
        this.$album_list = tmpAlbum_list;
        this.$isAlbumVisited = true;
      }
      catch (error) {
        this.dataHandlerService.showMsg('Error in getting Albums', 'error', 'Error');
        console.error(error);
      }
      callback(tmpAlbum_list);
    });
  }


  // returns an array of objects containing all artists data
  get_artists(callback) {
    let url = this.DJANGO_SERVER + "artists";
    let tmpArtist_list = [];
    this.http.get(url, { observe: 'response' }).subscribe((querySet) => {
      try {
        querySet['body']['artists'].forEach(element => {
          tmpArtist_list.push(element);
        });
        this.$artist_list = tmpArtist_list;
        console.log(querySet.headers);
      }
      catch (error) {
        this.dataHandlerService.showMsg('Error in getting Artists', 'error', 'Error');
        console.error(error);
      }
      callback(tmpArtist_list);
    });
  }

  // returns an array of objects containing all songs data
  get_songs(callback) {
    let url = this.DJANGO_SERVER + "songs";
    let tmpSong_list = [];
    this.http.get(url).subscribe((querySet) => {
      try {
        querySet['songs'].forEach(element => {
          tmpSong_list.push(element);
        });
        this.$song_list = tmpSong_list;
      }
      catch (error) {
        this.dataHandlerService.showMsg('Error in getting Songs', 'error', 'Error');
        console.error(error);
      }
      callback(tmpSong_list);
    });
  }

  // deletes the selected album and returns the new array
  delete_album(callback) {
    let url = this.DJANGO_SERVER + "delete_album";
    let tmpAlbum_list = [];
    this.http.get(url + `?delete_album_id=${this.dataHandlerService.$selected_album_id}`).subscribe((querySet) => {
      try {
        querySet['albums'].forEach(element => {
          tmpAlbum_list.push(element);
        });
        this.$album_list = tmpAlbum_list;
      }
      catch (error) {
        this.dataHandlerService.showMsg('Error in deleting ' + this.dataHandlerService.$selected_album + ' Albums', 'error', 'Error')
        console.error(error);
      }
      callback(tmpAlbum_list);
    });
  }

  // deletes the selected artist and returns the new array
  delete_artist(artist_list, callback) {
    let url = this.DJANGO_SERVER + "delete_artist";
    let tmpArtist_list = [];
    if (!artist_list.length) {
      this.dataHandlerService.showMsg('Please select atleast one Artist', 'error', 'Error');
      return;
    }
    this.http.get(url + `?delete_artist=${JSON.stringify(artist_list)}`).subscribe((querySet) => {
      try {
        querySet['artists'].forEach(element => {
          tmpArtist_list.push(element);
        });
        this.$artist_list = tmpArtist_list;
        callback(tmpArtist_list);
      }
      catch (error) {
        this.dataHandlerService.showMsg('Error in deleting the selected Artists', 'error', 'Error');
        console.error(error);
      }
    });
  }

  addSong(formData, callback) {
    let url = this.DJANGO_SERVER + "add_song";
    let tmpSong_list = [];
    this.http.post(url, formData).subscribe(
      (res) => {
        if (res != undefined && res != null) {
          let audio = res['audio'];
          audio = audio.substring(7);
          tmpSong_list = this.$song_list;
          tmpSong_list.push({ id: res['id'], album_id: res['album'], song_title: res['song_title'], audio: audio });
          this.$song_list = tmpSong_list;
        }
        callback(tmpSong_list);
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  addArtist(formData, callback) {
    let url = this.DJANGO_SERVER + "add_artist";
    this.http.post(url, formData).subscribe(
      (res) => {
        callback(res);
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  addAlbum(formData, callback) {
    let url = this.DJANGO_SERVER + "add_album";
    let tmpAlbum_list = [];
    this.http.post(url, formData).subscribe(
      (res) => {
        if (res != undefined && res != null) {
          let logo = res['album_logo'];
          logo = logo.substring(7);
          tmpAlbum_list = this.$album_list;
          tmpAlbum_list.push({ id: res['id'], artist_id: res['artist'], album_title: res['album_title'], genre: res['genre'], album_logo: logo });
          this.$album_list = tmpAlbum_list;
        }
        callback(tmpAlbum_list);
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  addUser(formData, callback) {
    let url = this.DJANGO_SERVER + "add_user";
    this.http.post(url, formData).subscribe(
      (res) => {
        if (res['user']) {
          this.dataHandlerService.$activeUser = res['user'][0]['username'];
          this.dataHandlerService.$activeUserID = res['user'][0]['id'];
          callback("SUCCESS");
        }
        callback(res);
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  loginUser(queryParam, callback) {
    let url = this.DJANGO_SERVER + `validate_user?username=${queryParam['username']}&password=${queryParam['password']}`;
    this.http.get(url).subscribe(
      (res) => {
        if (res['user']) {
          this.dataHandlerService.$activeUser = res['user']['username'];
          this.dataHandlerService.$activeUserID = res['user']['id'];
          callback("SUCCESS");
        }
        else{
          callback(res);
        }
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  getUserFriendList(username: string, callback) {
    let url = this.DJANGO_SERVER + `userFriends?username=${username}`;
    let tempFriendsList = [];
    this.http.get(url).subscribe(
      (querySet) => {
        querySet['userFriends'].forEach(element => {
          tempFriendsList.push(element);
        });
        this.$userFriendList = tempFriendsList;
        callback(tempFriendsList);
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  getUserFriendsPlaylist(friendsList : any[], callback) {
    let url = this.DJANGO_SERVER + `userFriendsPlaylist?friendsList=${friendsList}`;
    let tempFriendsPlaylist = [];
    let tempFriendsAlbumlist = [];
    let tempFriendsArtistlist = [];
    this.http.get(url).subscribe(
      (querySet) => {
        querySet['songList'].forEach(element => {
          tempFriendsPlaylist.push(element);
        });
        querySet['albumList'].forEach(element => {
          tempFriendsAlbumlist.push(element);
        });
        querySet['artistList'].forEach(element => {
          tempFriendsArtistlist.push(element);
        });
        this.$userFriendsPlaylist = tempFriendsPlaylist;
        this.$userFriendsAlbumlist = tempFriendsAlbumlist;
        this.$userFriendsArtistlist = tempFriendsArtistlist;
        this.dataHandlerService.$isFriendsPlaylist = true;
        callback(tempFriendsPlaylist);
      },
      (err) => {
        console.error(err);
        callback('error');
      }
    );
  }

  public set $album_list(value: any) {
    this.album_list = value;
  }
  public get $album_list() {
    return this.album_list;
  }
  public set $artist_list(value: any) {
    this.artist_list = value;
  }
  public get $artist_list() {
    return this.artist_list;
  }
  public set $song_list(value: any) {
    this.song_list = value;
  }
  public get $song_list() {
    return this.song_list;
  }
  public set $userFriendList(value: any) {
    this.userFriendList = value;
  }
  public get $userFriendList() {
    return this.userFriendList;
  }

  public set $userFriendsPlaylist(value: any) {
    this.userFriendsPlaylist = value;
  }
  public get $userFriendsPlaylist() {
    return this.userFriendsPlaylist;
  }
  public set $userFriendsAlbumlist(value: any) {
    this.userFriendsAlbumlist = value;
  }
  public get $userFriendsAlbumlist() {
    return this.userFriendsAlbumlist;
  }
  public set $userFriendsArtistlist(value: any) {
    this.userFriendsArtistlist = value;
  }
  public get $userFriendsArtistlist() {
    return this.userFriendsArtistlist;
  }
  public set $isAlbumVisited(value: boolean) {
    this.isAlbumVisited = value;
  }
  public get $isAlbumVisited() {
    return this.isAlbumVisited;
  }


}
