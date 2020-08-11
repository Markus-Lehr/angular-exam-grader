import { TestBed } from '@angular/core/testing';

import { ExamManagerService } from './exam-manager.service';

describe('ExamManagerService', () => {
  let service: ExamManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
