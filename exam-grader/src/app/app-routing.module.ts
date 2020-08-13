import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ExamListComponent} from "./exam-list/exam-list.component";
import {ExamEditorComponent} from "./exam-editor/exam-editor.component";

const routes: Routes = [
  {path: '', redirectTo: 'exams', pathMatch: 'full'},
  {path: 'exams', component: ExamListComponent},
  {path: 'exam/:id', component: ExamEditorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
