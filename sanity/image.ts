import imageUrlBuilder from '@sanity/image-url';
import { client, isSanityConfigured } from './client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Conditionally create the builder only if the client is configured.
const builder = isSanityConfigured ? imageUrlBuilder(client!) : null;

export function urlFor(source: SanityImageSource) {
  // If the builder was never created or if the source is invalid, return undefined.
  if (!builder || !source) return undefined;
  return builder.image(source);
}
