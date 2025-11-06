import React, { useState, useRef } from 'react';
import { UploadSimple, Spinner } from 'phosphor-react';
import HelpTooltip from './HelpTooltip';

interface ImageUploadProps {
    label: string;
    help: string;
    currentUrl?: string;
    alt?: string;
    onAltChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageChange: (file: File) => Promise<void>;
    name: string;
    required?: boolean;
}

const ImageUpload = ({ label, help, currentUrl, alt, onAltChange, onImageChange, name, required = false }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setUploadError(null);
            try {
                await onImageChange(file);
            } catch (error) {
                setUploadError('Upload mislukt. Probeer het opnieuw.');
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="mb-6 p-4 border border-zinc-600 rounded-lg bg-zinc-900/50">
            <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-zinc-300">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
                {help && <HelpTooltip text={help} />}
            </div>
            <div className="flex items-start space-x-4">
                {currentUrl ? (
                    <img src={currentUrl} alt={alt || 'Preview'} className="w-24 h-24 object-contain rounded-md bg-zinc-700" />
                ) : (
                    <div className="w-24 h-24 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-400">
                        Geen afbeelding
                    </div>
                )}
                <div className="flex-1">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="inline-flex items-center px-3 py-1.5 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50">
                        {isUploading ? <Spinner size={16} className="animate-spin mr-2" /> : <UploadSimple size={16} className="mr-2" />}
                        {isUploading ? 'Uploaden...' : 'Afbeelding wijzigen'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml" />
                    
                    <label htmlFor={`${name}-alt`} className="sr-only">Alternatieve tekst</label>
                    <input
                        type="text"
                        id={`${name}-alt`}
                        name={`${name}-alt`}
                        value={alt || ''}
                        onChange={onAltChange}
                        placeholder="Alternatieve tekst (voor SEO)"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500 text-sm mt-2"
                    />
                </div>
            </div>
            {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}
        </div>
    );
};

export default ImageUpload;
