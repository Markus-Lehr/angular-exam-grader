import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ExamManagerService} from '../exam-manager.service';
import {TensorflowCheckboxEvaluatorService} from '../tensorflow-checkbox-evaluator.service';
import {AnswerSheetEvaluation, AnswerState, BatchResult, ProcessingState} from '../batch-result';
import {Point} from '@angular/cdk/drag-drop';
import * as JSZip from 'jszip';
import {AR} from 'js-aruco';
import {createWorker, OEM, PSM, Worker} from 'tesseract.js';
import PerspT from 'perspective-transform';
import {PointCalculatorService} from '../point-calculator.service';
import {LoadingService} from '../loading-screen/loading.service';

const leftPadding = 0;
const rightPadding = 50;
const topPadding = 0;
const bottomPadding = 50;

const a4width = 210 * 5 - 2 * 10 /* white padding */;
const a4height = 297 * 5 - 2 * 10 /* white padding*/;

const filledColor = 'rgba(0, 0 ,200, .2)';
const emptyColor = 'rgba(200,0,0, 0)';
const uncertainColor = 'rgb(255,200,0, .5)';

const certaintyThreshold = 0.98; /* the certainty threshold needs to be exceeded in order for the library to be trusted */
const inverseThreshold = 1 - certaintyThreshold;

@Component({
  selector: 'app-evaluator',
  templateUrl: './evaluator.component.html',
  styleUrls: ['./evaluator.component.scss']
})
export class EvaluatorComponent implements OnInit {
  @ViewChild('MainAnalysisCanvas') mainCanvas;
  @ViewChild('FirstNameAnalysisCanvas') firstNameCanvas;
  @ViewChild('LastNameAnalysisCanvas') lastNameCanvas;
  @ViewChild('ImmatriculationNumberAnalysisCanvas1') immatriculationCanvas1;
  @ViewChild('ImmatriculationNumberAnalysisCanvas2') immatriculationCanvas2;
  @ViewChild('ImmatriculationNumberAnalysisCanvas3') immatriculationCanvas3;
  @ViewChild('ImmatriculationNumberAnalysisCanvas4') immatriculationCanvas4;
  @ViewChild('ImmatriculationNumberAnalysisCanvas5') immatriculationCanvas5;
  @ViewChild('ImmatriculationNumberAnalysisCanvas6') immatriculationCanvas6;
  @ViewChild('ImmatriculationNumberAnalysisCanvas7') immatriculationCanvas7;
  @ViewChild('ImmatriculationNumberAnalysisCanvas8') immatriculationCanvas8;
  @ViewChild('SingleMarkAnalysisCanvas') markAnalyzerCanvas;

  public batchResult: BatchResult = {sheets: {}};
  public sheetNames: string[] = [];
  private canvWidth = leftPadding + rightPadding;
  private canvHeight = topPadding + bottomPadding;
  private orcDigitWorker: Worker;
  private orcNameWorker: Worker;

  constructor(private route: ActivatedRoute,
              private examManager: ExamManagerService,
              private tfEval: TensorflowCheckboxEvaluatorService,
              private pointCalculator: PointCalculatorService,
              private loading: LoadingService) {
  }

