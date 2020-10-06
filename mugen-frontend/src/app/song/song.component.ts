import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestApiService } from '../../services/rest-api.service'
import { MugenDataHandlerService } from '../../services/mugen-data-handler.service'
import { CommonSubscriptionService } from '../../services/common-subscription.service'
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css', '../../assets/css/dialog.css']
})
export class SongComponent implements OnInit, OnDestroy {
  song_id: number; // id to pass to music_player
  songs: any[] = [] // array containing all songs
  isSongSelected: boolean = false;
  toggle: boolean = true; //workaround to change the song on click on the another song from list
  album_list: any;
  drpdownAlbums = [];
  drpdownArtists = [];
  subscription: Subscription;
  add_song: boolean = false;
  search_operation: boolean = false;
  myFormGroup: FormGroup;
  selectedArtist: string = '';
  selectedAlbum: string = '';
  newSong: string = '';
  audio_file;
  musicInfoObj;

  constructor(private rest_service: RestApiService, private dataHandlerService: MugenDataHandlerService,
    private common_subscription: CommonSubscriptionService, private router: Router) {
    this.subscription = this.common_subscription.getMessage().subscribe((response) => {
      if (response['msg'] == 'SONG_SEARCH_OPERATION') {
        this.songs = response['data']['songs'];
        sessionStorage.setItem('songs', JSON.stringify(this.songs));
        if (response['data']['songs'].length == 0) {
          this.dataHandlerService.showMsg("No such Song", "error", "Error");
        }
      }
    });
  }


  ngOnInit() {
    //Instanciate formGroup
    this.myFormGroup = new FormGroup({
      'artist': new FormControl({ value: 'Select Artist' }, Validators.required),
      'album': new FormControl({ value: 'Select Album' }, Validators.required),
      'song_title': new FormControl('', Validators.required),
      'audio': new FormControl('', Validators.required)
    });

    if (this.dataHandlerService.$isFriendsPlaylist) {
      this.songs = this.rest_service.$userFriendsPlaylist;
      this.songs.map((e) => {
        this.addSongArtistTolist(e, this.rest_service.$userFriendsAlbumlist, this.rest_service.$userFriendsArtistlist);
      });
      this.album_list = this.rest_service.$userFriendsAlbumlist;
      return;
    }

    let start_index = window.location.href.lastIndexOf('=');
    let type = window.location.href.substring(start_index - 1, start_index);
    this.rest_service.get_songs((song_list) => {
      this.album_list = this.rest_service.$album_list;
      this.common_subscription.sendMessage("SONGS", song_list);// send the song_list to other component who subscribe the message service  
      if (type == 'q') {
        this.songs = JSON.parse(sessionStorage.getItem('songs'));
      }
      else {
        this.songs = song_list;
      }
      if (this.songs.length == 0) {
        this.dataHandlerService.showMsg("Empty Playlist");
      }
      this.songs.map((e) => {
        this.addSongArtistTolist(e);
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  resetForm() {
    this.selectedAlbum = "Select Album";
    this.selectedArtist = "Select Artist";
    this.drpdownAlbums = [];
    this.newSong = '';
    this.myFormGroup.get('audio').setValue("");
  }

  getSelectedArtistAlbums() {
    const selected_artist_id = this.myFormGroup.value.artist.id;
    this.drpdownAlbums = this.album_list.filter(e => e.artist_id == selected_artist_id);
    if (this.drpdownAlbums.length == 0) {
      this.dataHandlerService.showMsg("No Album for Selected Artist", "warn", "Warning");
      return;
    }
    this.drpdownAlbums = this.dataHandlerService.setDropdownTable(this.drpdownAlbums, "album_title");
  }

  onChange(event) {
    if (event.target.files.length > 0) {
      this.audio_file = event.target.files[0];
      // this.myFormGroup.get('audio').setValue(this.audio_file);
    }
  }

  addSongArtistTolist(songItem, album_list = this.album_list, artist_list = this.rest_service.$artist_list) {
    let artist_id = album_list.filter(e => e.id == songItem.album_id).map(e => e.artist_id)[0];
    let artist_name = artist_list.filter(e => e.id == artist_id).map(e => e.artist_name)[0];
    songItem['artist'] = artist_name;
  }

  show(selected_song) {
    this.toggle = !this.toggle;
    this.dataHandlerService.$selectedSongID = selected_song['id'];
    this.isSongSelected = true;
  }

  showAddSongDialog() {
    this.drpdownArtists = this.dataHandlerService.setDropdownTable(this.rest_service.$artist_list, "artist_name");
    this.resetForm();
    this.add_song = true;
  }


  getAlbum(album_id: number, type: string) {
    let album = this.album_list.filter(e => e.id == album_id).map(e => e)[0];
    if (type == 'img') {
      return album['album_logo'];
    }
    else {
      return album['album_title'];
    }
  }

  addSong() {
    const formData = new FormData();
    if (this.myFormGroup.get('audio').value == null) {
      this.dataHandlerService.showMsg('Please select a audio file', 'error', 'Error');
      return;
    }

    formData.append('album', this.myFormGroup.value.album);
    formData.append('artist', this.myFormGroup.value.artist);
    formData.append('song_title', this.myFormGroup.value.song_title);
    formData.append('audio', this.audio_file);

    this.rest_service.addSong(formData, (data) => {
      if (data == 'error') {
        this.dataHandlerService.showMsg('Error in adding song', 'error', 'Error');
        return;
      }
      this.songs = data;
      this.common_subscription.sendMessage("SONGS", this.songs);// send the song_list to other component who subscribe the message service
      this.dataHandlerService.showMsg('Song ' + this.myFormGroup.value.song_title + ' Succesfully added', 'success');
      // this.myFormGroup.reset();
      this.add_song = false;
    });
  }

}
