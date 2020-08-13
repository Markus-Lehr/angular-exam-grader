/* not in allcaps, since these strings are lazily used as labels in a dropdown */
export enum QuestionBlockTypes {
  Text, Image, Subquestion
}

export interface Question {
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
  id: string;
  title: string;
  date: Date;
  questions: Question[];
}
