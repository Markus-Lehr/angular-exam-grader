import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Page} from './pages.component';
import * as pdfjsLib from 'pdfjs-dist';

@Directive({
  selector: '[page]'
})
export class PdfPageDirective {
  private _page: Page;

  @Input() set page(val: Page) {
    if (!this._page || val.pdf.id !== this._page.pdf.id || val.pdfPage !== this._page.pdfPage) {
      this._page = val;
      this.renderOnCanvas(val);
    }
  }

  constructor(private elemRef: ElementRef) { }

  private renderOnCanvas(page: Page) {
    const canvasRev = this.elemRef.nativeElement as HTMLCanvasElement;
    const ctx = canvasRev.getContext('2d');
    pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.js';
    pdfjsLib.getDocument(page.pdf.url).promise.then(doc => {
      doc.getPage(page.pdfPage).then(pdfPage => {
        const viewport = pdfPage.getViewport({scale: 2});
        canvasRev.width = viewport.width;
        canvasRev.height = viewport.height;

        pdfPage.render({
          canvasContext: ctx,
          viewport
        }).promise.then(() => {
          console.log('Page', page, 'rendered');
        });
      });
    });

  }
}
