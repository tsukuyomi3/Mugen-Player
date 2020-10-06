import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import { RestApiService } from '../services/rest-api.service'
import { MugenDataHandlerService } from '../services/mugen-data-handler.service';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css']
})
export class MusicPlayerComponent implements  OnChanges, OnInit {

  //SongTime
  @ViewChild('progressBar', { static: false }) set progressRef(progress: ElementRef<HTMLElement>) {
    this.progressBar = progress.nativeElement;
  }
  @ViewChild('progressBarStatus', { static: false }) set progressStatusRef(progressStatus: ElementRef<HTMLElement>) {
    this.progressBarStatus = progressStatus.nativeElement;
  }
  //Volume
  // @ViewChild('volumeBar' , {static: false}) set volumeBarRef(volume:ElementRef<HTMLElement>){
  //   this.volumeBar = volume.nativeElement;
  // }
  // @ViewChild('volumeStatus' , {static: false}) set volumeStatusRef(volumeStatus:ElementRef<HTMLElement>){
  //   this.volumeStatusBar = volumeStatus.nativeElement;
  // }
  //Play
  @ViewChild('audio', { static: false }) set audioRef(audio: ElementRef<HTMLAudioElement>) {
    this.audioContainer = audio.nativeElement;
  }

  private progressBar: HTMLElement;
  private progressBarStatus: HTMLElement;
  private volumeStatusBar: HTMLElement;
  private volumeBar: HTMLElement;
  public isPlaying: boolean = false;
  private audioContainer: HTMLAudioElement;
  private nowPlayingSongId: number;
  private currentVolume: number = 1;
  current_song_time: any = '0:00'; //to display on UI current song time
  total_song_time : any; //to display on UI total song time
  display_time: any;
  timer : any;
  song_list_size : number;
  @Input('toggle') musicToggle : boolean ;
  songsList = [];
  MEDIA_PATH = '../media/';
  audio_src : string;
  public playingSong ;
  selectedSongId : number;
  selectedSongArtist : string = "";
  songAvailable : boolean = false;

  constructor(private rest_service : RestApiService, public dataHandlerService : MugenDataHandlerService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.selectedSongId = this.dataHandlerService.$selectedSongID;
    if(this.dataHandlerService.$isFriendsPlaylist){
      this.songsList = this.rest_service.$userFriendsPlaylist;
    }
    else{
      this.songsList = this.rest_service.$song_list;
    }
    this.pauseSong(false);
    this.setSongInfo(this.selectedSongId);
  }

  ngOnInit(){  }

