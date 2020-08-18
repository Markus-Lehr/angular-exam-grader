import {Component, OnInit} from '@angular/core';
import {ExamListEntry, EXAMPLE_EXAM_LIST} from '../exam-list-entry';
import {v4 as uuidv4} from 'uuid';
import {Router} from '@angular/router';

const EXAMS_KEY = 'exams';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent implements OnInit {
  exams: ExamListEntry[] = [];
  loadedExams: ExamListEntry[] = [];
  columnsToDisplay = ['examName', 'lastModified', 'id'];

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.loadExamsFromStorage();
  }

  createNew(): void {
    const newExam: ExamListEntry = {
      examName: 'New Exam',
      id: uuidv4(),
      lastModified: new Date()
    };
    this.loadedExams.push(newExam);
    localStorage.setItem(EXAMS_KEY, JSON.stringify(this.loadedExams));
    this.router.navigateByUrl('/exam/' + newExam.id);
  }

  private loadExamsFromStorage(): void {
    this.exams = JSON.parse(localStorage.getItem(EXAMS_KEY));
    if (!this.exams) {
      this.exams = EXAMPLE_EXAM_LIST;
    } else {
      this.loadedExams = this.exams;
    }
  }
}
