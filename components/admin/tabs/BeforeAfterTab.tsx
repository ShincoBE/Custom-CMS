import React from 'react';
import type { PageContent } from '../../../types';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';
import ImageUpload from '../ui/ImageUpload';

interface BeforeAfterTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
    handleImageSelect: (url: string, path: string) => void; // New prop
}

const BeforeAfterTab = ({ content, handleContentChange, handleImageUpload, handleImageSelect }: BeforeAfterTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Voor & Na Sectie</h2>
            <AdminInput name="beforeAfterTitle" label="Titel" help="Titel van de Voor & Na sectie." value={content?.beforeAfterTitle || ''} onChange={e => handleContentChange('beforeAfterTitle', e.target.value)} required showStyler />
            <AdminTextarea name="beforeAfterSubtitle" label="Subtitel" help="Subtitel van de Voor & Na sectie." value={content?.beforeAfterSubtitle || ''} onChange={e => handleContentChange('beforeAfterSubtitle', e.target.value)} required showStyler />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ImageUpload 
                name="beforeImage" 
                label="'Voor' Afbeelding" 
                help="De afbeelding die de situatie 'voor' toont." 
                currentUrl={content.beforeImage?.url} 
                alt={content.beforeImage?.alt} 
                onAltChange={e => handleContentChange('beforeImage.alt', e.target.value)} 
                onImageChange={file => handleImageUpload(file, 'beforeImage.url')} 
                onUrlChange={url => handleImageSelect(url, 'beforeImage.url')}
                required 
              />
              <ImageUpload 
                name="afterImage" 
                label="'Na' Afbeelding" 
                help="De afbeelding die de situatie 'na' toont." 
                currentUrl={content.afterImage?.url} 
                alt={content.afterImage?.alt} 
                onAltChange={e => handleContentChange('afterImage.alt', e.target.value)} 
                onImageChange={file => handleImageUpload(file, 'afterImage.url')} 
                onUrlChange={url => handleImageSelect(url, 'afterImage.url')}
                required 
              />
            </div>
        </>
    );
};

export default BeforeAfterTab;