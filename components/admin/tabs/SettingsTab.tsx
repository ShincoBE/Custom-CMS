import React, { useState } from 'react';
import { Spinner, PaperPlaneTilt, Link as LinkIcon, Trash } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';
import ToggleSwitch from '../ui/ToggleSwitch';

interface SettingsTabProps {
    settings: any;
    handleSettingsChange: (key: string, value: any) => void;
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const SettingsTab = ({ settings, handleSettingsChange, showNotification }: SettingsTabProps) => {
    const [isTesting, setIsTesting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetConfirmationText, setResetConfirmationText] = useState('');
    const [isResetting, setIsResetting] = useState(false);

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
    
    const handleResetAnalytics = async () => {
        setIsResetting(true);
        try {
            const res = await fetch('/api/analytics/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
            setShowResetConfirm(false);
            setResetConfirmationText('');
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100">Instellingen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                    <h3 className="text-lg font-semibold mb-3 text-white">Website Features</h3>
                     <ToggleSwitch
                        label="Toon 'Wat Klanten Zeggen' sectie"
                        help="Zet aan om de testimonial slider op de homepagina te tonen."
                        enabled={!!settings?.showTestimonials}
                        onChange={(val) => handleSettingsChange('showTestimonials', val)}
                    />
                    <ToggleSwitch
                        label="Toon 'Blog / Projecten' sectie"
                        help="Zet aan om de blog sectie op de homepagina en de blog link in de navigatie te tonen."
                        enabled={!!settings?.showBlog}
                        onChange={(val) => handleSettingsChange('showBlog', val)}
                    />
                </div>
                <div className="p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                    <h3 className="text-lg font-semibold mb-3 text-white">Analyse (Vercel)</h3>
                     <p className="text-sm text-zinc-400 mb-4">
                        Voeg een link toe naar uw Vercel Analytics dashboard. Er verschijnt dan een handige snelkoppeling op het hoofddashboard.
                    </p>
                    <AdminInput
                        name="analyticsUrl"
                        label="Vercel Analytics URL"
                        help="Plak hier de volledige URL van uw Vercel Analytics pagina."
                        value={settings?.analyticsUrl || ''}
                        onChange={e => handleSettingsChange('analyticsUrl', e.target.value)}
                    />
                </div>
            </div>
            
            <div className="mt-6 mb-6 p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                <h3 className="text-lg font-semibold mb-3 text-white">E-mailconfiguratie (voor formulieren)</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Deze instellingen worden gebruikt om e-mails te verzenden. Gebruik een Gmail-account met een 'App-wachtwoord'.
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
            
            <div className="mt-8 p-4 border border-red-900/50 rounded-lg bg-red-950/20">
                <h3 className="text-lg font-semibold mb-3 text-red-400">Gevarenzone</h3>
                <p className="text-sm text-zinc-400 mb-4">
                    Acties in deze zone kunnen niet ongedaan worden gemaakt. Wees voorzichtig.
                </p>
                
                {!showResetConfirm ? (
                    <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="inline-flex items-center px-4 py-2 border border-red-600/50 text-sm font-medium rounded-md text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
                    >
                        <Trash size={18} className="mr-2" /> Reset Alle Statistieken
                    </button>
                ) : (
                    <div className="bg-zinc-900/80 p-4 rounded-md border border-red-900/30">
                         <p className="text-sm text-zinc-300 mb-3">
                            Weet u het zeker? Dit zal <strong>alle</strong> verzamelde bezoekersstatistieken permanent verwijderen. 
                            Typ <span className="font-mono text-red-400 font-bold">Verwijder</span> hieronder om te bevestigen.
                         </p>
                         <input
                            type="text"
                            value={resetConfirmationText}
                            onChange={(e) => setResetConfirmationText(e.target.value)}
                            placeholder="Typ 'Verwijder'"
                            className="w-full bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500 mb-3"
                         />
                         <div className="flex space-x-3">
                             <button
                                type="button"
                                onClick={() => { setShowResetConfirm(false); setResetConfirmationText(''); }}
                                className="px-3 py-2 text-sm font-medium rounded-md text-zinc-300 bg-zinc-700 hover:bg-zinc-600"
                             >
                                Annuleren
                             </button>
                             <button
                                type="button"
                                onClick={handleResetAnalytics}
                                disabled={resetConfirmationText !== 'Verwijder' || isResetting}
                                className="px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                             >
                                {isResetting && <Spinner size={16} className="animate-spin mr-2" />}
                                Definitief Verwijderen
                             </button>
                         </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SettingsTab;