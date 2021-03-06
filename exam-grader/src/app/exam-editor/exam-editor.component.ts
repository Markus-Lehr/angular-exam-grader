import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ExamManagerService} from '../exam-manager.service';

@Component({
  selector: 'app-exam-editor',
  templateUrl: './exam-editor.component.html',
  styleUrls: ['./exam-editor.component.scss']
})
export class ExamEditorComponent implements OnInit {
  examId: string = undefined;

  constructor(private route: ActivatedRoute, private examManager: ExamManagerService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      console.log(params);
      this.examId = params.get('id');
      this.examManager.loadExam(Number(this.examId));
    });
  }

}
