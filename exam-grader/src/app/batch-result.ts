export enum AnswerState {
  CORRECT, WRONG, EMPTY
}

export interface AnswerSheetEvaluation {
  group?: string;
  immatriculationNumber?: number;
  markPixels?: number[];
  trueCheckedCertainties?: number[][];
  falseCheckedCertainties?: number[][];
  answerStates?: AnswerState[][];

}

export interface BatchResult {
  sheets: {[key: string]: AnswerSheetEvaluation};
}
