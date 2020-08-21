import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {ExamManagerService} from '../../exam-manager.service';
import {Question, QuestionBlock} from '../../exam';
import {SafeUrl} from '@angular/platform-browser';

export interface Page {
  type: 'questions' | 'pdf' | 'blank';
  questions?: Question[];
  pdfUrl?: SafeUrl;
  pdfPage?: number;
}

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

  constructor(public examManager: ExamManagerService,
              private elem: ElementRef,
              private changeDetector: ChangeDetectorRef) {
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
    this.changeDetector.detectChanges();
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

  pages(): Page[] {
    if (this.autoCompact) {
      const pages: Page[] = [];
      let currentPage: Page = {type: 'blank'};
      let currentPageSize = 0;
      const maxPageHeight = 1400;

      let questionIndex = 0;
      for (const elem of this.examManager.exam.elementOrder) {
        if (elem.type === 'question') {
          if (!currentPage || currentPage.type === 'blank') {
            currentPage = {type: 'questions', questions: []};
          }
          const questionSize = this.lastSizes[questionIndex] || {height: 0};
          if (currentPageSize + questionSize.height > maxPageHeight) {
            currentPageSize = 0;
            pages.push(currentPage);
            currentPage = {type: 'blank'};
          }
          currentPageSize += questionSize.height;
          if (!currentPage.questions) {
            currentPage.questions = [];
          }
          currentPage.questions.push(this.examManager.exam.questions[questionIndex]);
          questionIndex++;
        } else if (elem.type === 'pdf') {
          // TODO: Append pdf
        } else {
          // break page
          currentPageSize = 0;
          pages.push(currentPage);
          currentPage = {type: 'blank'};
        }
      }
      pages.push(currentPage);
      return pages;

    } else {
      return this.examManager.exam.questions.map(q => {
        return {
          type: 'questions',
          questions: [q]
        };
      });
    }
  }

  compactPages(sizes: DOMRect[]): void {
    this.lastSizes = sizes;
  }

  getQuestionNumber(pageIndex: number, questionIndex: number): number {
    const pages = this.pages();
    let questionNumber = 1 + questionIndex;
    for (let i = 0; i < pageIndex; i++) {
      const page: Page = pages[i];
      if (page.type === 'questions') {
        questionNumber += pages[i]?.questions?.length || 0;
      }
    }
    return questionNumber;
  }
}
