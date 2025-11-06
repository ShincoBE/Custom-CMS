// This script migrates the local content from `content.ts` to your Vercel KV store.
// Run this once with `pnpm seed` after setting up your .env.local file.
import { createClient } from '@vercel/kv';
// FIX: Node's ESM loader cannot handle TypeScript files by default.
// The script now reads content.ts as a JSON file to bypass the module system.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// FIX: Explicitly import the `process` module to resolve type errors with `process.exit`.
import process from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentFilePath = path.join(__dirname, '../content.ts');
const contentFile = fs.readFileSync(contentFilePath, 'utf-8');
// FIX: To make content.ts a valid TS module, it now has a default export.
// We extract the JSON object from the file content before parsing.
const jsonString = contentFile.substring(contentFile.indexOf('{'), contentFile.lastIndexOf('}') + 1);
const { pageContentData, galleryImagesData } = JSON.parse(jsonString);


// --- START: KV URL Sanitization ---
// This helper function automatically corrects a common misconfiguration where the
// Redis connection string (rediss://) is used instead of the REST API URL (https://).
function getSanitizedKvUrl() {
  const url = process.env.KV_URL;
  if (url && url.startsWith('rediss://')) {
    try {
      // The URL constructor can parse the components of the redis string if we temporarily replace the protocol
      const parsedUrl = new URL(url.replace('rediss://', 'https://'));
      // We only need the hostname for the REST API URL
      return `https://${parsedUrl.hostname}`;
    } catch (e) {
      console.error("Failed to parse and sanitize KV_URL, using original value.", e);
      return url; // Fallback to original URL on parsing error
    }
  }
  return url;
}
// --- END: KV URL Sanitization ---


// Load environment variables from .env.local
// The --env-file flag in the package.json script handles this
if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
  console.error('❌ Fout: Vereiste omgevingsvariabelen KV_URL en/of KV_REST_API_TOKEN ontbreken in .env.local.');
  console.error('Volg de installatiehandleiding en zorg ervoor dat u de REST API URL (beginnend met https://) gebruikt voor KV_URL.');
  process.exit(1);
}

const kv = createClient({
  url: getSanitizedKvUrl(), // Use the sanitized URL
  token: process.env.KV_REST_API_TOKEN,
});

async function seedDatabase() {
  console.log('Database wordt geseed...');

  try {
    // Set page content under the key 'pageContent'
    await kv.set('pageContent', pageContentData);
    console.log('✅ Pagina-inhoud succesvol geplaatst.');

    // Set gallery images under the key 'galleryImages'
    await kv.set('galleryImages', galleryImagesData);
    console.log('✅ Galerij-afbeeldingen succesvol geplaatst.');

    console.log('\nDatabase seeding voltooid! U kunt nu `pnpm dev` uitvoeren.');

  } catch (error) {
    console.error('Fout bij het seeden van de database:', error);
    process.exit(1);
  }
}

seedDatabase();