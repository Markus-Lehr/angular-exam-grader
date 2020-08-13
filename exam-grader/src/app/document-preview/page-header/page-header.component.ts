import { Component, OnInit } from '@angular/core';
import {ExamManagerService} from "../../exam-manager.service";

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {

  constructor(public examManager: ExamManagerService) { }

  ngOnInit(): void {
  }

}
