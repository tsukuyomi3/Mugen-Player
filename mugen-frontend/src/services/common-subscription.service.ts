import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CommonSubscriptionService {

  constructor() { }

  private subject =  new Subject<any>();

  sendMessage(message: string, data : any) {
    this.subject.next({ msg: message, data : data});
  }

  clearMessages() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
