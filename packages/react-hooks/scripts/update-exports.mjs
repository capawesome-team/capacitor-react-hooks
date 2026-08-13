// Regenerates the package.json `exports` and `typesVersions` maps from the
// module layout in src/. Every src/<namespace>/<plugin>/index.ts becomes a
// "./<namespace>/<plugin>" subpath.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(packageDir, 'src');

const entry = subpath => ({
  import: {
    types: `./dist/${subpath}.d.ts`,
    default: `./dist/${subpath}.js`,
  },
  require: {
    types: `./dist/${subpath}.d.cts`,
    default: `./dist/${subpath}.cjs`,
  },
});

const subpaths = [];
for (const namespace of readdirSync(srcDir, { withFileTypes: true })) {
  if (!namespace.isDirectory() || namespace.name === 'core') {
    continue;
  }
  for (const plugin of readdirSync(join(srcDir, namespace.name), { withFileTypes: true })) {
    if (plugin.isDirectory() && existsSync(join(srcDir, namespace.name, plugin.name, 'index.ts'))) {
      subpaths.push(`${namespace.name}/${plugin.name}`);
    }
  }
}
subpaths.sort();

const packageJsonPath = join(packageDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
packageJson.exports = {
  '.': entry('index'),
  ...Object.fromEntries(subpaths.map(subpath => [`./${subpath}`, entry(`${subpath}/index`)])),
};
// Fallback so TypeScript's legacy node10 module resolution finds subpath types.
packageJson.typesVersions = {
  '*': Object.fromEntries(subpaths.map(subpath => [subpath, [`./dist/${subpath}/index.d.ts`]])),
};
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated exports map with ${subpaths.length + 1} entries.`);
