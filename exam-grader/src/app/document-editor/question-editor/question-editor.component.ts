import {Component, Input, OnInit} from '@angular/core';
import {Question, QuestionBlock} from "../../exam";

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
})
export class QuestionEditorComponent implements OnInit {
  @Input()
  question: Question = {
    elements: [], points: 0
  }
  @Input()
  index: number = -1;

  visible: boolean = true;

  constructor() {
  }

  trackByFn(index: number, el: any): number {
    return index;
  }

  ngOnInit(): void {
  }

  changeElementType(event: QuestionBlock, i: number) {
    this.question.elements[i] = event;
  }

  addElement() {
    this.question.elements.push({question: undefined, answer: false});
  }

  collapse() {
    this.visible = !this.visible;
  }
}
