import {Injectable} from '@angular/core';
import {ExamManagerService} from "./exam-manager.service";
import {AnswerSheetEvaluation, AnswerState} from "./batch-result";

@Injectable({
  providedIn: 'root'
})
export class PointCalculatorService {

  constructor(private examManager: ExamManagerService) {
  }

  public calculatePoints(sheet: AnswerSheetEvaluation): void {
    let pts: number[] = [];
    for (let i = 0; i < this.examManager.exam.questions.length; i++){
      const question = this.examManager.exam.questions[i];
      const numMarks = sheet.answerStates[i].length;
      const ptPerMark = question.points / numMarks;
      let reachedPoints: number = 0;
      for (const state of sheet.answerStates[i]) {
        if (state === AnswerState.CORRECT) {
          reachedPoints += ptPerMark;
        } else if (state === AnswerState.WRONG) {
          reachedPoints -= ptPerMark;
        }
      }
      pts.push(Math.max(reachedPoints, 0));
    }
    sheet.individualPoints = pts;
    sheet.cumulatedPoints = pts.reduce((a, b) => a+b);
  }
}
