import {Component, OnInit} from '@angular/core';
import {ExamManagerService} from '../exam-manager.service';
import {ElementListEntry, Question} from '../exam';


@Component({
  selector: 'app-document-editor',
  templateUrl: './document-editor.component.html',
  styleUrls: ['./document-editor.component.scss']
})
export class DocumentEditorComponent implements OnInit {
  activeIndex = -1;

  constructor(public examManager: ExamManagerService) {
  }

  ngOnInit(): void {
  }


  trackByFn(index: number, el: ElementListEntry): number {
    if (el.type === 'question') {
      const question: Question = ExamManagerService.instance.exam.questions[el.index];
      return question?.id || index;
    }
    return index;
  }

  manageToggle(selectedIndex: number): void {
    if (this.activeIndex === selectedIndex) {
      this.activeIndex = -1;
    } else {
      this.activeIndex = selectedIndex;
    }
  }

  convertExamType(): void {
    console.log('converting exam type');
    this.examManager.exam.markingSheetOnly = !this.examManager.exam.markingSheetOnly;
  }

  createPageBreak(): void {
    this.examManager.exam.elementOrder.push({
      type: 'page-break',
      index: 0
    });
    this.examManager.modified = true;
  }

  createQuestion(): void {
    this.examManager.exam.questions.push({
      elements: ['Your question body goes here'],
      points: 5
    });
    this.examManager.exam.elementOrder.push({
      type: 'question',
      index: this.examManager.exam.questions.length - 1,
    });
    this.examManager.modified = true;
  }
}
