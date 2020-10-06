import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { CommonSubscriptionService } from '../../services/common-subscription.service'
import { Subscription } from 'rxjs';
import { RestApiService } from '../../services/rest-api.service'
import { MugenDataHandlerService } from 'src/services/mugen-data-handler.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  q: string = '';
  querySet = {};
  album_list: any[] = [];
  song_list: any[] = [];
  artist_list: any[] = [];
  subscription: Subscription;
  activeUser: string = "NULL";

  constructor(private commmon_subscription: CommonSubscriptionService, private router: Router,
    private rest_service: RestApiService, public dataHandlerService: MugenDataHandlerService) {
    this.subscription = this.commmon_subscription.getMessage().subscribe((response) => { // subscribe to message service to get the message from observable
      if (response['msg'] == 'ALBUMS') {
        this.album_list = response['data'];
      }
      if (response['msg'] == 'ARTISTS') {
        this.artist_list = response['data'];
      }
      if (response['msg'] == 'SONGS') {
        this.song_list = response['data'];
      }
    });
  }

  ngOnInit() {
    this.activeUser = localStorage.getItem("activeUser");
  }


  showUserPlaylist() {
    this.dataHandlerService.$isFriendsPlaylist = false;
  }
  showAllAlbum() {
    this.album_list = this.rest_service.$album_list;
    this.commmon_subscription.sendMessage("SHOW_ALL_ALBUMS", this.rest_service.$album_list)// show all albums when album link in nav-bar is clicked
    this.dataHandlerService.detail_view = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();// unsubscribe to ensure no memory leaks
  }
  getComponent(event, query: any) {
    this.q = query.value;
    let url = window.location.href;

    if (this.q.length > 0) {
      if (url.includes("q")) { // already search query exist
        url = url.substring(0, url.lastIndexOf("=")) + "=" + this.q;
      }
      else if (url.includes("?")) { // url with qqeryParam
        url = url + "&q=" + this.q;
      }
      else {
        url = url + "?q=" + this.q;
      }
      window.history.replaceState({}, '', url);
      sessionStorage.setItem("originalURL", "");
    }
    else {
      window.history.replaceState({}, '', this.router.routerState.snapshot.url);
      sessionStorage.setItem("originalURL", "http://localhost:4200" + this.router.routerState.snapshot.url);
    }

    if (url.includes('album')) {
      this.querySet['albums'] = this.album_list.filter((e) => {
        return ((e.album_title.toLowerCase()).includes(this.q.toLowerCase()));
      });
      this.commmon_subscription.sendMessage('ALBUM_SEARCH_OPERATION', this.querySet);
    }
    else if (url.includes('artist')) {
      this.querySet['artists'] = this.artist_list.filter((e) => {
        return ((e.artist_name.toLowerCase()).includes(this.q.toLowerCase()));
      });
      this.commmon_subscription.sendMessage('ARTIST_SEARCH_OPERATION', this.querySet);
    }
    else if (url.includes('song')) {
      this.querySet['songs'] = this.song_list.filter((e) => {
        return ((e.song_title.toLowerCase()).includes(this.q.toLowerCase()));
      });
      this.commmon_subscription.sendMessage('SONG_SEARCH_OPERATION', this.querySet);
    }
  }

}
