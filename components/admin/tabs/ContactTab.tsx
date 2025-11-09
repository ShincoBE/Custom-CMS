import React from 'react';
import type { PageContent } from '../../../types';
import InputWithCounter from '../ui/InputWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';

interface ContactTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
    handleModalImageUpload: (file: File) => Promise<string>;
}

const ContactTab = ({ content, handleContentChange }: ContactTabProps) => {
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
                <InputWithCounter name="contactInfoTitle" label="Titel Contactkolom" help="Titel boven de adresgegevens (wordt niet meer getoond, maar kan nuttig zijn voor interne referentie)." value={content.contactInfoTitle!} onChange={e => handleContentChange('contactInfoTitle', e.target.value)} required showStyler />
                <InputWithCounter as="textarea" name="contactInfoText" label="Tekst Contactkolom" help="De introtekst (wordt niet meer getoond, maar kan nuttig zijn voor interne referentie)." value={content.contactInfoText!} onChange={e => handleContentChange('contactInfoText', e.target.value)} required showStyler />
                <InputWithCounter name="contactAddressTitle" label="Adres Titel" help="Bijv. 'Adres'." value={content.contactAddressTitle!} onChange={e => handleContentChange('contactAddressTitle', e.target.value)} required />
                <InputWithCounter as="textarea" name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} required />
                <InputWithCounter name="contactEmailTitle" label="Email Titel" help="Bijv. 'Email'." value={content.contactEmailTitle!} onChange={e => handleContentChange('contactEmailTitle', e.target.value)} required />
                <InputWithCounter name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <InputWithCounter name="contactPhoneTitle" label="Telefoon Titel" help="Bijv. 'Telefoon'." value={content.contactPhoneTitle!} onChange={e => handleContentChange('contactPhoneTitle', e.target.value)} required />
                <InputWithCounter name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} required />
            </div>
        </>
    );
};

export default ContactTab;
