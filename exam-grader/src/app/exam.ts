/* not in allcaps, since these strings are lazily used as labels in a dropdown */
export enum QuestionBlockTypes {
  Text, Image, Subquestion
}

export interface ElementListEntry {
  type: 'question' | 'page-break' | 'pdf';
  index: number; // refers to the "question index" or "pdf" index or "page-break index"
}

export interface Question {
  id?: number;
  title?: string;
  points: number;
  elements: QuestionBlock[];
}

export interface Image {
  base64string: string;
}

export type QuestionBlock = string | SubQuestion | Image;

export interface SubQuestion {
  question: string;
  answer: boolean;
}

export interface Exam {
  lastModified?: Date;
  id?: number;
  title: string;
  date: Date;
  markingSheetOnly?: boolean;

  questions: Question[];
  customPdfs: number[]; // store pdf ids
  elementOrder: ElementListEntry[]; // references to elements in other arrays
}
