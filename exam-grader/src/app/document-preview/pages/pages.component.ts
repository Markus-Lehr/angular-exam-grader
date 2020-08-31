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
import {StorageService} from '../../storage.service';

export interface Page {
  type: 'questions' | 'pdf';
  questions?: Question[];
  pdfId?: number;
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
  public pdfUrls: { [key: number]: SafeUrl } = {};
  pages: Page[] = [];
  private lastSizes: DOMRect[] = [];

  constructor(public examManager: ExamManagerService,
              private store: StorageService,
              private elem: ElementRef,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.setPages();
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
  };

  isImage = (elem: QuestionBlock) => {
    return typeof elem === 'object' && 'base64string' in elem;
  };

  isQuestion = (elem: QuestionBlock) => {
    return typeof elem === 'object' && 'question' in elem;
  };

  trackByFn(index, item: Question): any {
    return index + item.id;
  }

  setPages(): void {
    if (this.autoCompact) {
      const pages: Page[] = [];
      let currentPage: Page = undefined;
      let currentPageSize = 0;
      const maxPageHeight = 1400;

      let questionIndex = 0;
      for (const elem of this.examManager.exam.elementOrder) {
        if (elem.type === 'question') {
          if (!currentPage) {
            currentPageSize = 0;
            currentPage = {type: 'questions', questions: []};
          } else if (!!currentPage && currentPage.type !== 'questions') {
            if (currentPageSize > 0) {
              pages.push(currentPage);
            }
            currentPageSize = 0;
            currentPage = {type: 'questions', questions: []};
          }
          const questionSize = this.lastSizes[questionIndex] || {height: 0};
          if (currentPageSize + questionSize.height > maxPageHeight) {
            if (currentPageSize > 0) {
              pages.push(currentPage);
            }
            currentPageSize = 0;
            currentPage = {type: 'questions', questions: []};
          }
          currentPageSize += questionSize.height;
          if (!currentPage.questions) {
            currentPage = {type: 'questions', questions: []};
          }
          currentPage.questions.push(this.examManager.exam.questions[questionIndex]);
          questionIndex++;
        } else if (elem.type === 'pdf') {
          const pdfId = this.examManager.exam.customPdfs[elem.index];
          console.log(pdfId);
          /*this.store.getBlobAsURL(pdfId).then(url => {
            this.pdfUrls[pdfId] = url;
          });*/
          if (currentPageSize > 0) {
            pages.push(currentPage);
          }
          // break page
          currentPageSize = 0;
          currentPage = {
            type: 'pdf',
            pdfId,
            pdfPage: 1
          };
          // this.store.getPDFPages(this.examManager.exam.customPdfs[elem.index]).then(numPages => console.log(numPages));
        } else {
          if (currentPageSize > 0) {
            pages.push(currentPage);
          }
          // break page
          currentPageSize = 0;
          currentPage = undefined;
        }
      }
      if (currentPage) {
        pages.push(currentPage);
      }
      this.pages = pages;
      console.log(this.pages);
    } else {
      this.pages = this.examManager.exam.questions.map(q => {
        return {
          type: 'questions',
          questions: [q]
        };
      });
    }

    setTimeout(() => {
      this.setPages();
    }, 1000);
  }

  compactPages(sizes: DOMRect[]): void {
    this.lastSizes = sizes;
  }

  getQuestionNumber(pageIndex: number, questionIndex: number): number {
    const pages = this.pages;
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
