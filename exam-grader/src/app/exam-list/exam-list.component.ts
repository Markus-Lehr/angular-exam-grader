import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {StorageService} from '../storage.service';

const EXAMS_KEY = 'exams';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent implements OnInit {
  columnsToDisplay = ['examName', 'lastModified', 'id'];

  constructor(private router: Router, public store: StorageService) {
  }

  ngOnInit(): void {
  }

  async createNew(): Promise<void> {
    const generatedId = await this.store.createNewExam();
    this.router.navigateByUrl('/exam/' + generatedId);
  }
}
