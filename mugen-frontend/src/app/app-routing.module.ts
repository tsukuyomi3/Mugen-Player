import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlbumComponent } from './album/album.component';
import { ArtistComponent } from './artist/artist.component';
import { SongComponent } from './song/song.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from 'src/services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home', component: HomeComponent,
    children: [
      {
        path: 'album',
        component: AlbumComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'details', component: AlbumComponent, canActivate: [AuthGuard]}
        ]
      },
      { path: 'artist', component: ArtistComponent, canActivate: [AuthGuard] },
      { path: 'song', component: SongComponent, canActivate: [AuthGuard] },
      { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
