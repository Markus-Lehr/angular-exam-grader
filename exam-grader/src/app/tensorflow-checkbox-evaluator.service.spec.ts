import { TestBed } from '@angular/core/testing';

import { TensorflowCheckboxEvaluatorService } from './tensorflow-checkbox-evaluator.service';

describe('TensorflowCheckboxEvaluatorService', () => {
  let service: TensorflowCheckboxEvaluatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TensorflowCheckboxEvaluatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
