import { Component, OnInit } from '@angular/core';
import { MugenDataHandlerService } from 'src/services/mugen-data-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(public dataHandlerService: MugenDataHandlerService){}
  ngOnInit() {}
}
