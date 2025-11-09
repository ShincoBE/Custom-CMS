import React from 'react';
import type { PageContent } from '../../../types';
import InputWithCounter from '../ui/InputWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';
import HelpTooltip from '../ui/HelpTooltip.tsx';
import RichTextEditor from '../ui/RichTextEditor.tsx';
import { Info } from 'phosphor-react';

interface ContactTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleModalImageUpload: (file: File) => Promise<string>;
}

const ContactTab = ({ content, handleContentChange, handleModalImageUpload }: ContactTabProps) => {
    
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Contact Sectie</h2>
            <InputWithCounter name="contactTitle" label="Hoofdtitel Sectie" help="Titel van de contact sectie." value={content.contactTitle!} onChange={e => handleContentChange('contactTitle', e.target.value)} required showStyler />
            <InputWithCounter as="textarea" name="contactSubtitle" label="Hoofdsubtitel Sectie" help="Subtitel van de contact sectie." value={content.contactSubtitle!} onChange={e => handleContentChange('contactSubtitle', e.target.value)} required showStyler />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quote Card */}
                <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
                    <h3 className="text-lg font-semibold mb-3 text-white">Offerte Kaart</h3>
                    <InputWithCounter name="contactQuoteCardTitle" label="Titel" value={content.contactQuoteCardTitle!} onChange={e => handleContentChange('contactQuoteCardTitle', e.target.value)} required />
                    <InputWithCounter as="textarea" name="contactQuoteCardText" label="Tekst" value={content.contactQuoteCardText!} onChange={e => handleContentChange('contactQuoteCardText', e.target.value)} required />
                    <InputWithCounter name="contactQuoteCardButtonText" label="Knop Tekst" value={content.contactQuoteCardButtonText!} onChange={e => handleContentChange('contactQuoteCardButtonText', e.target.value)} required />
                </div>
                {/* Direct Contact Card */}
                <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
                    <h3 className="text-lg font-semibold mb-3 text-white">Direct Contact Kaart</h3>
                    <InputWithCounter name="contactDirectCardTitle" label="Titel" value={content.contactDirectCardTitle!} onChange={e => handleContentChange('contactDirectCardTitle', e.target.value)} required />
                    <InputWithCounter as="textarea" name="contactDirectCardText" label="Tekst" value={content.contactDirectCardText!} onChange={e => handleContentChange('contactDirectCardText', e.target.value)} required />
                </div>
            </div>

            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Contactgegevens (voor de 'Stel een Vraag' kaart)</h3>
                <InputWithCounter as="textarea" name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} />
                <InputWithCounter name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <InputWithCounter name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} />
            </div>
            
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
                 <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Offerteformulier E-mails</h3>
                 <div className="mb-6 p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-sm text-zinc-300">
                    <div className="flex items-start">
                        <Info size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-white mb-2">Beschikbare Placeholders</h4>
                            <p className="mb-3">Gebruik de volgende placeholders. Ze worden automatisch vervangen door de ingevulde gegevens van de klant.</p>
                            <ul className="list-disc list-inside space-y-1 text-zinc-400">
                                <li><code>{'{name}'}</code> - De naam van de klant.</li>
                                <li><code>{'{email}'}</code> - Het e-mailadres van de klant.</li>
                                <li><code>{'{services}'}</code> - Een lijst van de geselecteerde diensten.</li>
                                <li><code>{'{details}'}</code> - De projectomschrijving.</li>
                                <li><code>{'{imageUrl}'}</code> - De geüploade afbeelding (als HTML). Wordt leeg gelaten indien geen afbeelding.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                 
                 <div className="p-4 border border-zinc-600 rounded-lg bg-zinc-900/50 mb-6">
                    <h4 className="text-md font-semibold mb-2 text-zinc-100">Notificatie aan Admin</h4>
                    <InputWithCounter 
                        name="quoteAdminEmailSubject" 
                        label="Onderwerp (Admin)" 
                        value={content.quoteAdminEmailSubject || ''} 
                        onChange={e => handleContentChange('quoteAdminEmailSubject', e.target.value)} 
                        required 
                    />
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                          <label className="block text-sm font-medium text-zinc-300">Bericht (Admin)</label>
                          <HelpTooltip text={`De inhoud van de e-mail die u ontvangt.`} />
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
                        value={content.quoteUserEmailSubject || ''} 
                        onChange={e => handleContentChange('quoteUserEmailSubject', e.target.value)} 
                        required 
                    />
                    <div className="mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                          <label className="block text-sm font-medium text-zinc-300">Bericht (Klant)</label>
                          <HelpTooltip text={`De automatische bevestiging die de klant ontvangt.`} />
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