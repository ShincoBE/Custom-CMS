
import React, { useState, useRef } from 'react';
import {
  TextBolder, TextItalic, TextUnderline,
  ListBullets, ListNumbers, Image as ImageIcon, Code, Spinner
} from 'phosphor-react';
import { compressImageIfNeeded, MAX_FILE_SIZE } from '../../../utils/imageUtils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const EditorButton: React.FC<{ children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean; isActive?: boolean; }> = ({ children, onClick, title, disabled = false, isActive = false }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-2 rounded text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-600'} ${isActive ? 'bg-green-700/50 text-white' : ''}`}
        onMouseDown={e => e.preventDefault()} // Prevent editor from losing focus
        disabled={disabled}
    >
        {children}
    </button>
);

const RichTextEditor = ({ value, onChange, onImageUpload }: RichTextEditorProps) => {
    const [view, setView] = useState<'visual' | 'html'>('visual');
    const [isUploading, setIsUploading] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCommand = (command: string, val: string | null = null) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
            setIsUploading(true);
            try {
                const fileToUpload = await compressImageIfNeeded(file);

                if (fileToUpload.size > MAX_FILE_SIZE) {
                     alert('Bestand is zelfs na compressie te groot. Maximaal 4.5MB toegestaan.');
                     setIsUploading(false);
                     return;
                }

                const url = await onImageUpload(fileToUpload);
                editorRef.current?.focus();
                const imgTag = `<img src="${url}" alt="" style="max-width: 100%; height: auto; border-radius: 8px;" />`;
                handleCommand('insertHTML', imgTag);
            } catch (error) {
                console.error('Image upload failed in RTE', error);
                alert('Afbeelding uploaden mislukt.');
            } finally {
                setIsUploading(false);
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };
    
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const isHtmlView = view === 'html';

    return (
        <div className="border border-zinc-600 rounded-md">
            <div className="flex items-center justify-between flex-wrap gap-1 p-1 bg-zinc-700 rounded-t-md border-b border-zinc-600">
                <div className="flex items-center flex-wrap gap-1">
                    <EditorButton onClick={() => handleCommand('bold')} title="Bold" disabled={isHtmlView}>
                        <TextBolder size={20} weight="bold" />
                    </EditorButton>
                    <EditorButton onClick={() => handleCommand('italic')} title="Italic" disabled={isHtmlView}>
                        <TextItalic size={20} weight="bold" />
                    </EditorButton>
                    <EditorButton onClick={() => handleCommand('underline')} title="Underline" disabled={isHtmlView}>
                        <TextUnderline size={20} weight="bold" />
                    </EditorButton>
                    <div className="h-5 w-px bg-zinc-600 mx-1"></div>
                    <EditorButton onClick={() => handleCommand('insertUnorderedList')} title="Bulleted List" disabled={isHtmlView}>
                        <ListBullets size={20} weight="bold" />
                    </EditorButton>
                    <EditorButton onClick={() => handleCommand('insertOrderedList')} title="Numbered List" disabled={isHtmlView}>
                        <ListNumbers size={20} weight="bold" />
                    </EditorButton>
                    <div className="h-5 w-px bg-zinc-600 mx-1"></div>
                    <EditorButton onClick={handleImageUploadClick} title="Insert Image" disabled={isHtmlView || isUploading}>
                        {isUploading ? <Spinner size={20} className="animate-spin" /> : <ImageIcon size={20} weight="bold" />}
                    </EditorButton>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />
                </div>
                <div>
                     <EditorButton onClick={() => setView(v => v === 'visual' ? 'html' : 'visual')} title="Toggle HTML View" isActive={isHtmlView}>
                        <Code size={20} weight="bold" />
                    </EditorButton>
                </div>
            </div>
            {isHtmlView ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-zinc-900 font-mono text-sm text-green-300 rounded-b-md p-3 min-h-[250px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                    placeholder="Enter HTML here..."
                />
            ) : (
                <div
                    ref={editorRef}
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: value }}
                    onInput={e => onChange(e.currentTarget.innerHTML)}
                    onPaste={handlePaste}
                    className="prose prose-invert max-w-none w-full bg-zinc-700 rounded-b-md p-3 min-h-[250px] text-zinc-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 overflow-x-auto"
                />
            )}
        </div>
    );
};

export default RichTextEditor;
