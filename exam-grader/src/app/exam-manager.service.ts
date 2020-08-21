import {Injectable} from '@angular/core';
import {Exam, Question} from './exam';
import {Point} from '@angular/cdk/drag-drop';
import * as FileSaver from 'file-saver';
import {StorageService} from './storage.service';

const demoExam: Exam = {
  customPdfs: [], date: undefined, elementOrder: [], questions: [], title: ''
};

@Injectable({
  providedIn: 'root'
})
export class ExamManagerService {
  public static instance: ExamManagerService = undefined;

  public modified = false;
  public exam: Exam = demoExam;
  public lastExamId: number = undefined;

  public verticalFactor = 40;
  public horizontalFactor = 40;
  public verticalOffset = 200;
  public horizontalLabelOffset = 100;
  public horizontalMarkOffset = this.horizontalLabelOffset + 100;

  private fileReader: FileReader;

  constructor(private store: StorageService) {
    this.fileReader = new FileReader();
    ExamManagerService.instance = this;
  }


  private static styleForCoordWithOffset(coord: Point, offset: Point): any {
    return {
      position: 'absolute',
      left: (coord.x + offset.x) + 'px',
      top: (coord.y + offset.y) + 'px',
    };
  }

  public styleForCoord(coord: Point, truthValue: boolean = true): any {
    return ExamManagerService.styleForCoordWithOffset(coord, {x: 0, y: truthValue ? 0 : this.verticalFactor});
  }

  public styleForTruthLabel(rowIndex: number, truthValue: boolean): any {
    rowIndex = rowIndex * 3;
    const coord: Point = {x: this.horizontalLabelOffset + 20, y: rowIndex * this.verticalFactor + this.verticalOffset};
    return this.styleForCoord(coord, truthValue);
  }

  public styleForMarkLabel(rowIndex: number, colIndex): any {
    rowIndex = rowIndex * 3 - 0.6;

    const coord: Point = {
      x: colIndex * this.horizontalFactor + this.horizontalMarkOffset,
      y: rowIndex * this.verticalFactor + this.verticalOffset
    };
    return this.styleForCoord(coord, true);
  }

  public styleForQuestionLabel(rowIndex: number): any {
    rowIndex = rowIndex * 3 - 0.6;

    const coord: Point = {x: this.horizontalLabelOffset, y: rowIndex * this.verticalFactor + this.verticalOffset};
    return this.styleForCoord(coord, true);
  }

  public getCharOfElem(question: Question, elemNr: number): string {
    let index = 0;
    for (let i = 0; i < question.elements.length; i++) {
      if (i === elemNr) {
        return this.getChar(index);
      }
      const element = question.elements[i];
      if (typeof element === 'object' && 'answer' in element) {
        index++;
      }
    }
    return this.getChar(0);
  }

  public getChar(charNum: number): string {
    return String.fromCharCode('a'.charCodeAt(0) + charNum);
  }

  public realMarks(question: Question): boolean[] {
    const markResults: boolean[] = [];
    for (const element of question.elements) {
      if (typeof element === 'object' && 'answer' in element) {
        markResults.push(element.answer);
      }
    }
    return markResults;
  }

  public calculateMarkPositions(): Point[][] {
    const pts: Point[][] = [];
    for (let i = 0; i < this.exam.questions.length; i++) {
      const question = this.exam.questions[i];
      const index = i * 3;
      const yCoord: number = index * this.verticalFactor + this.verticalOffset;
      const questionPoints: Point[] = [];
      let questionCounter = 0;
      for (const element of question.elements) {
        if (typeof element === 'object' && 'answer' in element) {
          questionPoints.push({x: questionCounter * this.horizontalFactor + this.horizontalMarkOffset, y: yCoord});
          questionCounter++;
        }
      }
      pts.push(questionPoints);
    }
    return pts;
  }

  async loadExam(examId: number): Promise<void> {
    this.lastExamId = examId;
    this.exam = await this.store.loadExam(examId);
    if (!this.exam) {
      this.generateNewExam(examId);
    }
  }

  public save(): void {
    this.store.saveExam(this.exam);
    this.modified = false;
  }

  export(event: MouseEvent): void {
    const examBytes: Uint8Array = new TextEncoder().encode(JSON.stringify(this.exam));
    const blob = new Blob([examBytes], {
      type: 'application/json;charset=utf-8'
    });
    FileSaver.saveAs(blob, this.exam.title + '.json');
  }

  import(files: FileList): void {
    if (files.length !== 1) {
      return;
    }
    const file: File = files.item(0);
    console.log(file);
    this.fileReader.onload = (contentWrapper => {
      const result = contentWrapper.target.result;
      if (result && typeof result === 'string') {
        this.exam = JSON.parse(result);
        this.modified = true;
      }
    });
    this.fileReader.readAsText(file);
  }

  private generateNewExam(examId: number): void {
    console.log('generating new exam');
    this.exam = {
      id: examId,
      date: new Date(),
      questions: [], customPdfs: [], elementOrder: [],
      title: 'New Exam'
    };
  }
}