  playSong(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      setTimeout(() => {
        this.audioContainer.play();
      });
      this.timer = setInterval(() => {
        let currentSongTimePercentage = (this.audioContainer.currentTime * 100) / this.audioContainer.duration;
        this.changeSongBarStatus(currentSongTimePercentage);
        this.current_song_time = this.secondToMinutes(this.audioContainer.currentTime);//to display on UI current song time
        this.total_song_time = this.secondToMinutes(this.audioContainer.duration);//to display on UI total song time
      }, 1000);
    }
    else {
      clearInterval(this.timer);
      this.pauseSong();
      return;
    }
  }

  pauseSong(fromCtrls? : boolean): void {
    if(this.isPlaying){
      this.audioContainer.pause();
      if(!fromCtrls && fromCtrls!=undefined){
        this.audioContainer.currentTime = 0;
      }
      this.isPlaying = false;
    }
    return;
  }

  getSelectedSongArtist(album_id : number, album_list = this.rest_service.$album_list, artist_list = this.rest_service.$artist_list) : string{
    let artist_id = album_list.filter(e=>e.id==album_id).map(e=>e.artist_id)[0];
    let artist_name = artist_list.filter(e=>e.id==artist_id).map(e=>e.artist_name)[0];
    return artist_name;
  }

  setSongInfo(id: number = 0, fromCtrls? : boolean): void {

    if(fromCtrls){
      this.playingSong = this.songsList[id];
      this.nowPlayingSongId = id;
    }
    else{
      let n = this.songsList.length;
      for (let i = 0; i < n; i++) {
        if(this.songsList[i]['id']==id){
          this.playingSong = this.songsList[i];
          this.nowPlayingSongId = i;
          break;
        }
      }
    }
    this.audio_src = this.MEDIA_PATH + this.playingSong['audio'];
    if(this.dataHandlerService.$isFriendsPlaylist){
      this.selectedSongArtist = this.getSelectedSongArtist(this.playingSong['album_id'], this.rest_service.$userFriendsAlbumlist, this.rest_service.$userFriendsArtistlist);
    }
    else{
      this.selectedSongArtist = this.getSelectedSongArtist(this.playingSong['album_id']);
    }
    this.playSong();
  }

  playNextSong(): void {
    this.pauseSong(true); 
    this.song_list_size = this.songsList.length;
    this.setSongInfo((this.nowPlayingSongId + 1)%this.song_list_size, true);
  }

  playPreviousSong(): void {
    this.pauseSong(true);
    this.song_list_size = this.songsList.length;
    if(this.nowPlayingSongId==0){
      this.setSongInfo(this.song_list_size - 1, true);
    }
    else{
      this.setSongInfo(--this.nowPlayingSongId, true);
    }
  }

  setVolume(volume: number): void {
    this.audioContainer.volume = volume;
  }

  setCurrentVolume(volume: number): void {
    this.currentVolume = volume;
  }

  muteSong(): void {
    if (this.audioContainer.volume) {
      this.setVolume(0);
      this.changeVolumeBarStatus(0);
    } else {
      this.setVolume(this.currentVolume);
      this.changeVolumeBarStatus(this.currentVolume * 100);
    }
  }

  changeVolumeBarStatus(persentage: number): void {
    this.volumeStatusBar.style.width = `${persentage}%`;
  }

  handChangeVolume(event: MouseEvent): void {
    const volumeBarProperty = this.volumeBar.getBoundingClientRect();
    const mousePosition = event.pageX - volumeBarProperty.left + pageXOffset;
    const volumePersentage = mousePosition * 100 / volumeBarProperty.width;
    this.changeVolumeBarStatus(volumePersentage);
    this.setCurrentVolume(volumePersentage / 100);
    this.setVolume(this.currentVolume);
  }

  getCurrentSongDuration(): number {
    return this.audioContainer.duration;
  }

  setCurrentSongTime(time: number): void {
    this.audioContainer.currentTime = time;
  }

  getCurrentSongTime(): number {
    return this.audioContainer.currentTime;
  }

  changeSongBarStatus(persentage: number): void {
    this.progressBarStatus.style.width = `${persentage}%`;
  }

  secondToMinutes(seconds: number): string {
    let time: string;
    let sec: number = seconds / 60;
    let min = parseInt(sec.toString());
    sec = Math.round(seconds) % 60;
    if (sec < 10) {
      time = min + ":0" + sec;
    }
    else {
      time = min + ":" + sec;
    }
    return time;
  }

  handChangeCurrentSongTime(event: MouseEvent): void {
    this.total_song_time = this.audioContainer.duration;
    const progressBarProperty = this.progressBar.getBoundingClientRect();
    const mousePosition = event.pageX - progressBarProperty.left + pageXOffset;
    const currentSongTimePercentage = mousePosition * 100 / progressBarProperty.width;
    this.current_song_time = this.total_song_time * currentSongTimePercentage / 100;
    this.changeSongBarStatus(currentSongTimePercentage);
    this.setCurrentSongTime(this.current_song_time);
    this.current_song_time = this.secondToMinutes(this.current_song_time);//to display on UI current song time
    this.total_song_time = this.secondToMinutes(this.total_song_time);//to display on UI total song time
  }
}

