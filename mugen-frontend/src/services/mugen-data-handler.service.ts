import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MugenDataHandlerService {

  constructor() { }

  //variables
  delete_album : boolean = false;
  add_album: boolean = false;
  selected_album_id : string;
  selected_album : string;
  detail_view : boolean = false;
  selectedSongID : number;
  activeUser : string = localStorage.getItem("activeUser");
  activeUserID : number ;
  isloginPage : boolean = localStorage.getItem("isloginPage") ? JSON.parse(localStorage.getItem("isloginPage")) : true;
  isFriendsPlaylist : boolean = false;
  msgs = [];
  user_friend_list = [];


  
  //To Show Info Message
  showMsg(msg: string, severity: string = 'info', summary: string = 'Info') {
    this.msgs = [];
    this.msgs.push({ severity: severity, summary: summary, detail: msg });
  }

  //set dropdown table in 
  setDropdownTable(array : any , label : string) {
    let temp_arr = [];
    array.forEach(e => {
      temp_arr.push({ label: e[label], value: e});
    });
    return temp_arr;
  }

  //getter and setters
  public set $delete_album(value: any) {
    this.delete_album = value;
  }
  public get $delete_album() {
    return this.delete_album;
  }
  public set $add_album(value: any) {
    this.add_album = value;
  }
  public get $add_album() {
    return this.add_album;
  }
  public set $selected_album_id(value: any) {
    this.selected_album_id = value;
  }
  public get $selected_album_id() {
    return this.selected_album_id;
  }
  public set $selected_album(value: any) {
    this.selected_album = value;
  }
  public get $selected_album() {
    return this.selected_album;
  }
  public set $detail_view(value: any) {
    this.detail_view = value;
  }
  public get $detail_view() {
    return this.detail_view;
  }
  public set $selectedSongID(value: number) {
    this.selectedSongID = value;
  }
  public get $selectedSongID() {
    return this.selectedSongID;
  }
  public set $activeUser(value: string) {
    this.activeUser = value;
    localStorage.setItem("activeUser", value);
  }
  public get $activeUser() {
    return this.activeUser;
  }
  public set $activeUserID(value: number) {
    this.activeUserID = value;
  }
  public get $activeUserID() {
    return this.activeUserID;
  }
  public set $isloginPage(value: boolean) {
    this.isloginPage = value;
    localStorage.setItem("isloginPage", String(value));
  }
  public get $isloginPage() {
    return this.isloginPage;
  }
  public set $user_friend_list(value) {
    this.user_friend_list = value;
  }
  public get $user_friend_list() {
    return this.user_friend_list;
  }
  public set $isFriendsPlaylist(value : boolean) {
    this.isFriendsPlaylist = value;
  }
  public get $isFriendsPlaylist() {
    return this.isFriendsPlaylist;
  }
 
}
