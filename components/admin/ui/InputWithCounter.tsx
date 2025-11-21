import React, { useRef } from 'react';
import TextStyler from './TextStyler';
import HelpTooltip from './HelpTooltip';

interface InputWithCounterProps {
    as?: 'input' | 'textarea';
    label: string;
    help?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    name: string;
    required?: boolean;
    type?: string;
    autoComplete?: string;
    showStyler?: boolean;
    maxLength?: number;
    optimalRange?: [number, number];
    className?: string;
}

const InputWithCounter = ({ 
    as: Component = 'input', 
    label, 
    help, 
    value, 
    onChange, 
    name, 
    required = false, 
    type = 'text', 
    autoComplete = 'off', 
    showStyler = false,
    maxLength,
    optimalRange,
    className = "mb-6"
}: InputWithCounterProps) => {
    const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
    
    const handleStyleApply = (newValue: string) => {
        const event = { target: { name, value: newValue } } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
        onChange(event);
    };
    
    const currentLength = value?.length || 0;
    
    const getCounterColor = () => {
        if (maxLength && currentLength > maxLength) return 'text-red-400';
        if (optimalRange) {
            const [min, max] = optimalRange;
            if (currentLength >= min && currentLength <= max) return 'text-green-400';
            if (currentLength > 0) return 'text-yellow-400';
        }
        return 'text-zinc-400';
    };

    const commonProps = {
      ref: inputRef,
      id: name,
      name: name,
      value: value || '',
      onChange: onChange,
      className: "w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500",
    };

    return (
        <div className={className}>
            <div className="flex items-center space-x-2 mb-1">
                <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                {help && <HelpTooltip text={help} />}
            </div>
            {showStyler && <TextStyler inputRef={inputRef} onStyleApply={handleStyleApply} />}
            
            {Component === 'textarea' ? (
                <textarea {...commonProps} rows={3} />
            ) : (
                <input type={type} autoComplete={autoComplete} {...commonProps} />
            )}
            
            {(maxLength || optimalRange) && (
                <div className="text-right text-xs mt-1 pr-1">
                    <span className={getCounterColor()}>{currentLength}</span>
                    {maxLength && <span className="text-zinc-500"> / {maxLength}</span>}
                </div>
            )}
        </div>
    );
};

export default InputWithCounter;