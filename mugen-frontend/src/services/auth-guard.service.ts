import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { RestApiService } from './rest-api.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private rest_service : RestApiService) { }

    canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot): boolean {
        let user = localStorage.getItem('activeUser');
        if (user && user == 'null') {
            this.router.navigate(['/home']);
            return false;
        }
        else if(!this.rest_service.$isAlbumVisited && !state.url.includes("album")){
            this.router.navigate(['/home/album']);
            return false;
        }
        return true;
    }
}