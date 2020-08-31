import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ElementListEntry, PdfEntry, Question} from '../../exam';
import {ExamManagerService} from '../../exam-manager.service';
import {StorageService} from '../../storage.service';
import {LoadingService} from '../../loading-screen/loading.service';

// noinspection DuplicatedCode
@Component({
  selector: 'app-exam-element-editor',
  templateUrl: './exam-element-editor.component.html',
  styleUrls: ['./exam-element-editor.component.scss']
})
export class ExamElementEditorComponent implements OnInit {
  question: Question;
  pdf: PdfEntry;

  @Input()
  elementIndex = -1;
  @Output()
  toggle = new EventEmitter<number>();
  @Output()
  moved = new EventEmitter<number>();

  constructor(private examManager: ExamManagerService, private store: StorageService, private loading: LoadingService) {
  }

  // tslint:disable-next-line:variable-name
  _element: ElementListEntry = {
    index: 0, type: 'page-break'
  };

  @Input()
  set element(val: ElementListEntry) {
    this._element = val;
    this.pdf = undefined;
    this.question = undefined;

    if (val.type === 'question') {
      this.question = this.examManager.exam.questions[val.index];
    } else if (val.type === 'pdf') {
      this.pdf = this.examManager.exam.customPdfs[val.index];
    }
  }

  // tslint:disable-next-line:variable-name
  _activeIndex = -1;

  @Input()
  set activeIndex(val: number) {
    this._activeIndex = val;
    if (this._activeIndex !== -1 && this._activeIndex === this.elementIndex) {
      this.store.populatePdfs(this.examManager.exam);
    }
  }

  trackByFn(index: number, el: any): number {
    return index;
  }

  ngOnInit(): void {
  }

  addElement(): void {
    this.question.elements.push({question: undefined, answer: false});
  }

  removeElement(): void {
    if (this._element.type === 'question') {
      for (let i = this.elementIndex + 1; i < this.examManager.exam.elementOrder.length; i++) {
        const elementListEntry = this.examManager.exam.elementOrder[i];
        if (elementListEntry.type === this._element.type) {
          elementListEntry.index--;
        }
      }
      this.examManager.exam.questions.splice(this._element.index, 1);
    } else if (this._element.type === 'pdf') {
      for (let i = this.elementIndex + 1; i < this.examManager.exam.elementOrder.length; i++) {
        const elementListEntry = this.examManager.exam.elementOrder[i];
        if (elementListEntry.type === this._element.type) {
          elementListEntry.index--;
        }
      }
      this.examManager.exam.customPdfs.splice(this._element.index, 1);
    }
    this.examManager.exam.elementOrder.splice(this.elementIndex, 1);
  }

  collapse(): void {
    this.toggle.emit(this.elementIndex);
  }


  move(direction: number): void {
    // check if element is on edge already
    if (this.elementIndex === 0 && direction === -1) {
      return;
    }
    if (this.elementIndex === this.examManager.exam.elementOrder.length - 1 && direction === 1) {
      return;
    }

    // check if neighbouring element block is of same type
    const ownListEntry = this.examManager.exam.elementOrder[this.elementIndex];
    const neighboringListEntry = this.examManager.exam.elementOrder[this.elementIndex + direction];
    console.log(this.examManager.exam);
    console.log('own entry', ownListEntry);
    console.log('neighbouring entry', neighboringListEntry);
    if (ownListEntry.type === neighboringListEntry.type) {
      // actual element indices need to be swapped
      if (ownListEntry.type === 'question') {
        [this.examManager.exam.questions[ownListEntry.index], this.examManager.exam.questions[neighboringListEntry.index]] =
          [this.examManager.exam.questions[neighboringListEntry.index], this.examManager.exam.questions[ownListEntry.index]];
      } else if (ownListEntry.type === 'pdf') {
        [this.examManager.exam.customPdfs[ownListEntry.index], this.examManager.exam.customPdfs[neighboringListEntry.index]] =
          [this.examManager.exam.customPdfs[neighboringListEntry.index], this.examManager.exam.customPdfs[ownListEntry.index]];
      } else {
        // noop; page breaks don't need to be flipped, since they are empty
      }
    } else {
      // different types' elements don't need to be swapped, only their pointers
      [this.examManager.exam.elementOrder[this.elementIndex], this.examManager.exam.elementOrder[this.elementIndex + direction]] =
        [this.examManager.exam.elementOrder[this.elementIndex + direction], this.examManager.exam.elementOrder[this.elementIndex]];
    }
    console.log(this.examManager.exam);
    this.moved.emit(direction);
    this.examManager.modified = true;
  }

  getTitle(): string {
    let prefix = '';
    switch (this._element.type) {
      case 'question':
        prefix = 'Question ';
        break;
      case 'pdf':
        prefix = 'PDF ';
        break;
      default:
        prefix = 'Page Break ';
    }
    return prefix + (this._element.index + 1);
  }

  importPdf(files: any): void {
    if (files.length !== 1) {
      return;
    }
    const file: File = files.item(0);
    console.log(file);

    this.loading.show = true;
    this.store.saveBlob(file).then(id => {
      this.loading.show = false;
      this.examManager.exam.customPdfs[this._element.index] = {
        id
      };
      this.store.populatePdfs(this.examManager.exam);
      this.pdf = this.examManager.exam.customPdfs[this._element.index];
    });
  }
}
