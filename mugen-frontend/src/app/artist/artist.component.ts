import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestApiService } from 'src/services/rest-api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MugenDataHandlerService } from '../../services/mugen-data-handler.service'
import { SelectItem } from 'primeng/components/common/selectitem';
import { CommonSubscriptionService } from 'src/services/common-subscription.service'
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.css', '../../assets/css/dialog.css']
})
export class ArtistComponent implements OnInit, OnDestroy {

  //variables
  action: string = ''
  DJANGO_SERVER = 'http://127.0.0.1:8000'
  artists: any[] = [];
  artistList: SelectItem[];
  selectedArtistsID: any[] = [];
  add_artist: boolean = false;
  delete_artist: boolean = false;
  form: FormGroup;
  response;
  imageURL;
  subscription: Subscription;
  search_operation: boolean = false;
  is_artist_present: boolean = true;

  constructor(private rest_service: RestApiService, public dataHandlerService: MugenDataHandlerService,
    private common_subscription: CommonSubscriptionService, private router: Router) {
    this.subscription = this.common_subscription.getMessage().subscribe((response) => {
      if (response['msg'] == 'ARTIST_SEARCH_OPERATION') {
        if (response['data']['artists'].length != this.rest_service.$artist_list.length) { // if q==""(show all artist and add btn)
          this.search_operation = true;
        }
        else {
          this.search_operation = false;
        }
        this.artists = response['data']['artists'];
        sessionStorage.setItem('artists', JSON.stringify(this.artists));
        if (response['data']['artists'].length == 0) {
          this.dataHandlerService.showMsg("No such Artist", "error", "Error");
        }
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    let start_index = window.location.href.lastIndexOf('=');
    let type = window.location.href.substring(start_index - 1, start_index);
    this.rest_service.get_artists((artist_list) => {
      this.common_subscription.sendMessage("ARTISTS", artist_list);// send the artist_list to other component who subscribe the message service  
      if (type == 'q') {
        this.search_operation = true; // used to enable/disable add/delete artist btn
        this.artists = JSON.parse(sessionStorage.getItem('artists'));
      }
      else {
        this.artists = artist_list;
      }
      if (this.artists.length == 0) {
        this.is_artist_present = false;
      }
      else {
        this.is_artist_present = true;
      }
    });

    this.form = new FormGroup({
      'artist': new FormControl('', Validators.required),
      'artist_logo': new FormControl('')
    });


  }

  onChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('artist_logo').setValue(file);
    }
  }

  addArtist() {
    const formData = new FormData();
    formData.append('artist_logo', this.form.get('artist_logo').value == null ? '' : this.form.get('artist_logo').value);
    formData.append('artist_name', this.form.get('artist').value);
    this.rest_service.addArtist(formData, (response) => {
      if (response == 'error') {
        this.dataHandlerService.showMsg('Error in creating Artist', 'error', 'Error');
        return;
      }

      if (response != undefined || response != null) {
        let logo = response.artist_logo;
        logo = logo.substring(7);
        let data = { id: response.id, artist_name: response.artist_name, artist_logo: logo };
        this.artists.push(data);
        this.rest_service.$artist_list = this.artists;
        this.common_subscription.sendMessage("ARTIST_FROM_ADD", this.artists);// send the artist_list to other component who subscribe the message service  
      }
      this.form.reset();
    });
    this.add_artist = false;
  }

  showdeleteDialog() {
    this.delete_artist = true;
    this.artistList = [];
    this.artists.forEach(e => {
      this.artistList.push({ label: e.artist_name, value: e.id });
    });
  }

  deleteArtist() {
    this.rest_service.delete_artist(this.selectedArtistsID, (artist_list) => {
      this.action = "delete";
      this.artists = artist_list;
    });
    this.delete_artist = false;
    this.selectedArtistsID = [];
    this.common_subscription.sendMessage("ARTIST_FROM_DELETE", this.artists);// send the artist_list to other component who subscribe the message service  
  }
}
