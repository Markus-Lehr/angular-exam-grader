import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Point} from "@angular/cdk/drag-drop";
import {ExamManagerService} from "../exam-manager.service";
import ArucoMarker from "aruco-marker";

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
  sampleSolution: boolean = false;

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

}
