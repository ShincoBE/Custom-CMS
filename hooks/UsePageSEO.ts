import { useEffect } from 'react';
import type { SEO } from '../types';

const defaultTitle = "Andries Service+ | Professioneel Tuinonderhoud & Klusjes";
const defaultDescription = "Andries Service+ biedt professioneel tuinonderhoud, tuinaanleg, schilderwerken en klusjesdiensten in de regio Lier. Vraag een vrijblijvende offerte aan voor een onberispelijke tuin en woning.";

export function usePageSEO(seo?: SEO) {
    useEffect(() => {
        const originalTitle = document.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription ? metaDescription.getAttribute('content') : defaultDescription;

        document.title = seo?.title || defaultTitle;
        if (metaDescription) {
            metaDescription.setAttribute('content', seo?.description || defaultDescription);
        }

        // Cleanup function to restore original values on component unmount
        return () => {
            document.title = originalTitle;
            if (metaDescription && originalDescription) {
                metaDescription.setAttribute('content', originalDescription);
            }
        };
    }, [seo]); // Rerun effect if seo object changes
}
