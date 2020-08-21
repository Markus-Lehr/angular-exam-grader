import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {QuestionElementEditorComponent} from './question-element-editor.component';

describe('ElementEditorComponent', () => {
  let component: QuestionElementEditorComponent;
  let fixture: ComponentFixture<QuestionElementEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionElementEditorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionElementEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
