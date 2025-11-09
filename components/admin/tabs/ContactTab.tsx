import React from 'react';
import type { PageContent } from '../../../types';
import InputWithCounter from '../ui/InputWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';
import HelpTooltip from '../ui/HelpTooltip.tsx';
import RichTextEditor from '../ui/RichTextEditor.tsx';

interface ContactTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleModalImageUpload: (file: File) => Promise<string>;
}

const ContactTab = ({ content, handleContentChange, handleModalImageUpload }: ContactTabProps) => {
    const emailPlaceholders = 'Beschikbare placeholders: {name}, {email}, {services}, {details}, {imageUrl}';
    
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Contact Sectie</h2>
            <InputWithCounter name="contactTitle" label="Titel" help="Titel van de contact sectie." value={content.contactTitle!} onChange={e => handleContentChange('contactTitle', e.target.value)} required showStyler />
            <InputWithCounter as="textarea" name="contactSubtitle" label="Subtitel" help="Subtitel van de contact sectie." value={content.contactSubtitle!} onChange={e => handleContentChange('contactSubtitle', e.target.value)} required showStyler />
            
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Interactieve Kaart (Google Maps)</h3>
                <ToggleSwitch
                    label="Kaart Weergeven"
                    help="Zet aan om een interactieve Google Map onder de contact-knoppen te tonen."
                    enabled={!!content.contactMapEnabled}
                    onChange={(val) => handleContentChange('contactMapEnabled', val)}
                />
                {content.contactMapEnabled && (
                    <InputWithCounter
                        as="textarea"
                        name="contactMapUrl"
                        label="Google Maps Embed URL"
                        help={`Ga naar Google Maps, zoek de locatie, klik op 'Delen' -> 'Kaart insluiten'. Kopieer de VOLLEDIGE URL uit de 'src="..."' tag en plak die hier.`}
                        value={content.contactMapUrl || ''}
                        onChange={e => handleContentChange('contactMapUrl', e.target.value)}
                        required
                    />
                )}
            </div>

            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Contactgegevens (voor de 'Stel een Vraag' knop)</h3>
                <InputWithCounter name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} required />
                <InputWithCounter name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <InputWithCounter name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} required />
            </div>
            
            <div className="mt-6 p-4 border-t border-zinc-700">
                 <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Offerteformulier E-mails</h3>
                 
                 <div className="p-4 border border-zinc-600 rounded-lg bg-zinc-900/50 mb-6">
                    <h4 className="text-md font-semibold mb-2 text-zinc-100">Notificatie aan Admin</h4>
                    <InputWithCounter 
                        name="quoteAdminEmailSubject" 
                        label="Onderwerp (Admin)" 
                        help={emailPlaceholders} 
                        value={content.quoteAdminEmailSubject || ''} 
                        onChange={e => handleContentChange('quoteAdminEmailSubject', e.target.value)} 
                        required 
                    />
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                          <label className="block text-sm font-medium text-zinc-300">Bericht (Admin)</label>
                          <HelpTooltip text={`De inhoud van de e-mail die u ontvangt. ${emailPlaceholders}`} />
                      </div>
                      <RichTextEditor
                          value={content.quoteAdminEmailBody || ''}
                          onChange={value => handleContentChange('quoteAdminEmailBody', value)}
                          onImageUpload={handleModalImageUpload}
                      />
                    </div>
                 </div>

                 <div className="p-4 border border-zinc-600 rounded-lg bg-zinc-900/50">
                    <h4 className="text-md font-semibold mb-2 text-zinc-100">Bevestiging aan Klant</h4>
                     <InputWithCounter 
                        name="quoteUserEmailSubject" 
                        label="Onderwerp (Klant)" 
                        help={emailPlaceholders} 
                        value={content.quoteUserEmailSubject || ''} 
                        onChange={e => handleContentChange('quoteUserEmailSubject', e.target.value)} 
                        required 
                    />
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                          <label className="block text-sm font-medium text-zinc-300">Bericht (Klant)</label>
                          <HelpTooltip text={`De automatische bevestiging die de klant ontvangt. ${emailPlaceholders}`} />
                      </div>
                      <RichTextEditor
                          value={content.quoteUserEmailBody || ''}
                          onChange={value => handleContentChange('quoteUserEmailBody', value)}
                          onImageUpload={handleModalImageUpload}
                      />
                    </div>
                 </div>

            </div>
        </>
    );
};

export default ContactTab;