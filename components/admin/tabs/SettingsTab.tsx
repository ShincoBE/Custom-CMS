import React, { useState } from 'react';
import { Spinner, PaperPlaneTilt, Link as LinkIcon } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';

interface SettingsTabProps {
    settings: any;
    handleSettingsChange: (key: string, value: any) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const SettingsTab = ({ settings, handleSettingsChange, showNotification }: SettingsTabProps) => {
    const [isTesting, setIsTesting] = useState(false);

    const handleTestEmail = async () => {
        setIsTesting(true);
        try {
            const res = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailUser: settings.emailUser,
                    emailPass: settings.emailPass,
                    emailTo: settings.emailTo,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Instellingen</h2>
            <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                <h3 className="text-lg font-semibold mb-3 text-white">E-mailconfiguratie (voor contactformulier)</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Deze instellingen worden gebruikt om e-mails te verzenden via het contactformulier. Gebruik een Gmail-account met een 'App-wachtwoord'.
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-500 hover:underline ml-2">
                        Genereer hier een App-wachtwoord <LinkIcon size={14} className="ml-1" />
                    </a>
                </p>
                <AdminInput
                    name="emailUser"
                    label="Gmail Adres (Verzender)"
                    help="Het volledige Gmail-adres van waaruit de e-mails worden verzonden."
                    value={settings?.emailUser || ''}
                    onChange={e => handleSettingsChange('emailUser', e.target.value)}
                    required
                />
                <AdminInput
                    name="emailPass"
                    label="Gmail App-wachtwoord"
                    help="Het 16-cijferige app-wachtwoord, zonder spaties."
                    type="password"
                    value={settings?.emailPass || ''}
                    onChange={e => handleSettingsChange('emailPass', e.target.value)}
                    required
                />
                <AdminInput
                    name="emailTo"
                    label="E-mailadres (Ontvanger)"
                    help="Het e-mailadres waar de berichten van het contactformulier naartoe worden gestuurd."
                    value={settings?.emailTo || ''}
                    onChange={e => handleSettingsChange('emailTo', e.target.value)}
                    required
                />
                <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTesting || !settings?.emailUser || !settings?.emailPass || !settings?.emailTo}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-zinc-500 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isTesting ? <Spinner size={20} className="animate-spin mr-2" /> : <PaperPlaneTilt size={20} className="mr-2" />}
                    {isTesting ? 'Versturen...' : 'Test E-mail Versturen'}
                </button>
            </div>
        </>
    );
};

export default SettingsTab;
