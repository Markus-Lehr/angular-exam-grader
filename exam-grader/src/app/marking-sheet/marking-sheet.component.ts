import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ExamManagerService} from '../exam-manager.service';
import ArucoMarker from 'aruco-marker';
import {AnswerSheetEvaluation, AnswerState} from '../batch-result';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-marking-sheet',
  templateUrl: './marking-sheet.component.html',
  styleUrls: ['./marking-sheet.component.scss']
})
export class MarkingSheetComponent implements OnInit, AfterViewInit {
  @ViewChild('topLeftArucoMarker') topLeftArucoMarker;
  @ViewChild('topRightArucoMarker') topRightArucoMarker;
  @ViewChild('bottomLeftArucoMarker') bottomLeftArucoMarker;
  @ViewChild('bottomRightArucoMarker') bottomRightArucoMarker;

  @Input()
  sampleSolution = false;
  @Input()
  evaluation: AnswerSheetEvaluation = undefined;

  constructor(public examManager: ExamManagerService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.topLeftArucoMarker.nativeElement.innerHTML = new ArucoMarker(1).toSVG('50px');
    this.topRightArucoMarker.nativeElement.innerHTML = new ArucoMarker(2).toSVG('50px');
    this.bottomLeftArucoMarker.nativeElement.innerHTML = new ArucoMarker(3).toSVG('50px');
    this.bottomRightArucoMarker.nativeElement.innerHTML = new ArucoMarker(4).toSVG('50px');
  }

  answerState(questionIndex: number, markIndex: number): AnswerState {
    return this.evaluation.answerStates[questionIndex][markIndex];
  }

  getChecked(questionIndex: number, markIndex: number, correctValue: boolean, currentTruthValue: boolean): boolean {
    if (this.evaluation) {
      const state = this.answerState(questionIndex, markIndex);
      return (state === AnswerState.CORRECT && correctValue === currentTruthValue) ||
        (state === AnswerState.WRONG && correctValue !== currentTruthValue);
    } else {
      return this.sampleSolution && (currentTruthValue === correctValue);
    }
  }

  getColor(questionIndex: number, markIndex: number): ThemePalette {
    if (!this.evaluation) {
      return 'primary';
    }
    const state = this.answerState(questionIndex, markIndex);
    if (state === AnswerState.CORRECT) {
      return 'primary';
    } else if (state === AnswerState.WRONG) {
      return 'warn';
    } else {
      return 'accent';
    }
  }
}
