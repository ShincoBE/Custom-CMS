// This script migrates the local content from `content.ts` to your Vercel KV store.
// Run this once with `pnpm seed` after setting up your .env.local file.
import { createClient } from '@vercel/kv';
// FIX: Node's ESM loader cannot handle TypeScript files by default.
// The script now reads content.ts as a JSON file to bypass the module system.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentFilePath = path.join(__dirname, '../content.ts');
const contentFile = fs.readFileSync(contentFilePath, 'utf-8');
// FIX: To make content.ts a valid TS module, it now has a default export.
// We extract the JSON object from the file content before parsing.
const jsonString = contentFile.substring(contentFile.indexOf('{'), contentFile.lastIndexOf('}') + 1);
const { pageContentData, galleryImagesData } = JSON.parse(jsonString);


// Load environment variables from .env.local
// The --env-file flag in the package.json script handles this
if (!process.env.KV_URL) {
  throw new Error('Missing required environment variables from .env.local. Please follow the setup guide.');
}

const kv = createClient({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Set page content under the key 'pageContent'
    await kv.set('pageContent', pageContentData);
    console.log('✅ Page content seeded successfully.');

    // Set gallery images under the key 'galleryImages'
    await kv.set('galleryImages', galleryImagesData);
    console.log('✅ Gallery images seeded successfully.');

    console.log('\nDatabase seeding complete! You can now run `pnpm dev`.');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();