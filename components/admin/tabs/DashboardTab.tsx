import React from 'react';
import type { PageContent, User } from '../../../types';
import InputWithCounter from '../ui/InputWithCounter';
import ImageUpload from '../ui/ImageUpload';
import { ChartLine, ArrowSquareOut } from 'phosphor-react';

interface DashboardTabProps {
    content: PageContent;
    user: User | null;
    settings: any; // Add settings to props
    handleContentChange: (path: string, value: any) => void;
    handleImageUpload: (file: File, path: string) => Promise<void>;
}

const DashboardTab = ({ content, user, settings, handleContentChange, handleImageUpload }: DashboardTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-1 text-zinc-100">Welkom, {user?.username}!</h2>
                <p className="text-zinc-400 mb-6">Beheer hier de algemene instellingen en SEO van de website.</p>
                <InputWithCounter name="companyName" label="Bedrijfsnaam" help="De naam van het bedrijf, wordt weergegeven in de header." value={content?.companyName || ''} onChange={e => handleContentChange('companyName', e.target.value)} required showStyler />
                <ImageUpload name="logo" label="Logo" help="Het logo dat linksboven in de header staat. (Aanbevolen: 1:1 ratio, bv. 80x80px)" currentUrl={content.logo?.url} alt={content.logo?.alt} onAltChange={e => handleContentChange('logo.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'logo.url')} required />
                <InputWithCounter name="facebookUrl" label="Facebook URL" help="Link naar de Facebook pagina. Laat leeg om het icoon te verbergen." value={content?.facebookUrl || ''} onChange={e => handleContentChange('facebookUrl', e.target.value)} />
                <InputWithCounter name="footerCopyrightText" label="Footer Copyright Tekst" help="De tekst die na het jaartal in de footer komt." value={content?.footerCopyrightText || ''} onChange={e => handleContentChange('footerCopyrightText', e.target.value)} required showStyler />
                <ImageUpload name="ogImage" label="Social Media Afbeelding (OG)" help="De afbeelding die wordt getoond bij het delen van de link op social media. (Aanbevolen: 1200x630px)" currentUrl={content.ogImage?.url} alt={content.ogImage?.alt} onAltChange={e => handleContentChange('ogImage.alt', e.target.value)} onImageChange={file => handleImageUpload(file, 'ogImage.url')} />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                {/* Vercel Analytics Widget */}
                {settings?.analyticsUrl && (
                    <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <ChartLine size={24} className="text-green-500 mr-3" />
                            <h3 className="text-lg font-semibold text-white">Website Analytics</h3>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">
                            Bekijk bezoekersaantallen, paginabezoeken en meer via Vercel Analytics.
                        </p>
                        <a 
                            href={settings.analyticsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                        >
                            <ArrowSquareOut size={16} className="mr-2" />
                            Bekijk Analytics
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTab;