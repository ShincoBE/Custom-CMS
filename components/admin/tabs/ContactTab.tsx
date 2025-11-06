import React from 'react';
import type { PageContent } from '../../../types';
import AdminInput from '../ui/AdminInput';
import AdminTextarea from '../ui/AdminTextarea';

interface ContactTabProps {
    content: PageContent;
    handleContentChange: (path: string, value: any) => void;
}

const ContactTab = ({ content, handleContentChange }: ContactTabProps) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Contact Sectie</h2>
            <AdminInput name="contactTitle" label="Titel" help="Titel van de contact sectie." value={content.contactTitle!} onChange={e => handleContentChange('contactTitle', e.target.value)} required showStyler />
            <AdminTextarea name="contactSubtitle" label="Subtitel" help="Subtitel van de contact sectie." value={content.contactSubtitle!} onChange={e => handleContentChange('contactSubtitle', e.target.value)} required showStyler />
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Linkerkolom (Contactinfo)</h3>
                <AdminInput name="contactInfoTitle" label="Titel Contactkolom" help="Titel boven de adresgegevens." value={content.contactInfoTitle!} onChange={e => handleContentChange('contactInfoTitle', e.target.value)} required showStyler />
                <AdminTextarea name="contactInfoText" label="Tekst Contactkolom" help="De introtekst in de linkerkolom." value={content.contactInfoText!} onChange={e => handleContentChange('contactInfoText', e.target.value)} required showStyler />
                <AdminInput name="contactAddressTitle" label="Adres Titel" help="Bijv. 'Adres'." value={content.contactAddressTitle!} onChange={e => handleContentChange('contactAddressTitle', e.target.value)} required />
                <AdminTextarea name="contactAddress" label="Adres" help="Volledig adres. Gebruik enter voor nieuwe regels." value={content.contactAddress!} onChange={e => handleContentChange('contactAddress', e.target.value)} required />
                <AdminInput name="contactEmailTitle" label="Email Titel" help="Bijv. 'Email'." value={content.contactEmailTitle!} onChange={e => handleContentChange('contactEmailTitle', e.target.value)} required />
                <AdminInput name="contactEmail" label="Emailadres" help="Het emailadres voor contact." value={content.contactEmail!} onChange={e => handleContentChange('contactEmail', e.target.value)} required />
                <AdminInput name="contactPhoneTitle" label="Telefoon Titel" help="Bijv. 'Telefoon'." value={content.contactPhoneTitle!} onChange={e => handleContentChange('contactPhoneTitle', e.target.value)} required />
                <AdminInput name="contactPhone" label="Telefoonnummer" help="Het telefoonnummer voor contact." value={content.contactPhone!} onChange={e => handleContentChange('contactPhone', e.target.value)} required />
            </div>
            <div className="mt-6 p-4 border-t border-zinc-700">
                <h3 className="text-lg font-semibold mb-2 mt-4 text-white">Rechterkolom (Contactformulier Teksten)</h3>
                <AdminInput name="contactFormNameLabel" label="Naam Veld Label" help="Label voor het 'Naam' invulveld." value={content.contactFormNameLabel!} onChange={e => handleContentChange('contactFormNameLabel', e.target.value)} required />
                <AdminInput name="contactFormEmailLabel" label="Email Veld Label" help="Label voor het 'Email' invulveld." value={content.contactFormEmailLabel!} onChange={e => handleContentChange('contactFormEmailLabel', e.target.value)} required />
                <AdminInput name="contactFormMessageLabel" label="Bericht Veld Label" help="Label voor het 'Bericht' invulveld." value={content.contactFormMessageLabel!} onChange={e => handleContentChange('contactFormMessageLabel', e.target.value)} required />
                <AdminInput name="contactFormSubmitButtonText" label="Verstuurknop Tekst" help="Tekst op de verstuurknop." value={content.contactFormSubmitButtonText!} onChange={e => handleContentChange('contactFormSubmitButtonText', e.target.value)} required />
                <AdminInput name="contactFormSuccessTitle" label="Succes Titel" help="Titel na succesvol verzenden." value={content.contactFormSuccessTitle!} onChange={e => handleContentChange('contactFormSuccessTitle', e.target.value)} required showStyler />
                <AdminTextarea name="contactFormSuccessText" label="Succes Tekst" help="Tekst na succesvol verzenden." value={content.contactFormSuccessText!} onChange={e => handleContentChange('contactFormSuccessText', e.target.value)} required showStyler />
                <AdminInput name="contactFormSuccessAgainButtonText" label="'Nogmaals Versturen' Knop Tekst" help="Tekst op de knop om het formulier te resetten." value={content.contactFormSuccessAgainButtonText!} onChange={e => handleContentChange('contactFormSuccessAgainButtonText', e.target.value)} required />
            </div>
        </>
    );
};

export default ContactTab;
