import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkingSheetComponent } from './marking-sheet.component';

describe('MarkingSheetComponent', () => {
  let component: MarkingSheetComponent;
  let fixture: ComponentFixture<MarkingSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkingSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkingSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
