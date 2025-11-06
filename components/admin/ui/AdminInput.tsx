import React, { useRef } from 'react';
import TextStyler from './TextStyler';
import HelpTooltip from './HelpTooltip';

interface AdminInputProps {
    label: string;
    help?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    required?: boolean;
    type?: string;
    autoComplete?: string;
    showStyler?: boolean;
}

const AdminInput = ({ label, help, value, onChange, name, required = false, type = 'text', autoComplete = 'off', showStyler = false }: AdminInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleStyleApply = (newValue: string) => {
        const event = { target: { name, value: newValue } } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center space-x-2 mb-1">
                <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                {help && <HelpTooltip text={help} />}
            </div>
            {showStyler && <TextStyler inputRef={inputRef} onStyleApply={handleStyleApply} />}
            <input
              ref={inputRef}
              type={type}
              id={name}
              name={name}
              value={value || ''}
              onChange={onChange}
              autoComplete={autoComplete}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
            />
        </div>
    );
};

export default AdminInput;
