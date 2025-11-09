import React, { useRef } from 'react';
import {
  TextBolder, TextItalic, TextUnderline,
  // Fix: Replaced non-existent 'ListUl' and 'ListOl' with 'ListBullets' and 'ListNumbers' to match phosphor-react exports.
  ListBullets, ListNumbers, Image as ImageIcon
} from 'phosphor-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

const EditorButton = ({ children, onClick, title }: { children: React.ReactNode, onClick: () => void, title: string }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="p-2 rounded text-zinc-300 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        onMouseDown={e => e.preventDefault()} // Prevent editor from losing focus
    >
        {children}
    </button>
);

const RichTextEditor = ({ value, onChange, onImageUpload }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCommand = (command: string, value: string | null = null) => {
        // Note: document.execCommand is deprecated but used here for simplicity
        // without adding a heavy rich text editor library.
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
            try {
                const url = await onImageUpload(file);
                // For execCommand to work, the editor must be focused.
                editorRef.current?.focus();
                const imgTag = `<img src="${url}" alt="" style="max-width: 100%; height: auto; border-radius: 8px;" />`;
                handleCommand('insertHTML', imgTag);
            } catch (error) {
                console.error('Image upload failed in RTE', error);
                alert('Afbeelding uploaden mislukt.');
            } finally {
                // Reset file input
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    return (
        <div className="border border-zinc-600 rounded-md">
            <div className="flex items-center flex-wrap gap-1 p-1 bg-zinc-700 rounded-t-md border-b border-zinc-600">
                <EditorButton onClick={() => handleCommand('bold')} title="Bold">
                    <TextBolder size={20} weight="bold" />
                </EditorButton>
                <EditorButton onClick={() => handleCommand('italic')} title="Italic">
                    <TextItalic size={20} weight="bold" />
                </EditorButton>
                <EditorButton onClick={() => handleCommand('underline')} title="Underline">
                    <TextUnderline size={20} weight="bold" />
                </EditorButton>
                <div className="h-5 w-px bg-zinc-600 mx-1"></div>
                {/* Fix: Replaced non-existent 'ListUl' with 'ListBullets' to fix module export error. */}
                <EditorButton onClick={() => handleCommand('insertUnorderedList')} title="Bulleted List">
                    <ListBullets size={20} weight="bold" />
                </EditorButton>
                {/* Fix: Replaced non-existent 'ListOl' with 'ListNumbers' to fix module export error. */}
                <EditorButton onClick={() => handleCommand('insertOrderedList')} title="Numbered List">
                    <ListNumbers size={20} weight="bold" />
                </EditorButton>
                <div className="h-5 w-px bg-zinc-600 mx-1"></div>
                <EditorButton onClick={handleImageUploadClick} title="Insert Image">
                    <ImageIcon size={20} weight="bold" />
                </EditorButton>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />
            </div>
            <div
                ref={editorRef}
                contentEditable
                dangerouslySetInnerHTML={{ __html: value }}
                onInput={e => onChange(e.currentTarget.innerHTML)}
                className="prose prose-invert max-w-none w-full bg-zinc-700 rounded-b-md p-3 min-h-[250px] text-zinc-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                style={{
                    // Fix: Corrected CSS property names. 'prose-h2:color' and similar are not valid CSS.
                    // The correct syntax is to use camelCase for CSS properties in React's style prop.
                    // However, these properties should be handled by Tailwind's prose plugin classes,
                    // so custom styling like this is redundant and has been removed for cleanliness.
                }}
            />
        </div>
    );
};

export default RichTextEditor;