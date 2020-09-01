import {Component, OnInit} from '@angular/core';
import {ExamManagerService} from '../exam-manager.service';
import {ElementListEntry, Question} from '../exam';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {type} from 'os';

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

  createPdf(): void {
    this.examManager.exam.customPdfs.push({id: -1});
    this.examManager.exam.elementOrder.push({
      type: 'pdf',
      index: this.examManager.exam.customPdfs.length - 1,
    });
    this.examManager.modified = true;
  }

  changeNumberOfAnswers(event: Event, question: Question) {
    // @ts-ignore
    const val = Number.parseInt(event.target.value);
    console.log(val);
    const marks = this.examManager.realMarks(question);
    if (marks.length > val) {
      marks.splice(val - 1, marks.length - val);
      question.elements = marks;
    } else {
      question.elements = marks;
      for (let i = marks.length; i < val; i++) {
        question.elements.push(false);
      }
    }
    this.examManager.modified = true;
  }

  deleteQuestion(question: Question, i: number) {
    console.log('delete question', i, question);
    this.examManager.exam.questions.splice(i, 1);
    this.examManager.modified = true;
  }

  toggleCheckbox(questionIndex: number, markIndex: number) {
    for (let i = 0; i < this.examManager.exam.questions[questionIndex].elements.length; i++){
      const element = this.examManager.exam.questions[questionIndex].elements[i];
      if (typeof element !== 'boolean') {
        this.examManager.exam.questions[questionIndex].elements = this.examManager.realMarks(this.examManager.exam.questions[questionIndex]);
        console.log('Had to change all questions to booleans');
        break;
      }
    }
    this.examManager.exam.questions[questionIndex].elements[markIndex] = !this.examManager.exam.questions[questionIndex].elements[markIndex];
    console.log(this.examManager.exam.questions[questionIndex].elements);
    this.examManager.modified = true;
  }
}
