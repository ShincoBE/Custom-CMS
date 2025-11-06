import React from 'react';
import { TextBolder, TextItalic } from 'phosphor-react';

interface TextStylerProps {
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    onStyleApply: (newValue: string) => void;
}

const TextStyler = ({ inputRef, onStyleApply }: TextStylerProps) => {
    const applyStyle = (tag: 'b' | 'i' | 'span') => {
        const input = inputRef.current;
        if (!input) return;

        const { selectionStart, selectionEnd, value } = input;
        const selectedText = value.substring(selectionStart, selectionEnd);

        if (!selectedText) {
            input.focus();
            return;
        }

        const before = value.substring(0, selectionStart);
        const after = value.substring(selectionEnd);
        
        let styledText;
        if (tag === 'span') {
            styledText = `<span class="text-green-500">${selectedText}</span>`;
        } else {
            styledText = `<${tag}>${selectedText}</${tag}>`;
        }

        onStyleApply(before + styledText + after);
    };

    return (
        <div className="flex items-center space-x-1 bg-zinc-700 p-1 rounded-md mb-1 w-min">
            <button type="button" onClick={() => applyStyle('b')} title="Bold" className="p-1 rounded hover:bg-zinc-600 text-zinc-300"><TextBolder weight="bold" /></button>
            <button type="button" onClick={() => applyStyle('i')} title="Italic" className="p-1 rounded hover:bg-zinc-600 text-zinc-300"><TextItalic weight="bold" /></button>
            <button type="button" onClick={() => applyStyle('span')} title="Accent Color" className="p-1 rounded hover:bg-zinc-600 text-green-500 font-bold">A</button>
        </div>
    );
};

export default TextStyler;