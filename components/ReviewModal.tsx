
import React, { useState } from 'react';
import { Star, Spinner, X } from 'phosphor-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReviewModal = ({ isOpen, onClose }: ReviewModalProps) => {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, rating, message })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Er is iets misgegaan.');
            }

            setIsSuccess(true);
            // Reset form for next time (optional, as modal closes or shows success)
            setName('');
            setRating(5);
            setMessage('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden animate-slide-up relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                    aria-label="Sluiten"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/50 border border-green-700/50 mb-4">
                                <Star size={32} weight="fill" className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Bedankt voor uw review!</h3>
                            <p className="text-zinc-400 mb-6">
                                We hebben uw bericht ontvangen. Na een korte verificatie zal uw review op onze website verschijnen.
                            </p>
                            <button 
                                onClick={onClose}
                                className="inline-flex justify-center rounded-full border border-transparent shadow-sm px-6 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500"
                            >
                                Sluiten
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-1">Schrijf een Review</h2>
                            <p className="text-zinc-400 mb-6">Deel uw ervaring met Andries Service+.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="review-rating" className="block text-sm font-medium text-zinc-300 mb-1">Uw Beoordeling</label>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star 
                                                    size={32} 
                                                    weight="fill" 
                                                    className={star <= rating ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-400"} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="review-name" className="block text-sm font-medium text-zinc-300 mb-1">Naam</label>
                                    <input
                                        type="text"
                                        id="review-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
                                        placeholder="Uw naam"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="review-message" className="block text-sm font-medium text-zinc-300 mb-1">Bericht</label>
                                    <textarea
                                        id="review-message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-zinc-800 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500"
                                        placeholder="Vertel ons wat u van onze service vond..."
                                    />
                                </div>

                                {error && <p className="text-red-400 text-sm">{error}</p>}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isSubmitting ? <Spinner size={20} className="animate-spin mr-2" /> : null}
                                        {isSubmitting ? 'Verzenden...' : 'Review Plaatsen'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
