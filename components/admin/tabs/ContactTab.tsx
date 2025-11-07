import React from 'react';
import type { PageContent } from '../../../types';
import InputWithCounter from '../ui/InputWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch.tsx';

interface ContactTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
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
                    help="Zet aan om een interactieve Google Map onder het contactformulier te tonen."
                    enabled={!!content.contactMapEnabled}
                    onChange={(val) => handleContentChange('contactMapEnabled', val)}
                />
                {content.contactMapEnabled && (
                    <InputWithCounter
                        as="textarea"
                        name="contactMapUrl"
                        label="Google Maps Embed URL"
                        help="Plak hier de 'src' URL van de Google Maps insluitcode. Bijv: https://www.google.com/maps/embed?pb=..."
                        value={content.contactMapUrl!}
                        onChange={e => handleContentChange('contactMapUrl', e.target.value)}
                        required
                    />
                )}
            </div>

            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Linkerkolom (Contactinfo)</h3>
                <InputWithCounter name="contactInfoTitle" label="Titel Contactkolom" help="Titel boven de adresgegevens." value={content.contactInfoTitle!} onChange={e => handleContentChange('contactInfoTitle', e.target.value)} required showStyler />
                <InputWithCounter as="textarea" name="contactInfoText" label="Tekst Contactkolom" help="De introtekst in de linkerkolom." value={content.contactInfoText!} onChange={e => handleContentChange('contactInfoText', e.target.value)} required showStyler />
                <InputWithCounter name="contactAddressTitle" label="Adres Titel" help="Bijv. 'Adres'." value={content.contactAddressTitle!} onChange={e => handleContentChange('contactAddressTitle', e.target.value)} required />
                <InputWithCounter as="textarea" name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} required />
                <InputWithCounter name="contactEmailTitle" label="Email Titel" help="Bijv. 'Email'." value={content.contactEmailTitle!} onChange={e => handleContentChange('contactEmailTitle', e.target.value)} required />
                <InputWithCounter name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <InputWithCounter name="contactPhoneTitle" label="Telefoon Titel" help="Bijv. 'Telefoon'." value={content.contactPhoneTitle!} onChange={e => handleContentChange('contactPhoneTitle', e.target.value)} required />
                <InputWithCounter name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} required />
            </div>
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Rechterkolom (Contactformulier Teksten)</h3>
                <InputWithCounter name="contactFormNameLabel" label="Naam Veld Label" help="Label voor het 'Naam' invulveld." value={content.contactFormNameLabel!} onChange={e => handleContentChange('contactFormNameLabel', e.target.value)} required />
                <InputWithCounter name="contactFormEmailLabel" label="Email Veld Label" help="Label voor het 'Email' invulveld." value={content.contactFormEmailLabel!} onChange={e => handleContentChange('contactFormEmailLabel', e.target.value)} required />
                <InputWithCounter name="contactFormMessageLabel" label="Bericht Veld Label" help="Label voor het 'Bericht' invulveld." value={content.contactFormMessageLabel!} onChange={e => handleContentChange('contactFormMessageLabel', e.target.value)} required />
                <InputWithCounter name="contactFormSubmitButtonText" label="Verstuurknop Tekst" help="Tekst op de verstuurknop." value={content.contactFormSubmitButtonText!} onChange={e => handleContentChange('contactFormSubmitButtonText', e.target.value)} required />
                <InputWithCounter name="contactFormSuccessTitle" label="Succes Titel" help="Titel na succesvol verzenden." value={content.contactFormSuccessTitle!} onChange={e => handleContentChange('contactFormSuccessTitle', e.target.value)} required showStyler />
                <InputWithCounter as="textarea" name="contactFormSuccessText" label="Succes Tekst" help="Tekst na succesvol verzenden." value={content.contactFormSuccessText!} onChange={e => handleContentChange('contactFormSuccessText', e.target.value)} required showStyler />
                <InputWithCounter name="contactFormSuccessAgainButtonText" label="'Nogmaals Versturen' Knop Tekst" help="Tekst op de knop om het formulier te resetten." value={content.contactFormSuccessAgainButtonText!} onChange={e => handleContentChange('contactFormSuccessAgainButtonText', e.target.value)} required />
            </div>
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">E-mail Sjablonen</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Pas hier de e-mails aan die verzonden worden. Gebruik placeholders: 
                    {/* Fix: Corrected JSX syntax for displaying placeholder text. The double curly braces `{{...}}` were being interpreted as an object, which is not a valid React child. Changed to a string literal `{'{{...}}'}` to render the text correctly. */}
                    <code className="text-xs bg-zinc-700 p-1 rounded mx-1">{`{{name}}`}</code>
                    <code className="text-xs bg-zinc-700 p-1 rounded mx-1">{`{{email}}`}</code>
                    <code className="text-xs bg-zinc-700 p-1 rounded mx-1">{`{{message}}`}</code>
                    <code className="text-xs bg-zinc-700 p-1 rounded mx-1">{`{{year}}`}</code>
                </p>

                <h4 className="font-semibold mb-2 text-zinc-200">Notificatie aan Admin</h4>
                <InputWithCounter 
                    name="contactAdminEmailSubject" 
                    label="Onderwerp (Admin)" 
                    value={content.contactAdminEmailSubject!} 
                    onChange={e => handleContentChange('contactAdminEmailSubject', e.target.value)} 
                />
                <InputWithCounter 
                    as="textarea"
                    name="contactAdminEmailBody" 
                    label="Bericht (Admin) - HTML toegestaan"
                    help="De HTML body van de e-mail die naar u wordt gestuurd."
                    value={content.contactAdminEmailBody!} 
                    onChange={e => handleContentChange('contactAdminEmailBody', e.target.value)} 
                />

                <h4 className="font-semibold mb-2 mt-6 text-zinc-200">Bevestiging aan Gebruiker</h4>
                <InputWithCounter 
                    name="contactUserEmailSubject" 
                    label="Onderwerp (Gebruiker)" 
                    value={content.contactUserEmailSubject!} 
                    onChange={e => handleContentChange('contactUserEmailSubject', e.target.value)} 
                />
                <InputWithCounter 
                    as="textarea"
                    name="contactUserEmailBody" 
                    label="Bericht (Gebruiker) - HTML toegestaan"
                    help="De HTML body van de e-mail die naar de gebruiker wordt gestuurd."
                    value={content.contactUserEmailBody!} 
                    onChange={e => handleContentChange('contactUserEmailBody', e.target.value)} 
                />
            </div>
        </>
    );
};

export default ContactTab;