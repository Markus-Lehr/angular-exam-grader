import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import {ExamManagerService} from "../exam-manager.service";
import {Point} from "@angular/cdk/drag-drop";
import {AR} from "js-aruco";
import PerspT from "perspective-transform";
import {AnswerSheetEvaluation, AnswerState, BatchResult} from "../batch-result";

const leftPadding = 0;
const rightPadding = 50;
const topPadding = 0;
const bottomPadding = 50;
const a4width = 210 * 5 - 2 * 10 /* white padding */;
const a4height = 297 * 5 - 2 * 10 /* white padding*/;
const filledColor = "rgba(0, 200, 200, .3)";
const emptyColor = "rgba(0, 0, 200, .2)";
const brightNessThreshold = 850;


@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss']
})
export class DocumentPreviewComponent implements OnInit {
  @ViewChild('pages') pages;
  @ViewChild('TmpCanvas') canvas;
  @ViewChild('markAnalyzer') markAnalyzerCanvas;

  pageTitles: string[] = ['page1', 'page2'];
  public canvWidth = leftPadding + rightPadding;
  public canvHeight = topPadding + bottomPadding
  private batchResult: BatchResult = {sheets: {}}

  constructor(private elRef: ElementRef, private examManager: ExamManagerService) {
  }

  ngOnInit(): void {
  }

  async sleep(s: number = 1) {
    await new Promise(resolve => setTimeout(resolve, 1000 * s));
  }

  async downloadPdf(event: MouseEvent) {
    console.log('downloading pdf');
    let pdf = new jsPDF();
    const pageRefs: HTMLCollection = this.pages.nativeElement.children;
    for (let i = 0; i < pageRefs.length; i++) {
      const pageRef = pageRefs.item(i) as HTMLElement;
      const canvas = await html2canvas(pageRef, {removeContainer: true, scale: 2});
      const contentDataURL = canvas.toDataURL('image/jpeg');
      if (i > 0) {
        pdf.addPage();
      }
      pdf.setPage(i + 1);
      //pdf.text('Hello World', 10, 10);
      await pdf.addImage(contentDataURL, 'JPEG', 0, 0, 210, 297);
    }
    pdf.save('test.pdf');
  }

  private markToPx(questionIndex: number, markIndex: number, truthValue: boolean): Point {
    const xOffset =
      50 /* marker width */ +
      100 /* question label width */;
    const yOffset =
      50 /* marker height */ +
      150 /* exam header height */ +
      10 /* spacer height */ +
      ((100 + 10) * questionIndex) /* previous question boxes' height + bottom margin */ +
      20 /* label height */;
    return {
      x: xOffset + markIndex * 30 /* checkbox width (20) + margin (10) */,
      y: yOffset + (truthValue ? 0 : 20) /* checkbox height (20) */
    }
  }

  async getImgCorners(img: HTMLImageElement, cx: CanvasRenderingContext2D): Promise<Point[]> {
    let detector = new AR.Detector();
    const corners: Point[] = [];
    const markers: Point[][] = [];
    const quarterWidth = img.width / 4;
    const quarterHeight = img.height / 4;
    this.canvWidth = quarterWidth;
    this.canvHeight = quarterHeight;
    cx.canvas.width = quarterWidth;
    cx.canvas.height = quarterHeight;
    // top left
    cx.drawImage(img, 0, 0, quarterWidth, quarterHeight, 0, 0, quarterWidth, quarterHeight);
    let marker: AR.Marker = detector.detect(cx.getImageData(0, 0, quarterWidth, quarterHeight))[0];
    let pt: Point = {...marker.corners[0]};
    markers.push(marker.corners);
    corners.push(pt);

    // top right
    cx.drawImage(img, 3 * quarterWidth, 0, quarterWidth, quarterHeight, 0, 0, quarterWidth, quarterHeight);
    marker = detector.detect(cx.getImageData(0, 0, quarterWidth, quarterHeight))[0];
    pt = {...marker.corners[1]};
    pt.x += 3 * quarterWidth;
    markers.push(marker.corners);
    corners.push(pt);

    // bottom left
    cx.drawImage(img, 0, 3 * quarterHeight, quarterWidth, quarterHeight, 0, 0, quarterWidth, quarterHeight);
    marker = detector.detect(cx.getImageData(0, 0, quarterWidth, quarterHeight))[0];
    pt = {...marker.corners[3]};
    pt.y += 3 * quarterHeight;
    markers.push(marker.corners);
    corners.push(pt);

    // bottom right
    cx.drawImage(img, 3 * quarterWidth, 3 * quarterHeight, quarterWidth, quarterHeight, 0, 0, quarterWidth, quarterHeight);
    marker = detector.detect(cx.getImageData(0, 0, quarterWidth, quarterHeight))[0];
    pt = {...marker.corners[2]};
    pt.x += 3 * quarterWidth;
    pt.y += 3 * quarterHeight;
    markers.push(marker.corners);
    corners.push(pt);
    return corners;
  }

  private static flattenPoints(pts: Point[]): number[] {
    const arr: number[] = [];
    for (const pt of pts) {
      arr.push(pt.x, pt.y);
    }
    return arr;
  }

