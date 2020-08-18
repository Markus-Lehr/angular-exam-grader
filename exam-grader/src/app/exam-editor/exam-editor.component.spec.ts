import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExamEditorComponent} from './exam-editor.component';

describe('ExamEditorComponent', () => {
  let component: ExamEditorComponent;
  let fixture: ComponentFixture<ExamEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExamEditorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
