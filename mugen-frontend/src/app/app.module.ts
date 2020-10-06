import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlbumComponent } from './album/album.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ArtistComponent } from './artist/artist.component';
import { SongComponent } from './song/song.component';
import { UserComponent } from './user/user.component';
import { AuthGuard } from 'src/services/auth-guard.service';

// primeNg
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AlbumDetailsComponent } from './album/album-details/album-details.component';
import {GrowlModule} from 'primeng/primeng';
import { MusicPlayerComponent } from '../music-player/music-player.component';
import { HomeComponent } from './home/home.component'

@NgModule({
  declarations: [
    AppComponent,
    AlbumComponent,
    NavBarComponent,
    ArtistComponent,
    SongComponent,
    UserComponent,
    AlbumDetailsComponent,
    MusicPlayerComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule, AppRoutingModule, HttpClientModule, ButtonModule, DialogModule, FormsModule,
    AngularFontAwesomeModule, BrowserAnimationsModule, ReactiveFormsModule, DropdownModule, MultiSelectModule, GrowlModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
