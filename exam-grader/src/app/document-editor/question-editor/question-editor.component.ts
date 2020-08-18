import {Component, Input, OnInit} from '@angular/core';
import {Question, QuestionBlock} from '../../exam';

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
})
export class QuestionEditorComponent implements OnInit {
  @Input()
  question: Question = {
    elements: [], points: 0
  };
  @Input()
  index = -1;

  visible = true;

  constructor() {
  }

  trackByFn(index: number, el: any): number {
    return index;
  }

  ngOnInit(): void {
  }

  changeElementType(event: QuestionBlock, i: number): void {
    this.question.elements[i] = event;
  }

  addElement(): void {
    this.question.elements.push({question: undefined, answer: false});
  }

  collapse(): void {
    this.visible = !this.visible;
  }
}
