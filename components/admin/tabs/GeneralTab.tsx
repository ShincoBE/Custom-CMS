import React from 'react';
import type { PageContent } from '../../../types';
import AdminInput from '../ui/AdminInput';
import ImageUpload from '../ui/ImageUpload';

interface GeneralTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
}

const GeneralTab = ({ content, handleContentChange, handleImageUpload }: GeneralTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Algemene Pagina-instellingen</h2>
            <AdminInput name="companyName" label="Bedrijfsnaam" help="De naam van het bedrijf, wordt weergegeven in de header." value={content.companyName!} onChange={e => handleContentChange('companyName', e.target.value)} required showStyler />
            <ImageUpload name="logo" label="Logo" help="Het logo dat linksboven in de header staat. (Aanbevolen: 1:1 ratio, bv. 80x80px)" currentUrl={content.logo?.url} alt={content.logo?.alt} onAltChange={e => handleContentChange('logo.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'logo.url')} required />
            <AdminInput name="facebookUrl" label="Facebook URL" help="Link naar de Facebook pagina. Laat leeg om het icoon te verbergen." value={content.facebookUrl!} onChange={e => handleContentChange('facebookUrl', e.target.value)} />
            <AdminInput name="footerCopyrightText" label="Footer Copyright Tekst" help="De tekst die na het jaartal in de footer komt." value={content.footerCopyrightText!} onChange={e => handleContentChange('footerCopyrightText', e.target.value)} required showStyler />
            <ImageUpload name="ogImage" label="Social Media Afbeelding (OG)" help="De afbeelding die wordt getoond bij het delen van de link op social media. (Aanbevolen: 1200x630px)" currentUrl={content.ogImage?.url} alt={content.ogImage?.alt} onAltChange={e => handleContentChange('ogImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'ogImage.url')} />
        </>
    );
};

export default GeneralTab;
