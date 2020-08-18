import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {DocumentDownloadDialog, DocumentPreviewComponent} from './document-preview/document-preview.component';
import { DocumentEditorComponent } from './document-editor/document-editor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import { MarkingSheetComponent } from './marking-sheet/marking-sheet.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import { ExamListComponent } from './exam-list/exam-list.component';
import { ExamEditorComponent } from './exam-editor/exam-editor.component';
import {MatTableModule} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import { QuestionEditorComponent } from './document-editor/question-editor/question-editor.component';
import {MatCardModule} from "@angular/material/card";
import { ElementEditorComponent } from './document-editor/question-editor/element-editor/element-editor.component';
import {MatSelectModule} from "@angular/material/select";
import { KatexModule } from 'ng-katex';
import { PageHeaderComponent } from './document-preview/page-header/page-header.component';
import { PagesComponent } from './document-preview/pages/pages.component';
import { PageFooterComponent } from './document-preview/page-footer/page-footer.component';
import { EvaluatorComponent } from './evaluator/evaluator.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {MatTabsModule} from "@angular/material/tabs";
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


@NgModule({
  declarations: [
    AppComponent,
    DocumentPreviewComponent,
    DocumentEditorComponent,
    MarkingSheetComponent,
    ExamListComponent,
    ExamEditorComponent,
    QuestionEditorComponent,
    ElementEditorComponent,
    PageHeaderComponent,
    PagesComponent,
    PageFooterComponent,
    EvaluatorComponent,
    DocumentDownloadDialog,
    LoadingScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    KatexModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }