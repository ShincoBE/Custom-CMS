import React, { useState } from 'react';
import { Key, Eye, EyeSlash, Spinner, X, CheckCircle, Warning } from 'phosphor-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername: string;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  targetUsername,
  showNotification,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNew(false);
    setShowConfirm(false);
    setValidationError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword.length < 8) {
      setValidationError('Het nieuwe wachtwoord moet minstens 8 tekens lang zijn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('De nieuwe wachtwoorden komen niet overeen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden.');
      }

      showNotification('success', data.message || `Wachtwoord voor ${targetUsername} succesvol bijgewerkt!`);
      handleClose();
    } catch (err: any) {
      setValidationError(err.message || 'Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-modal-title"
    >
      <div
        className="bg-zinc-800 rounded-lg shadow-2xl w-full max-w-md border border-zinc-700 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-700 bg-zinc-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Key size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" id="reset-password-modal-title">
                Wachtwoord Instellen
              </h3>
              <p className="text-xs text-zinc-400">
                Voor gebruiker: <span className="text-zinc-200 font-semibold">{targetUsername}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
            aria-label="Sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {validationError && (
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
              <Warning size={18} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          <p className="text-xs text-zinc-400">
            Als beheerder kunt u een nieuw tijdelijk of definitief wachtwoord instellen voor deze gebruiker.
          </p>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Nieuw wachtwoord <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Minstens 8 tekens"
                className="w-full bg-zinc-900/90 border border-zinc-600 rounded-md px-3 py-2 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200"
                tabIndex={-1}
                aria-label={showNew ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
              >
                {showNew ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-1 text-xs flex items-center gap-1.5">
                {newPassword.length >= 8 ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" /> Minimaal 8 tekens
                  </span>
                ) : (
                  <span className="text-zinc-400">
                    Nog {8 - newPassword.length} tekens nodig
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Bevestig nieuw wachtwoord <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Herhaal het nieuwe wachtwoord"
                className="w-full bg-zinc-900/90 border border-zinc-600 rounded-md px-3 py-2 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200"
                tabIndex={-1}
                aria-label={showConfirm ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
              >
                {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && (
              <div className="mt-1 text-xs">
                {confirmPassword === newPassword ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" /> Wachtwoorden komen overeen
                  </span>
                ) : (
                  <span className="text-yellow-400">Wachtwoorden komen nog niet overeen</span>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 border border-zinc-600 rounded-md text-sm font-medium text-zinc-300 hover:bg-zinc-700 focus:outline-none transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Spinner size={18} className="animate-spin mr-2" />
                  Bezig met opslaan...
                </>
              ) : (
                'Wachtwoord Opslaan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
