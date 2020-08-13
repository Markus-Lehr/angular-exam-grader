export interface ExamListEntry {
  examName: string;
  lastModified: Date;
  id: string;
}

export const EXAMPLE_EXAM_LIST: ExamListEntry[] = [
  {examName: 'Checkbox AI trainer', lastModified: new Date(), id: 'checkboxtrainer'},
  {examName: 'Demo Exam', lastModified: new Date(), id: 'nongeneratedid1'}
];
