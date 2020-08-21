import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExamElementEditorComponent} from './exam-element-editor.component';

describe('QuestionEditorComponent', () => {
  let component: ExamElementEditorComponent;
  let fixture: ComponentFixture<ExamElementEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExamElementEditorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamElementEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
