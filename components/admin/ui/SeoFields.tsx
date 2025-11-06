import React from 'react';
import InputWithCounter from './InputWithCounter';
import type { SEO } from '../../../types';

interface SeoFieldsProps {
    seo?: SEO;
    onSeoChange: (field: keyof SEO, value: string) => void;
    baseName: string;
}

const SeoFields = ({ seo, onSeoChange, baseName }: SeoFieldsProps) => {
    return (
        <div className="mt-4 p-4 border border-zinc-600 rounded-lg bg-zinc-900/50">
            <h4 className="text-md font-semibold mb-2 text-zinc-200">SEO Instellingen</h4>
            <InputWithCounter
                name={`${baseName}-seo-title`}
                label="SEO Meta Titel"
                help="De titel die in de browser tab en in Google zoekresultaten verschijnt. Probeer tussen 50-60 tekens te blijven."
                value={seo?.title || ''}
                onChange={(e) => onSeoChange('title', e.target.value)}
                maxLength={60}
                optimalRange={[50, 60]}
            />
            <InputWithCounter
                as="textarea"
                name={`${baseName}-seo-description`}
                label="SEO Meta Omschrijving"
                help="Een korte, pakkende omschrijving voor Google zoekresultaten. Probeer tussen 120-155 tekens te blijven."
                value={seo?.description || ''}
                onChange={(e) => onSeoChange('description', e.target.value)}
                maxLength={160}
                optimalRange={[120, 155]}
            />
        </div>
    );
};

export default SeoFields;
