import React from 'react';
import type { PageContent } from '../../../types';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';

interface CtaGalleryTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
}

const CtaGalleryTab = ({ content, handleContentChange }: CtaGalleryTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Galerij Call-to-Action Sectie</h2>
            <AdminInput name="servicesCtaTitle" label="Titel" help="Titel van de sectie die oproept om de galerij te bekijken." value={content.servicesCtaTitle!} onChange={e => handleContentChange('servicesCtaTitle', e.target.value)} required showStyler />
            <AdminTextarea name="servicesCtaSubtitle" label="Subtitel" help="Subtitel van deze sectie." value={content.servicesCtaSubtitle!} onChange={e => handleContentChange('servicesCtaSubtitle', e.target.value)} required showStyler />
            <AdminInput name="servicesCtaButtonText" label="Knop Tekst" help="Tekst op de knop om de galerij te openen." value={content.servicesCtaButtonText!} onChange={e => handleContentChange('servicesCtaButtonText', e.target.value)} required />
        </>
    );
};

export default CtaGalleryTab;
