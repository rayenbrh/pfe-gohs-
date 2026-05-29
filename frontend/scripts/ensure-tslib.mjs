import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const frontendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootModules = path.join(frontendDir, '..', 'node_modules');
const frontendModules = path.join(frontendDir, 'node_modules');

const packages = ['tslib', 'nprogress'];

for (const pkg of packages) {
  const src = path.join(rootModules, pkg);
  const dest = path.join(frontendModules, pkg);

  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.mkdirSync(frontendModules, { recursive: true });
    fs.cpSync(src, dest, { recursive: true });
  }
}
