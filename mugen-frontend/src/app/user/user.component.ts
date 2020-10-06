import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MugenDataHandlerService } from 'src/services/mugen-data-handler.service';
import { SelectItem } from 'primeng/primeng';
import { RestApiService } from 'src/services/rest-api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  friendsList : SelectItem[] = [];
  selectedFriends = [];
  constructor(private router : Router, private dataHandlerService: MugenDataHandlerService, 
    private rest_service : RestApiService) { }

  ngOnInit() {
    if(this.dataHandlerService.$user_friend_list.length > 0){
      this.friendsList = this.dataHandlerService.$user_friend_list;
    }
    this.rest_service.getUserFriendList(this.dataHandlerService.$activeUser, (res)=>{
      res.forEach(element => {
        this.friendsList.push({label : element, value : element});
      });
    });
  }
  logout() {
    this.dataHandlerService.$activeUser = "null";
    this.dataHandlerService.$isloginPage = true;
    this.router.navigate(['/home']);
  }

  showFriendsPlaylist(){
      if(this.selectedFriends.length==0){
      this.dataHandlerService.showMsg("Select atleast one friend", "warn", "Warning")
      return;
    }
    this.rest_service.getUserFriendsPlaylist(this.selectedFriends, (list)=>{
      if(list.length==0){
        this.dataHandlerService.showMsg("Empty Playlist");
      }
      this.router.navigate(['/home/song']);
    });
  }
}
