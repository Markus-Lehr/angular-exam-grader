import {Component, Input, OnInit} from '@angular/core';
import {Exam} from "../exam";
import {ExamManagerService} from "../exam-manager.service";

@Component({
  selector: 'app-document-editor',
  templateUrl: './document-editor.component.html',
  styleUrls: ['./document-editor.component.scss']
})
export class DocumentEditorComponent implements OnInit {
  constructor(public examManager: ExamManagerService) { }

  ngOnInit(): void {
  }

  createQuestion() {
    this.examManager.exam.questions.push({
      elements: ['Your question body goes here (with Latex)'],
      points: 5});
    this.examManager.modified = true;
  }

  trackByFn(index:number, el:any): number {
    return index;
  }
}
