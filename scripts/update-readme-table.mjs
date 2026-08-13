// Regenerates the covered-plugins table in README.md between the
// coverage-table markers from the module layout in src/.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(packageDir, 'src');
const packageJson = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
const devDependencies = packageJson.devDependencies;

function packageForSubpath(namespace, slug) {
  if (namespace === 'capacitor') {
    return slug === 'system-bars' ? '`@capacitor/core` (System Bars API)' : `\`@capacitor/${slug}\``;
  }
  if (namespace === 'capawesome') {
    const candidates = [`@capawesome/capacitor-${slug}`, `@capawesome-team/capacitor-${slug}`];
    const name = candidates.find(candidate => candidate in devDependencies);
    if (!name) {
      throw new Error(`No installed package found for capawesome/${slug}`);
    }
    return `\`${name}\``;
  }
  return `\`@capacitor-${namespace}/${slug}\``;
}

const rows = [];
for (const namespace of readdirSync(srcDir, { withFileTypes: true })) {
  if (!namespace.isDirectory() || namespace.name === 'core') {
    continue;
  }
  for (const plugin of readdirSync(join(srcDir, namespace.name), { withFileTypes: true })) {
    if (plugin.isDirectory() && existsSync(join(srcDir, namespace.name, plugin.name, 'index.ts'))) {
      const subpath = `${namespace.name}/${plugin.name}`;
      rows.push(`| \`${subpath}\` | ${packageForSubpath(namespace.name, plugin.name)} |`);
    }
  }
}
rows.sort();

const readmePath = join(packageDir, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const table = ['| Subpath | Plugin |', '| --- | --- |', ...rows].join('\n');
const updated = readme.replace(
  /(<!-- coverage-table-start -->\n)[\s\S]*?(<!-- coverage-table-end -->)/,
  `$1${table}\n$2`,
);
writeFileSync(readmePath, updated);
console.log(`Updated coverage table with ${rows.length} rows.`);
