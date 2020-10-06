import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RestApiService } from 'src/services/rest-api.service';
import { MugenDataHandlerService } from '../../../services/mugen-data-handler.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonSubscriptionService } from '../../../services/common-subscription.service';

@Component({
  selector: 'app-album-details',
  templateUrl: './album-details.component.html',
  styleUrls: ['./album-details.component.css', '../../../assets/css/dialog.css']
})
export class AlbumDetailsComponent implements OnInit, OnDestroy {


  //variables
  @Input('albumObj') selected_album;
  add_song: boolean = false;
  album: string;
  artist: string;
  songs: any[] = [] //list containing all the songs of the selected album
  song_id: number; // id to pass to music_player
  form: FormGroup;
  detail_view: boolean = true;
  isSongSelected: boolean = false;
  toggle: boolean = true; //workaround to change the song on click on the another song from list
  audio_file;


  constructor(private rest_service: RestApiService, private dataHandlerService: MugenDataHandlerService, private router: Router, private common_subscription: CommonSubscriptionService) { }

  ngOnInit() {
    this.dataHandlerService.$detail_view = true;
    this.album = this.selected_album.album_title;
    this.artist = this.selected_album.artist_name;
    this.rest_service.get_songs((song_list) => {
      this.songs = song_list.filter(e => e.album_id == this.selected_album.id);
    });
    this.form = new FormGroup({
      'album': new FormControl({ value: this.album, disabled: this.detail_view }, Validators.required),
      'artist': new FormControl({ value: this.artist, disabled: this.detail_view }, Validators.required),
      'song_title': new FormControl('', Validators.required),
      'audio': new FormControl('', Validators.required)
    });
    this.router.navigate(['/home/album/details'], { queryParams: { album_title: this.album, artist_name: this.artist } });
  }

  ngOnDestroy() {
    this.dataHandlerService.$detail_view = false;
  }

  getArtist(key: number) {
    return this.rest_service.$artist_list.filter(e => e.id == key).map(e => e.artist_name)[0];
  }

  songDialog() {
    this.add_song = true;
  }

  //gets the selected audio file and assign it to audio formField
  onChange(event) {
    if (event.target.files.length > 0) {
      this.audio_file = event.target.files[0];
      // console.log(this.form.get('audio').value);
      // console.log(this.audio_file);
      // this.form.get('audio').setValue(this.audio_file);
      // console.log(this.form.get('audio').setValue(this.audio_file));
    }
  }

  show(selected_song) {
    this.toggle = !this.toggle;
    this.dataHandlerService.$selectedSongID = selected_song['id'];
    this.isSongSelected = true;
  }

  addSong() {
    const formData = new FormData();
    if (this.form.get('audio').value == null) {
      this.dataHandlerService.showMsg('Please select a audio file', 'error', 'Error');
      return;
    }

    formData.append('album', this.selected_album.id);
    formData.append('song_title', this.form.value.song_title);
    formData.append('audio', this.audio_file);
    this.rest_service.addSong(formData, (data) => {
      if (data == 'error') {
        this.dataHandlerService.showMsg('Error in adding song', 'error', 'Error');
        return;
      }
      this.songs = data;
      this.common_subscription.sendMessage("SONGS", this.songs);// send the song_list to other component who subscribe the message service
      this.dataHandlerService.showMsg('Song ' + this.form.value.song_title + ' Succesfully added', 'success');
      let defaultFormState = { // default form state
        'album': this.album,
        'artist': this.artist,
        'song_title': '',
        'audio': ''
      }
      this.form.reset(defaultFormState);
      this.add_song = false;
    });
  }

}
