import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
// Keep packaging from recursively copying the entry into itself.
if (destination === sourceDirectory || destination.startsWith(sourceDirectory + '/')) {
  throw new Error('The dossier destination must be outside the source entry.');
}
mkdirSync(destination, { recursive: true });
for (const directory of ['app', 'screenshots']) {
  cpSync(join(sourceDirectory, directory), join(destination, directory), { recursive: true });
}
const bytes = buildDossier(destination, {
  app_max_bytes: 48 * 1024 * 1024,
  app_max_files: 993,
  app_path_max_bytes: 1000,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  text_max_bytes: 160 * 1024,
});
writeFileSync(join(destination, 'dossier.json'), bytes);
const packaged = JSON.parse(Buffer.from(bytes).toString('utf8'));
console.log(`Built ${packaged.schema}: ${packaged.images.length} images, ${bytes.length} bytes at ${join(destination, 'dossier.json')}`);
