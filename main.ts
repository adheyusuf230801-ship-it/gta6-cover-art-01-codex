// Assemble this entry into the directory the make.fun runner inspects.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const copyTree = (source, target) => cpSync(source, target, { recursive: true, force: true });

mkdirSync(destination, { recursive: true });
const targetApp = join(destination, 'app');
const targetShots = join(destination, 'screenshots');
rmSync(targetApp, { recursive: true, force: true });
rmSync(targetShots, { recursive: true, force: true });
rmSync(join(destination, 'dossier.json'), { force: true });
copyTree(join(root, 'app'), targetApp);
const sourceShots = join(root, 'screenshots');
mkdirSync(targetShots, { recursive: true });
if (existsSync(sourceShots)) copyTree(sourceShots, targetShots);

writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
}));
