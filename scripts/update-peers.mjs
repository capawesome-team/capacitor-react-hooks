// Regenerates peerDependencies and peerDependenciesMeta from the Capacitor
// plugin devDependencies: every plugin becomes an optional peer with an honest
// major range. `@capacitor/core` and `react` stay required.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const packageJsonPath = join(packageDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const isPlugin = name =>
  /^@capacitor(-firebase|-mlkit)?\//.test(name) || /^@capawesome(-team)?\/capacitor-/.test(name);

const peers = { '@capacitor/core': '>=8.0.0', react: '^18.0.0 || ^19.0.0' };
const meta = {};
for (const [name, version] of Object.entries(packageJson.devDependencies)) {
  if (!isPlugin(name) || name === '@capacitor/core') {
    continue;
  }
  const major = version.replace(/^[^\d]*/, '').split('.')[0];
  peers[name] = `^${major}.0.0`;
  meta[name] = { optional: true };
}

const sortKeys = object => Object.fromEntries(Object.entries(object).sort(([a], [b]) => (a < b ? -1 : 1)));
packageJson.peerDependencies = sortKeys(peers);
packageJson.peerDependenciesMeta = sortKeys(meta);
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated ${Object.keys(peers).length} peer dependencies.`);