  private static flattenPoints(pts: Point[]): number[] {
    const arr: number[] = [];
    for (const pt of pts) {
      arr.push(pt.x, pt.y);
    }
    return arr;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.examManager.loadExam(params.id);
    });
    this.initOcr().then(() => {
      console.log('OCR initialized');
    });
  }

  async initOcr(): Promise<void> {
    this.orcDigitWorker = createWorker({
      // logger: m => console.log(m),
    });
    await this.orcDigitWorker.load();
    await this.orcDigitWorker.loadLanguage('deu');
    await this.orcDigitWorker.initialize('deu');
    await this.orcDigitWorker.setParameters({
      tessedit_ocr_engine_mode: OEM.DEFAULT,
      tessedit_pageseg_mode: PSM.SINGLE_CHAR,
      tessedit_char_whitelist: '0123456789',
    });

    this.orcNameWorker = createWorker({
      // logger: m => console.log(m),
    });
    await this.orcNameWorker.load();
    await this.orcNameWorker.loadLanguage('deu');
    await this.orcNameWorker.initialize('deu', OEM.TESSERACT_LSTM_COMBINED);
    await this.orcNameWorker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzäöüßABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ- \'`´',
    });
  }

  async importFiles(files: FileList): Promise<void> {
    this.loading.show = true;
    console.log(files);
    await this.tfEval.initialize();
    this.batchResult = {sheets: {}};
    this.sheetNames = [];
    const img: HTMLImageElement = new Image(1240, 1745);
    const canvas: HTMLCanvasElement = this.mainCanvas.nativeElement as HTMLCanvasElement;
    const cx: CanvasRenderingContext2D = canvas.getContext('2d');

    canvas.width = leftPadding + rightPadding;
    canvas.height = topPadding + bottomPadding;
    // init results object
    for (let i = 0; i < files.length; i++) {
      const file: File = files.item(i);
      this.batchResult.sheets[file.name] = {processingState: ProcessingState.NOT_STARTED};
      this.sheetNames.push(file.name);
    }

    for (let i = 0; i < files.length; i++) {
      const file: File = files.item(i);
      await this.addImageSrc(img, URL.createObjectURL(file));
      await this.processImage(img, cx, file);
    }
    for (const sheet of Object.keys(this.batchResult.sheets)) {
      await this.evaluateSheet(this.batchResult.sheets[sheet]);
    }
    this.loading.show = false;
    console.log(this.batchResult);
  }

  markToPx(questionIndex: number, markIndex: number, truthValue: boolean): Point {
    let nextCol = false;
    if (questionIndex > 8) {
      nextCol = true;
      questionIndex -= 9;
    } else if (questionIndex > 18) {
      console.warn('probably to many different questions; cant comprehend questionIndex:', questionIndex);
      return undefined;
    }
    const xOffset =
      50 /* marker width */ +
      100 /* question label width */;
    const yOffset =
      50 /* marker height */ +
      150 /* exam header height */ +
      10 /* spacer height */ +
      ((100 + 10) * questionIndex) /* previous question boxes' height + bottom margin */ +
      20 /* label height */;
    const halfWidth = (a4width - 50 * 2 /* marker widths */) / 2;
    return {
      x: xOffset + (nextCol ? halfWidth : 0) + markIndex * 30 /* checkbox width (20) + margin (10) */,
      y: yOffset + (truthValue ? 0 : 20) /* checkbox height (20) */
    };
  }

  iconForFile(file: string): string {
    if (this.batchResult.sheets[file].processingState === ProcessingState.NOT_STARTED) {
      return 'not_started';
    }
    if (this.batchResult.sheets[file].processingState === ProcessingState.WORKING) {
      return 'pending';
    }
    if (this.batchResult.sheets[file].processingState === ProcessingState.DONE) {
      return 'offline_pin';
    }
    if (this.batchResult.sheets[file].processingState === ProcessingState.MANUAL_INTERVENTION_NECESSARY) {
      return 'offline_bolt';
    } else {
      return 'offline_bolt';
    }
  }

  private async addImageSrc(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }

  private async getImgCorners(img: HTMLImageElement, cx: CanvasRenderingContext2D): Promise<Point[]> {
    const detector = new AR.Detector();
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

  private async readImmatriculationNumber(img: HTMLImageElement, original: File, perspective: any): Promise<void> {
    const digitCanvases: HTMLCanvasElement[] = [
      this.immatriculationCanvas1.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas2.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas3.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas4.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas5.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas6.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas7.nativeElement as HTMLCanvasElement,
      this.immatriculationCanvas8.nativeElement as HTMLCanvasElement
    ];
    const digitContextes: CanvasRenderingContext2D[] = digitCanvases.map(c => c.getContext('2d'));
    const firstNameCanvas = this.firstNameCanvas.nativeElement as HTMLCanvasElement;
    const firstNameCx: CanvasRenderingContext2D = firstNameCanvas.getContext('2d');
    const lastNameCanvas = this.lastNameCanvas.nativeElement as HTMLCanvasElement;
    const lastNameCx: CanvasRenderingContext2D = lastNameCanvas.getContext('2d');

    const thirdInnerA4 = (a4width - 2 * 50 /* marker widths either side*/) / 3;
    firstNameCanvas.width = thirdInnerA4;
    firstNameCanvas.height = 32;
    lastNameCanvas.width = thirdInnerA4;
    lastNameCanvas.height = 32;
    digitCanvases.forEach(c => {
      c.width = thirdInnerA4 / 8;
      c.height = 32;
    });
    digitContextes.forEach(cx => {
      cx.globalCompositeOperation = '';
    });

    const firstNamePoint: Point = {
      x: 50 /* marker width */,
      y: 50 /* marker height */ + 30 + 16 /* title height + margin */ + 32 /* table header height + border */
    };
    const transformedFirstNamePoint: number[] = perspective.transform(firstNamePoint.x, firstNamePoint.y);

    const lastNamePoint: Point = {
      x: 50 /* marker width */ + thirdInnerA4,
      y: 50 /* marker height */ + 30 + 16 /* title height + margin */ + 32 /* table header height + border */
    };
    const transformedLastNamePoint: number[] = perspective.transform(lastNamePoint.x, lastNamePoint.y);

    const immatriculationPoints: Point[] = digitCanvases.map((elem, index) => {
      return {
        x: lastNamePoint.x + thirdInnerA4 + index * (thirdInnerA4 / 8),
        y: firstNamePoint.y
      };
    });
    const transformedImmatriculationPoints: number[][] = immatriculationPoints.map(pt => perspective.transform(pt.x, pt.y));

    let transformedNameWidth;
    let transformedHeight;
    [transformedNameWidth, transformedHeight] = perspective.transform(
      firstNamePoint.x + thirdInnerA4, firstNamePoint.y + 32 /* table header + border */)
      .map((e, i) => e - transformedFirstNamePoint[i]);
    const transformedDigitWidth = perspective.transform(firstNamePoint.x + thirdInnerA4 / 8, firstNamePoint.y + 32)
      .map((e, i) => e - transformedFirstNamePoint[i])[0];

    digitContextes.forEach((cx, index) => {
      cx.drawImage(img, transformedImmatriculationPoints[index][0], transformedImmatriculationPoints[index][1],
        transformedDigitWidth, transformedHeight, 0, 0, thirdInnerA4 / 8, 32);
    });

    for (let i = 0; i < digitCanvases.length; i++) {
      const canvas = digitCanvases[i];
      const immatResult = await this.orcDigitWorker.recognize(canvas);
      const immatText = immatResult.data.text;
      console.log('immatriculation digit', (i + 1), ':', immatText);
    }
    firstNameCx.drawImage(img, transformedFirstNamePoint[0], transformedFirstNamePoint[1],
      transformedNameWidth, transformedHeight, 0, 0, thirdInnerA4, 32);
    const firstNameResult = await this.orcNameWorker.recognize(firstNameCanvas);
    const firstNameText = firstNameResult.data.text;
    console.log('first name:', firstNameText);

    lastNameCx.drawImage(img, transformedLastNamePoint[0], transformedLastNamePoint[1],
      transformedNameWidth, transformedHeight, 0, 0, thirdInnerA4, 32);
    const lastNameResult = await this.orcNameWorker.recognize(lastNameCanvas);
    const lastNameText = lastNameResult.data.text;
    console.log('last name:', lastNameText);
  }

  private async processImage(img: HTMLImageElement, cx: CanvasRenderingContext2D, original: File): Promise<void> {
    this.batchResult.sheets[original.name].processingState = ProcessingState.WORKING;
    const sourceCorners: Point[] = [
      {x: 0, y: 0},
      {x: a4width, y: 0},
      {x: 0, y: a4height},
      {x: a4width, y: a4height}
    ];
    const flatSourceCorners: number[] = EvaluatorComponent.flattenPoints(sourceCorners);
    const targetCorners: Point[] = await this.getImgCorners(img, cx);
    const flatTargetCorners: number[] = EvaluatorComponent.flattenPoints(targetCorners);
    const perspT = PerspT(flatSourceCorners, flatTargetCorners);

    this.canvWidth = img.width;
    this.canvHeight = img.height;
    cx.canvas.width = this.canvWidth;
    cx.canvas.height = this.canvHeight;
    cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height);
    cx.drawImage(img, 0, 0);

    await this.readImmatriculationNumber(img, original, perspT);

    const transformedWidth = perspT.transform(520, 0)[0] - perspT.transform(500, 0)[0];
    const transformedHeight = perspT.transform(0, 520)[1] - perspT.transform(0, 500)[1];
    const markCx: CanvasRenderingContext2D = this.markAnalyzerCanvas.nativeElement.getContext('2d');
    const trueCertainTies: number[][] = [];
    const falseCertainTies: number[][] = [];
    const zip = new JSZip();

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
          const truePrediction = await this.tfEval.predict(markCx.canvas);
          zip.file('mark' + i + '_' + markIndex + '_true.png',
            markCx.canvas.toDataURL().replace('data:image/png;base64,', ''),
            {base64: true});

          markCx.drawImage(img, falseMarkPt.x, falseMarkPt.y, transformedWidth, transformedHeight, 0, 0, 32, 32);
          const falsePrediction = await this.tfEval.predict(markCx.canvas);
          zip.file('mark' + i + '_' + markIndex + '_false.png',
            markCx.canvas.toDataURL().replace('data:image/png;base64,', ''),
            {base64: true});

          trueCertainTies[i].push(truePrediction);
          falseCertainTies[i].push(falsePrediction);

          if (truePrediction > certaintyThreshold) {
            cx.fillStyle = filledColor;
          } else {
            cx.fillStyle = emptyColor;
          }
          cx.fillRect(trueMarkPt.x, trueMarkPt.y, transformedWidth, transformedHeight);

          if (falsePrediction > certaintyThreshold) {
            cx.fillStyle = filledColor;
          } else {
            cx.fillStyle = emptyColor;
          }
          cx.fillRect(falseMarkPt.x, falseMarkPt.y, transformedWidth, transformedHeight);
          markIndex++;
        }
      }
    }
    /*
    zip.generateAsync({type: "blob"}).then(function (content) {
      FileSaver.saveAs(content, original.name + '.zip');
    });
    */
    this.batchResult.sheets[original.name].trueCheckedCertainties = trueCertainTies;
    this.batchResult.sheets[original.name].falseCheckedCertainties = falseCertainTies;
    this.batchResult.sheets[original.name].processingState = ProcessingState.DONE;
  }

  private evaluateSheet(sheet: AnswerSheetEvaluation): void {
    sheet.answerStates = [];
    for (let i = 0; i < this.examManager.exam.questions.length; i++) {
      sheet.answerStates.push([]);
      const question = this.examManager.exam.questions[i];
      let markIndex = 0;
      for (const element of question.elements) {
        if (typeof element === 'object' && 'question' in element) {
          if (sheet.trueCheckedCertainties[i][markIndex] >= certaintyThreshold &&
            sheet.falseCheckedCertainties[i][markIndex] >= certaintyThreshold) {
            sheet.answerStates[i].push(AnswerState.WRONG);
          } else if (sheet.trueCheckedCertainties[i][markIndex] <= inverseThreshold &&
            sheet.falseCheckedCertainties[i][markIndex] <= inverseThreshold) {
            sheet.answerStates[i].push(AnswerState.EMPTY);
          } else {
            let answer: boolean;
            if (sheet.trueCheckedCertainties[i][markIndex] >= certaintyThreshold) {
              answer = true;
            } else if (sheet.falseCheckedCertainties[i][markIndex] >= certaintyThreshold) {
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
    this.pointCalculator.calculatePoints(sheet);
  }
}
