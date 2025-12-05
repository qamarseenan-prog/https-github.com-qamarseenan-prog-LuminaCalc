import React, { useReducer, useCallback, useState } from 'react';
import { CalculatorAction, CalculatorActionType, CalculatorState } from './types';
import CalculatorButton from './components/CalculatorButton';
import CalculatorDisplay from './components/CalculatorDisplay';
import { solveMathWithGemini } from './services/geminiService';
import { Sparkles, Delete, Calculator as CalcIcon } from 'lucide-react';

const INITIAL_STATE: CalculatorState = {
  currentOperand: null,
  previousOperand: null,
  operation: null,
  overwrite: false,
  isAiMode: false,
  aiInput: '',
  isAiLoading: false,
};

const reducer = (state: CalculatorState, action: CalculatorAction): CalculatorState => {
  switch (action.type) {
    case CalculatorActionType.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload?.digit || '',
          overwrite: false,
        };
      }
      if (action.payload?.digit === '0' && state.currentOperand === '0') return state;
      if (action.payload?.digit === '.' && state.currentOperand?.includes('.')) return state;
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${action.payload?.digit}`,
      };

    case CalculatorActionType.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) return state;
      
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: action.payload?.operation || null,
        };
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: action.payload?.operation || null,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: action.payload?.operation || null,
        currentOperand: null,
      };

    case CalculatorActionType.CLEAR:
      return { ...INITIAL_STATE, isAiMode: state.isAiMode };

    case CalculatorActionType.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case CalculatorActionType.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
      
    case CalculatorActionType.SET_AI_INPUT:
        return { ...state, aiInput: action.payload?.aiInput || '' };
        
    case CalculatorActionType.SET_AI_RESULT:
        return { 
            ...state, 
            currentOperand: action.payload?.aiResult || null,
            aiInput: '',
            isAiMode: false,
            overwrite: true 
        };

    default:
      return state;
  }
};

const evaluate = ({ currentOperand, previousOperand, operation }: CalculatorState): string => {
  const prev = parseFloat(previousOperand || '0');
  const current = parseFloat(currentOperand || '0');
  if (isNaN(prev) || isNaN(current)) return '';
  
  let computation = 0;
  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '*':
      computation = prev * current;
      break;
    case '÷':
      if (current === 0) return 'Error';
      computation = prev / current;
      break;
  }
  return computation.toString();
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleDigit = (digit: string) => dispatch({ type: CalculatorActionType.ADD_DIGIT, payload: { digit } });
  const handleOperation = (operation: string) => dispatch({ type: CalculatorActionType.CHOOSE_OPERATION, payload: { operation } });
  const handleClear = () => dispatch({ type: CalculatorActionType.CLEAR });
  const handleDelete = () => dispatch({ type: CalculatorActionType.DELETE_DIGIT });
  const handleEvaluate = () => dispatch({ type: CalculatorActionType.EVALUATE });
  
  const handleAiSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.aiInput.trim()) return;
    
    setAiLoading(true);
    const result = await solveMathWithGemini(state.aiInput);
    setAiLoading(false);
    
    dispatch({ type: CalculatorActionType.SET_AI_RESULT, payload: { aiResult: result } });
    setIsAiMode(false);
  }, [state.aiInput]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900/60 p-4 sm:p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/10 relative">
        
        {/* Header / Mode Switch */}
        <div className="flex justify-between items-center mb-4 px-2">
            <h1 className="text-white/80 font-bold text-lg flex items-center gap-2">
                <CalcIcon size={20} className="text-indigo-400" />
                LuminaCalc
            </h1>
            <button 
                onClick={() => setIsAiMode(!isAiMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${isAiMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
                <Sparkles size={14} />
                {isAiMode ? 'AI Mode' : 'Standard'}
            </button>
        </div>

        {/* Display Area */}
        {isAiMode ? (
            <div className="w-full bg-slate-900/50 p-6 rounded-3xl mb-4 h-32 sm:h-40 shadow-inner border border-slate-700/50 flex flex-col justify-center relative overflow-hidden">
                <form onSubmit={handleAiSubmit} className="w-full relative z-10">
                    <label className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2 block">Ask Gemini Math</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={state.aiInput}
                            onChange={(e) => dispatch({ type: CalculatorActionType.SET_AI_INPUT, payload: { aiInput: e.target.value } })}
                            placeholder="e.g. 15% of 850..."
                            className="w-full bg-transparent text-white text-lg placeholder-slate-600 border-b-2 border-slate-700 focus:border-indigo-500 outline-none pb-2 transition-colors"
                            autoFocus
                        />
                        {aiLoading && (
                            <div className="absolute right-0 bottom-3">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Press Enter to solve</p>
                </form>
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
            </div>
        ) : (
             <CalculatorDisplay 
                previousOperand={state.previousOperand} 
                operation={state.operation} 
                currentOperand={state.currentOperand} 
                isAiMode={isAiMode}
            />
        )}
       

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          <CalculatorButton 
            label="AC" 
            onClick={handleClear} 
            variant="danger" 
            colSpan={2} 
          />
          <CalculatorButton 
            label={<Delete size={24}/>} 
            onClick={handleDelete} 
            variant="secondary" 
          />
          <CalculatorButton 
            label="÷" 
            onClick={() => handleOperation('÷')} 
            variant="primary" 
          />
          
          <CalculatorButton label="7" onClick={() => handleDigit('7')} />
          <CalculatorButton label="8" onClick={() => handleDigit('8')} />
          <CalculatorButton label="9" onClick={() => handleDigit('9')} />
          <CalculatorButton 
            label="*" 
            onClick={() => handleOperation('*')} 
            variant="primary" 
          />
          
          <CalculatorButton label="4" onClick={() => handleDigit('4')} />
          <CalculatorButton label="5" onClick={() => handleDigit('5')} />
          <CalculatorButton label="6" onClick={() => handleDigit('6')} />
          <CalculatorButton 
            label="-" 
            onClick={() => handleOperation('-')} 
            variant="primary" 
          />
          
          <CalculatorButton label="1" onClick={() => handleDigit('1')} />
          <CalculatorButton label="2" onClick={() => handleDigit('2')} />
          <CalculatorButton label="3" onClick={() => handleDigit('3')} />
          <CalculatorButton 
            label="+" 
            onClick={() => handleOperation('+')} 
            variant="primary" 
          />
          
          <CalculatorButton label="0" onClick={() => handleDigit('0')} />
          <CalculatorButton label="." onClick={() => handleDigit('.')} />
          <CalculatorButton 
            label="=" 
            onClick={handleEvaluate} 
            variant="accent" 
            colSpan={2}
          />
        </div>
      </div>
    </div>
  );
};

export default App;