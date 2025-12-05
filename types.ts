export enum CalculatorActionType {
  ADD_DIGIT = 'ADD_DIGIT',
  CHOOSE_OPERATION = 'CHOOSE_OPERATION',
  CLEAR = 'CLEAR',
  DELETE_DIGIT = 'DELETE_DIGIT',
  EVALUATE = 'EVALUATE',
  SET_ERROR = 'SET_ERROR',
  SET_AI_INPUT = 'SET_AI_INPUT',
  SET_AI_RESULT = 'SET_AI_RESULT',
}

export interface CalculatorState {
  currentOperand: string | null;
  previousOperand: string | null;
  operation: string | null;
  overwrite: boolean;
  isAiMode: boolean;
  aiInput: string;
  isAiLoading: boolean;
}

export interface CalculatorAction {
  type: CalculatorActionType;
  payload?: {
    digit?: string;
    operation?: string;
    error?: string;
    aiInput?: string;
    aiResult?: string;
  };
}