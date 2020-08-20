export interface ExamListEntry {
  examName: string;
  lastModified: Date;
  id: number;
}

export const EXAMPLE_EXAM_LIST: ExamListEntry[] = [
  {examName: 'Checkbox AI trainer', lastModified: new Date(), id: 42},
  {examName: 'Demo Exam', lastModified: new Date(), id: 97}
];
