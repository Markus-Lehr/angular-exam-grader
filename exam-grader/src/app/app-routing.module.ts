import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExamListComponent} from './exam-list/exam-list.component';
import {ExamEditorComponent} from './exam-editor/exam-editor.component';
import {EvaluatorComponent} from './evaluator/evaluator.component';

const routes: Routes = [
  {path: '', redirectTo: 'exams', pathMatch: 'full'},
  {path: 'exams', component: ExamListComponent},
  {path: 'exam/:id', component: ExamEditorComponent},
  {path: 'evaluate/:id', component: EvaluatorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
