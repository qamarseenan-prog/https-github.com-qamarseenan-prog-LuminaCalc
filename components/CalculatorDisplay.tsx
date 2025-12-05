import React from 'react';

interface CalculatorDisplayProps {
  previousOperand: string | null;
  operation: string | null;
  currentOperand: string | null;
  isAiMode: boolean;
}

const formatOperand = (operand: string | null) => {
  if (operand == null) return '';
  // Handle already formatted error messages or very large numbers simply for this scope
  if (Number.isNaN(Number(operand)) && operand !== '-') return operand; 
  
  const [integer, decimal] = operand.split('.');
  if (decimal == null) {
    return new Intl.NumberFormat('en-US').format(Number(integer));
  }
  return `${new Intl.NumberFormat('en-US').format(Number(integer))}.${decimal}`;
};

const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  previousOperand,
  operation,
  currentOperand,
  isAiMode
}) => {
  return (
    <div className="w-full bg-slate-900/50 p-6 rounded-3xl mb-4 flex flex-col items-end justify-end h-32 sm:h-40 break-all shadow-inner border border-slate-700/50 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
      
      {isAiMode ? (
        <div className="text-slate-400 text-sm sm:text-base font-medium h-full flex items-center">
           Natural Language Mode Active
        </div>
      ) : (
        <>
          <div className="text-slate-400 text-sm sm:text-lg h-6 mb-1 font-medium tracking-wide">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="text-white text-4xl sm:text-5xl font-bold tracking-tight text-right w-full">
            {formatOperand(currentOperand) || '0'}
          </div>
        </>
      )}
    </div>
  );
};

export default CalculatorDisplay;