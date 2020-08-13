import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Exam} from "../exam";
import {ExamManagerService} from "../exam-manager.service";

@Component({
  selector: 'app-exam-editor',
  templateUrl: './exam-editor.component.html',
  styleUrls: ['./exam-editor.component.scss']
})
export class ExamEditorComponent implements OnInit {
  examId: string = undefined;

  constructor(private route: ActivatedRoute, private examManager: ExamManagerService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.examId = params['id'];
      this.examManager.loadExam(this.examId);

    });
  }

}
