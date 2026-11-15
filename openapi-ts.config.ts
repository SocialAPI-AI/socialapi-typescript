import { defineConfig } from '@hey-api/openapi-ts';

// src/client is generated; everything else under src/ is hand-written.
export default defineConfig({
  input: './openapi.json',
  output: { path: './src/client', importFileExtension: '.js' },
  plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/sdk'],
});
