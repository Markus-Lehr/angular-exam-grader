import {Injectable} from '@angular/core';
import {Exam, Question, SubQuestion} from "./exam";
import {Point} from "@angular/cdk/drag-drop";
import {FULL_EXAM} from "./test-exams";

const demoExam: Exam = FULL_EXAM

@Injectable({
  providedIn: 'root'
})
export class ExamManagerService {
  public modified: boolean = false;
  public exam: Exam = demoExam;

  public verticalFactor = 40;
  public horizontalFactor = 40;
  public verticalOffset = 200;
  public horizontalLabelOffset = 100;
  public horizontalMarkOffset = this.horizontalLabelOffset + 100;

  constructor() {
  }


  private static styleForCoordWithOffset(coord: Point, offset: Point) {
    return {
      'position': 'absolute',
      'left': (coord.x + offset.x) + 'px',
      'top': (coord.y + offset.y) + 'px',
    }
  }

  public styleForCoord(coord: Point, truthValue: boolean = true) {
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
    let index: number = 0;
    for (let i = 0; i < question.elements.length; i++){
      if (i === elemNr) {
        return this.getChar(index);
      }
      let element = question.elements[i];
      if (typeof element === 'object' && 'question' in element) {
        index++;
      }
    }
    return this.getChar(0);
  }

  public getChar(charNum: number): string {
    return String.fromCharCode('a'.charCodeAt(0) + charNum);
  }

  public calculateMarkPositions(): Point[][] {
    console.log('calculating mark positions.')

    let pts: Point[][] = [];
    for (let i = 0; i < this.exam.questions.length; i++) {
      const question = this.exam.questions[i];
      const index = i * 3;
      const yCoord: number = index * this.verticalFactor + this.verticalOffset;
      let questionPoints: Point[] = [];
      let questionCounter = 0;
      for (const element of question.elements) {
        if (typeof element === 'object' && 'question' in element) {
          questionPoints.push({x: questionCounter * this.horizontalFactor + this.horizontalMarkOffset, y: yCoord});
          questionCounter++;
        }
      }
      pts.push(questionPoints);
    }
    console.log(pts);
    return pts;
  }

  loadExam(examId: string) {
    this.exam = JSON.parse(localStorage.getItem(examId));
    if (!this.exam) {
      this.generateNewExam(examId);
    }
  }

  public save() {
    localStorage.setItem(this.exam.id, JSON.stringify(this.exam));
    this.modified = false;
  }

  private generateNewExam(examId: string) {
    console.log('generating new exam');
    this.exam = {
      id: examId,
      date: new Date(),
      questions: [],
      title: 'New Exam'
    };
  }
}
