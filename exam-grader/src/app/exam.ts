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
  title: string;
  date?: string;
  questions: Question[];
}
