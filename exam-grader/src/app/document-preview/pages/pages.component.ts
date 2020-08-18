import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {ExamManagerService} from '../../exam-manager.service';
import {Question, QuestionBlock} from '../../exam';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @Input()
  autoCompact = false;
  @Output()
  questionSizes = new EventEmitter<DOMRect[]>();
  private lastSizes: DOMRect[] = [];

  constructor(public examManager: ExamManagerService, private elem: ElementRef) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void {
    const sizes: DOMRect[] = [];
    const native = this.elem.nativeElement;
    const children: HTMLCollection = native.querySelectorAll('.question-body-wrapper-selector');
    for (let i = 0; i < children.length; i++) {
      const questionElem: Element = children.item(i);
      const questionRect: DOMRect = questionElem.getBoundingClientRect();
      sizes.push(questionRect);
    }
    this.questionSizes.emit(sizes);
  }

  isText = (elem: QuestionBlock) => {
    return typeof elem === 'string';
  }

  isImage = (elem: QuestionBlock) => {
    return typeof elem === 'object' && 'base64string' in elem;
  }

  isQuestion = (elem: QuestionBlock) => {
    return typeof elem === 'object' && 'question' in elem;
  }

  trackByFn(index, item): any {
    return index;
  }

  pages(): Question[][] {
    if (this.autoCompact) {
      const pages = [];
      let currentPage: Question[] = [];
      let currentPageSize = 0;
      const maxPageHeight = 1400;
      for (let i = 0; i < this.lastSizes.length; i++) {
        const questionSize = this.lastSizes[i];
        if (currentPageSize + questionSize.height > maxPageHeight) {
          currentPageSize = 0;
          pages.push(currentPage);
          currentPage = [];
        }
        currentPageSize += questionSize.height;
        currentPage.push(this.examManager.exam.questions[i]);
      }
      pages.push(currentPage);
      return pages;

    } else {
      return this.examManager.exam.questions.map(q => [q]);
    }
  }

  compactPages(sizes: DOMRect[]): void {
    this.lastSizes = sizes;
  }

  getQuestionNumber(pageIndex: number, questionIndex: number): number {
    const pages = this.pages();
    let questionNumber = 1 + questionIndex;
    for (let i = 0; i < pageIndex; i++) {
      questionNumber += pages[i].length;
    }
    return questionNumber;
  }
}
