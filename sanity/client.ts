
import { createClient } from '@sanity/client';
import type { SanityClient } from '@sanity/client';
import { sanityConfig } from './config';

const { projectId, dataset } = sanityConfig;

export const isSanityConfigured = projectId && projectId !== 'YOUR_PROJECT_ID_HERE';

// Using a fixed, recent date is the most robust and recommended approach.
// It prevents errors from incorrect system clocks and ensures consistent API responses.
const apiVersion = '2024-07-26';

export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      useCdn: true,
      apiVersion,
    })
  : null;

if (!isSanityConfigured) {
  console.error(
    '🚨 Sanity configuration is missing. Please edit `sanity/config.ts` and add your project ID.'
  );
}