  async processImage(img: HTMLImageElement, cx: CanvasRenderingContext2D, original: File) {
    const sourceCorners: Point[] = [
      {x: 0, y: 0},
      {x: a4width, y: 0},
      {x: 0, y: a4height},
      {x: a4width, y: a4height}
    ]
    const flatSourceCorners: number[] = DocumentPreviewComponent.flattenPoints(sourceCorners);
    const targetCorners: Point[] = await this.getImgCorners(img, cx);
    const flatTargetCorners: number[] = DocumentPreviewComponent.flattenPoints(targetCorners);
    const perspT = PerspT(flatSourceCorners, flatTargetCorners);

    this.canvWidth = img.width;
    this.canvHeight = img.height;
    cx.canvas.width = this.canvWidth;
    cx.canvas.height = this.canvHeight;
    cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
    cx.drawImage(img, 0, 0);

    const transformedWidth = perspT.transform(520, 0)[0] - perspT.transform(500, 0)[0];
    const transformedHeight = perspT.transform(0, 520)[1] - perspT.transform(0, 500)[1];
    const markCx: CanvasRenderingContext2D = this.markAnalyzerCanvas.nativeElement.getContext('2d');
    const brightNesses: number[] = [];
    const trueCertainTies: number[][] = [];
    const falseCertainTies: number[][] = [];
    for (let i = 0; i < this.examManager.exam.questions.length; i++) {
      trueCertainTies.push([]);
      falseCertainTies.push([]);
      const question = this.examManager.exam.questions[i];
      let markIndex = 0;
      for (const element of question.elements) {
        if (typeof element === 'object' && 'question' in element) {
          const truePt = this.markToPx(i, markIndex, true);
          const falsePt = this.markToPx(i, markIndex, false);

          const trueMarkCoords: number[] = perspT.transform(truePt.x, truePt.y);
          const trueMarkPt: Point = {x: trueMarkCoords[0] - 5, y: trueMarkCoords[1] + 5};
          const falseMarkCoords: number[] = perspT.transform(falsePt.x, falsePt.y);
          const falseMarkPt: Point = {x: falseMarkCoords[0] - 5, y: falseMarkCoords[1] + 5};

          markCx.drawImage(img, trueMarkPt.x, trueMarkPt.y, transformedWidth, transformedHeight, 0, 0, 32, 32);
          const trueBrightNess = markCx.getImageData(0, 0, markCx.canvas.width, markCx.canvas.height).data.reduce((a, b) => a + b) / (32 * 32);
          brightNesses.push(trueBrightNess);

          markCx.drawImage(img, falseMarkPt.x, falseMarkPt.y, transformedWidth, transformedHeight, 0, 0, 32, 32);
          const falseBrightNess = markCx.getImageData(0, 0, markCx.canvas.width, markCx.canvas.height).data.reduce((a, b) => a + b) / (32 * 32);
          brightNesses.push(falseBrightNess);


          if (trueBrightNess < brightNessThreshold) {
            cx.fillStyle = filledColor;
            trueCertainTies[i].push(1);
          } else {
            cx.fillStyle = emptyColor;
            trueCertainTies[i].push(0);
          }
          cx.fillRect(trueMarkPt.x, trueMarkPt.y, transformedWidth, transformedHeight);

          if (falseBrightNess < brightNessThreshold) {
            cx.fillStyle = filledColor;
            falseCertainTies[i].push(1);
          } else {
            cx.fillStyle = emptyColor;
            falseCertainTies[i].push(0);
          }
          cx.fillRect(falseMarkPt.x, falseMarkPt.y, transformedWidth, transformedHeight);
          markIndex++;
        }
      }
    }
    this.batchResult.sheets[original.name] = {
      trueCheckedCertainties: trueCertainTies,
      falseCheckedCertainties: falseCertainTies
    }
  }

  async addImageSrc(img: HTMLImageElement, src: string) {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img.height);
      img.onerror = reject;
      img.src = src;
    });
  }

  async importImages(files: FileList) {
    this.batchResult = {sheets: {}};
    const img: HTMLImageElement = new Image(1240, 1745);
    const canvas: HTMLCanvasElement = this.canvas.nativeElement as HTMLCanvasElement
    const cx: CanvasRenderingContext2D = canvas.getContext('2d');

    canvas.width = leftPadding + rightPadding;
    canvas.height = topPadding + bottomPadding;
    for (let i = 0; i < files.length; i++) {
      const file: File = files.item(i);
      await this.addImageSrc(img, URL.createObjectURL(file));
      await this.processImage(img, cx, file);
    }
    for (const sheet of Object.keys(this.batchResult.sheets)) {
      await this.evaluateSheet(this.batchResult.sheets[sheet]);
    }
    console.log(this.batchResult);
  }

  public getCanvasStyle(): any {
    return {
      width: this.canvWidth + 'px',
      height: this.canvHeight + 'px'
    }
  }

  private async evaluateSheet(sheet: AnswerSheetEvaluation) {
    sheet.answerStates = []
    for (let i = 0; i < this.examManager.exam.questions.length; i++) {
      sheet.answerStates.push([])
      let question = this.examManager.exam.questions[i];
      let markIndex = 0;
      for (const element of question.elements) {
        if (typeof element === 'object' && 'question' in element) {
          if (sheet.trueCheckedCertainties[i][markIndex] === 1 && sheet.falseCheckedCertainties[i][markIndex] === 1) {
            sheet.answerStates[i].push(AnswerState.WRONG);
          } else if (sheet.trueCheckedCertainties[i][markIndex] === 0 && sheet.falseCheckedCertainties[i][markIndex] === 0) {
            sheet.answerStates[i].push(AnswerState.EMPTY);
          } else {
            let answer: boolean = undefined;
            if (sheet.trueCheckedCertainties[i][markIndex] === 1) {
              answer = true;
            } else if (sheet.falseCheckedCertainties[i][markIndex] === 1) {
              answer = false;
            }
            if (answer === element.answer) {
              sheet.answerStates[i].push(AnswerState.CORRECT);
            } else {
              sheet.answerStates[i].push(AnswerState.WRONG);
            }
          }
          markIndex++;
        }
      }
    }
  }
}
