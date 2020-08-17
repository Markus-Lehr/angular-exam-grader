import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorComponent } from './evaluator.component';

describe('EvaluatorComponent', () => {
  let component: EvaluatorComponent;
  let fixture: ComponentFixture<EvaluatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
