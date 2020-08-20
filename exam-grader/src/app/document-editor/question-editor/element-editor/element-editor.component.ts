import {Component, Input, OnInit} from '@angular/core';
import {Question, QuestionBlockTypes} from '../../../exam';
import {ExamManagerService} from '../../../exam-manager.service';


@Component({
  selector: 'app-element-editor',
  templateUrl: './element-editor.component.html',
  styleUrls: ['./element-editor.component.scss']
})
export class ElementEditorComponent implements OnInit {
  types = QuestionBlockTypes;
  @Input()
  question: Question = {elements: [], points: 0};
  @Input()
  elementIndex = 0;

  constructor(public examManager: ExamManagerService) {
  }

  ngOnInit(): void {
  }

  public getElemTypes(): number[] {
    return Object.keys(this.types).filter(k => !isNaN(Number(k))).map(k => Number(k));
  }

  public getCurrentType(): number {
    if (typeof this.question.elements[this.elementIndex] === 'string') {
      return this.types.Text;
    }
    // @ts-ignore
    if (typeof this.question.elements[this.elementIndex] === 'object' && 'base64string' in this.question.elements[this.elementIndex]) {
      return this.types.Image;
    } else { // @ts-ignore
      if (typeof this.question.elements[this.elementIndex] === 'object' && 'answer' in this.question.elements[this.elementIndex]) {
        return this.types.Subquestion;
      }
    }
  }

  move(direction: number): void {
    if (this.elementIndex === 0 && direction === -1) {
      return;
    }
    if (this.elementIndex === this.question.elements.length - 1 && direction === 1) {
      return;
    }
    [this.question.elements[this.elementIndex], this.question.elements[this.elementIndex + direction]] =
      [this.question.elements[this.elementIndex + direction], this.question.elements[this.elementIndex]];
    this.examManager.modified = true;
  }

  remove(): void {
    this.examManager.modified = true;
    this.question.elements.splice(this.elementIndex, 1);
  }

  changeType(value: any): void {
    const enumValue = Number(value);
    const current = this.getCurrentType();
    console.log('selecting type:', enumValue, 'current:', current);
    if (current === enumValue) {
      return;
    }
    switch (enumValue) {
      case this.types.Text:
        this.question.elements[this.elementIndex] = '';
        break;
      case this.types.Image:
        this.question.elements[this.elementIndex] = {
          base64string: undefined
        };
        break;
      default:
        this.question.elements[this.elementIndex] = {
          answer: false, question: undefined
        };
    }
    this.examManager.modified = true;
  }
}
