import {Component, OnInit} from '@angular/core';
import {LoadingService} from './loading.service';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit {
  constructor(public service: LoadingService) {
  }

  ngOnInit(): void {
  }

}
