import React from 'react';

interface CalculatorButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'danger';
  className?: string;
  colSpan?: number;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default', 
  className = '',
  colSpan = 1 
}) => {
  
  const baseStyles = "h-16 sm:h-20 rounded-2xl text-xl sm:text-2xl font-medium transition-all duration-150 active:scale-95 flex items-center justify-center shadow-lg backdrop-blur-md select-none";
  
  const variants = {
    default: "bg-slate-800/60 text-white hover:bg-slate-700/80 hover:shadow-slate-500/10 border border-slate-700/50",
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40 border border-indigo-500/50",
    secondary: "bg-slate-700/50 text-slate-200 hover:bg-slate-600/60 border border-slate-600/30",
    accent: "bg-teal-500/90 text-white hover:bg-teal-400 hover:shadow-teal-500/40 border border-teal-400/50",
    danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30",
  };

  const spanClasses = colSpan > 1 ? `col-span-${colSpan}` : '';

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${spanClasses} ${className}`}
    >
      {label}
    </button>
  );
};

export default CalculatorButton;