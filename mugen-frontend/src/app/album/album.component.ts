import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestApiService } from 'src/services/rest-api.service';
import { MugenDataHandlerService } from 'src/services/mugen-data-handler.service';
import { CommonSubscriptionService } from 'src/services/common-subscription.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css', '../../assets/css/dialog.css']
})
export class AlbumComponent implements OnInit, OnDestroy {

  //variables
  //contains all album info
  albums: any[] = [];
  artists: any[] = [];//contains all artist info
  delete_album: boolean = false;
  add_album: boolean = false;
  albumObj: any = {}// album object to send to album-details component (from parent to child component)
  from_artist: boolean = false;// to check if we came from artist page to enable/disable the artist field in add album dialog
  artist_id: number = -1;
  start_index: number;
  // add album dialog input variables
  artistList: any[] = []; //contains artist name for add album dialog box
  artist// artist_name in artist field in add album dialog box
  form: FormGroup;
  imageURL;
  uploadUrl: string = '';
  DJANGO_SERVER: string = "http://127.0.0.1:8000";
  subscription: Subscription;
  fromNavBar: boolean = false;
  search_operation: boolean = false;
  is_album_present: boolean = true;

  constructor(private rest_service: RestApiService, public dataHandlerService: MugenDataHandlerService,
    private router: Router, private common_subscription: CommonSubscriptionService) {
    this.subscription = this.common_subscription.getMessage().subscribe((response) => {
      if (response['msg'] == 'ALBUM_SEARCH_OPERATION') {
        if (response['data']['albums'].length != this.rest_service.$album_list.length) { // if q==""(show all albums and add btn)
          this.search_operation = true;
        }
        else {
          this.search_operation = false;
        }

        //to show add btn in case we open albums of particular artist when q==""
        if (window.location.href == sessionStorage.getItem("originalURL")) {
          this.search_operation = false;
        }
        this.fromNavBar = true;
        this.albums = response['data']['albums'];
        sessionStorage.setItem('albums', JSON.stringify(this.albums));
        if (response['data']['albums'].length == 0) {
          this.dataHandlerService.showMsg("No such Album", "error", "Error");
        }
      }
      else if (response['msg'] == "SHOW_ALL_ALBUMS") {
        this.albums = response['data'];
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.start_index = window.location.href.lastIndexOf('=');
    let q = window.location.href.substring(this.start_index + 1, window.location.href.length);
    let type = window.location.href.substring(this.start_index - 2, this.start_index);
    this.rest_service.get_artists((artist_list) => {
      this.artists = artist_list;
      this.rest_service.get_albums((album_list) => {
        if (this.start_index > -1) {
          if (type == 'id') { // to check for the albums for particular artist
            this.artist_id = parseInt(q);
            this.from_artist = true;
            this.albums = album_list.filter((e) => {
              return (e.artist_id == this.artist_id);
            });
            if (this.albums.length == 0) {
              this.dataHandlerService.showMsg("No Album of Selected Artist");
            }
            // send only the particular artist albums to navBar
            this.common_subscription.sendMessage("ALBUMS", this.albums);// send the album_list to other component who subscribe the message service
          }
          else {
            this.search_operation = true; // hiding add-album btn while searching
            this.albums = JSON.parse(sessionStorage.getItem('albums'));
          }
        }
        else {
          this.albums = album_list;
          //send all the albums to the navBar only when the albums link in navBar is clicked
          this.common_subscription.sendMessage("ALBUMS", this.albums);// send the album_list to other component who subscribe the message service
        }
        if (this.albums.length == 0) {
          this.is_album_present = false;
        }
        else {
          this.is_album_present = true;
        }
      });

    });
    this.form = new FormGroup({
      'artist': new FormControl({ value: '', disabled: this.from_artist }, Validators.required),
      'album': new FormControl('', Validators.required),
      'genre': new FormControl('', Validators.required),
      'album_logo': new FormControl('')
    });


  }

  getArtist(key: number) {
    return this.artists.filter(e => e.id == key).map(e => e.artist_name)[0];
  }

  deleteAlbum() {
    this.start_index = window.location.href.lastIndexOf('='); // again bcuz now we are not loading component on router navigate
    let q = window.location.href.substring(this.start_index + 1, window.location.href.length);
    let type = window.location.href.substring(this.start_index - 2, this.start_index);
    this.artist_id = parseInt(q);
    this.rest_service.delete_album((msg) => {
      if (this.start_index > -1) {
        if (this.artist_id > -1) {// for detail view
          this.albums = this.rest_service.album_list.filter((e) => {
            return (e.artist_id == this.artist_id);
          });
        }
        else { // for search
          this.albums = this.albums.filter(e => e.album_title != this.dataHandlerService.selected_album).map(e => e);
        }
      }
      else {
        this.albums = this.rest_service.album_list;
      }
      this.common_subscription.sendMessage("ALBUMS", this.rest_service.$album_list);// send the album_list to other component who subscribe the message service
      this.dataHandlerService.showMsg('Album ' + this.dataHandlerService.$selected_album + ' Succesfully Deleted', 'success');
      this.delete_album = false;
    });
  }

  showDeleteDialog(albumobj) {
    this.delete_album = true;
    this.dataHandlerService.$selected_album = albumobj.album_title;
    this.dataHandlerService.$selected_album_id = albumobj.id;
  }

  closeDeleteDialog() {
    this.delete_album = false;
  }

  showAddAlbumDialog() {
    this.add_album = true;
    if (this.from_artist) {
      this.artistList = this.artists.filter(e => e.id == this.artist_id);
    }
    else {
      this.artistList = this.artists;
    }
    this.artistList = this.dataHandlerService.setDropdownTable(this.artistList, "artist_name");
  }

  detailView(album) {
    let artist = this.artists.filter(e => e.id == album.artist_id).map(e => e.artist_name)[0];
    this.albumObj = album;
    this.albumObj['artist_name'] = artist;
    this.dataHandlerService.$detail_view = true;
    this.dataHandlerService.$selected_album = album.id;
  }

  onChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('album_logo').setValue(file);
    }
  }

  addAlbum() {
    const formData = new FormData();
    if (this.from_artist) {
      formData.append('artist', this.artist_id.toString());
    }
    else {
      formData.append('artist', this.form.value.artist.id);
    }
    formData.append('album_title', this.form.value.album);
    formData.append('genre', this.form.value.genre);
    formData.append('album_logo', this.form.get('album_logo').value == null ? '' : this.form.get('album_logo').value);
    this.rest_service.addAlbum(formData, (data) => {
      if (data == 'error') {
        this.dataHandlerService.showMsg('Error in creating Album', 'error', 'Error');
        return;
      }

      if (this.start_index > -1) {
        this.albums = data.filter((e) => {
          return (e.artist_id == this.artist_id);
        });
      }
      else {
        this.albums = data;
      }
      this.common_subscription.sendMessage("ALBUMS", this.rest_service.$album_list);// send the album_list to other component who subscribe the message service
      this.form.reset();
    });
    this.dataHandlerService.showMsg('Album ' + this.form.value.album + ' Succesfully Created', 'success');
    this.add_album = false;
  }

}
