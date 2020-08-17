export enum AnswerState {
  CORRECT, WRONG, EMPTY, MANUAL_INTERVENTION_NECESSARY
}

export enum ProcessingState {
  NOT_STARTED, WORKING, DONE, MANUAL_INTERVENTION_NECESSARY
}

export interface AnswerSheetEvaluation {
  group?: string;
  immatriculationNumber?: number;
  markPixels?: number[];
  trueCheckedCertainties?: number[][];
  falseCheckedCertainties?: number[][];
  answerStates?: AnswerState[][];
  processingState: ProcessingState;
}

export interface BatchResult {
  sheets: {[key: string]: AnswerSheetEvaluation};
}
