import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

// The DTS generator holds a whole batch in memory, so scripts/build.mjs runs
// tsup once per batch (selected via TSUP_BATCH) to keep each worker within its
// heap budget. Entries are explicit maps so output paths never depend on the
// batch's common parent directory.

type EntryMap = Record<string, string>;

function moduleEntries(namespace: string): EntryMap {
  const entries: EntryMap = {};
  for (const plugin of readdirSync(join('src', namespace), { withFileTypes: true })) {
    const entryFile = join('src', namespace, plugin.name, 'index.ts');
    if (plugin.isDirectory() && existsSync(entryFile)) {
      entries[`${namespace}/${plugin.name}/index`] = entryFile;
    }
  }
  return entries;
}

function splitByInitial(entries: EntryMap, pattern: RegExp): EntryMap {
  return Object.fromEntries(
    Object.entries(entries).filter(([outName]) => pattern.test(outName.split('/')[1] ?? '')),
  );
}

const capawesome = moduleEntries('capawesome');
const batches: EntryMap[] = [
  { index: 'src/index.ts', ...moduleEntries('capacitor') },
  splitByInitial(capawesome, /^[a-i]/),
  splitByInitial(capawesome, /^[j-z]/),
  { ...moduleEntries('firebase'), ...moduleEntries('mlkit') },
];

const batchIndex = Number(process.env.TSUP_BATCH ?? 0);

export default defineConfig({
  entry: batches[batchIndex],
  format: ['esm', 'cjs'],
  dts: true,
  clean: batchIndex === 0,
  banner: {
    js: "'use client';",
  },
});
