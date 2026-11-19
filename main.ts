import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const project = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
if (output === resolve(project)) throw Error('Choose an output directory separate from the source entry');
mkdirSync(output, { recursive: true });
for (const folder of ['app', 'screenshots']) {
  cpSync(join(project, folder), join(output, folder), { recursive: true });
}
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(output, 'dossier.json'), dossier);
console.log('Neon Coast dossier written:', join(output, 'dossier.json'), '(' + dossier.byteLength + ' bytes)');
