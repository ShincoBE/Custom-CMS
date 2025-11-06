import React, { useRef } from 'react';
import TextStyler from './TextStyler';

interface AdminTextareaProps {
    label: string;
    help: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    name: string;
    required?: boolean;
    showStyler?: boolean;
}

const AdminTextarea = ({ label, help, value, onChange, name, required = false, showStyler = false }: AdminTextareaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const handleStyleApply = (newValue: string) => {
        const event = { target: { name, value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(event);
    };

    return (
        <div className="mb-6">
            <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {showStyler && <TextStyler inputRef={textareaRef} onStyleApply={handleStyleApply} />}
            <textarea
              ref={textareaRef}
              id={name}
              name={name}
              value={value || ''}
              onChange={onChange}
              rows={3}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-zinc-400 mt-1">{help}</p>
        </div>
    );
};

export default AdminTextarea;
