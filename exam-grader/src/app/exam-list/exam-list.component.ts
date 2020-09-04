import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {StorageService} from '../storage.service';
import {ExamListEntry} from '../exam-list-entry';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

const EXAMS_KEY = 'exams';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent implements OnInit {
  columnsToDisplay = ['examName', 'lastModified', 'id', 'actions'];

  constructor(private router: Router, public store: StorageService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  async createNew(): Promise<void> {
    const generatedId = await this.store.createNewExam();
    this.router.navigateByUrl('/exam/' + generatedId);
  }

  deleteExam(event: MouseEvent, exam: ExamListEntry) {
    event.stopPropagation();
    event.cancelBubble = true;
    this.dialog.open(DeleteExamDialogComponent, {
      width: '250px',
      data: exam
    });
  }
}


@Component({
  selector: 'delete-exam-dialog',
  templateUrl: 'delete-exam-dialog.html',
})
export class DeleteExamDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteExamDialogComponent>,
    private store: StorageService,
    @Inject(MAT_DIALOG_DATA) public data: ExamListEntry) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteExam() {
    console.log('deleting exam', this.data);
    this.store.deleteExam(this.data.id);
    this.dialogRef.close();
  }
}
