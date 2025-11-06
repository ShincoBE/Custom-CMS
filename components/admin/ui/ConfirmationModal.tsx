import React from 'react';
import { Warning } from 'phosphor-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title">
      <div className="bg-zinc-800 rounded-lg shadow-2xl w-full max-w-md p-6 border border-zinc-700 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <Warning className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-bold text-white" id="confirmation-modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-zinc-400">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => { onConfirm(); onClose(); }}
          >
            Bevestigen
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-zinc-600 shadow-sm px-4 py-2 bg-zinc-700 text-base font-medium text-zinc-200 hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
