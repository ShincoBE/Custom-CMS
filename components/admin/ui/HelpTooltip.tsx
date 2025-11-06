import React from 'react';
import { Question } from 'phosphor-react';

interface HelpTooltipProps {
  text: string;
}

const HelpTooltip = ({ text }: HelpTooltipProps) => {
  return (
    <div className="relative flex items-center group">
      <Question size={16} className="text-zinc-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 text-xs font-medium text-white bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
};

export default HelpTooltip;
