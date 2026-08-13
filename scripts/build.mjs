// Runs tsup once per entry batch (see tsup.config.ts) strictly sequentially,
// so each DTS worker stays within its heap budget.
import { execSync } from 'node:child_process';

const BATCH_COUNT = 4;

for (let batch = 0; batch < BATCH_COUNT; batch++) {
  console.log(`Building batch ${batch + 1}/${BATCH_COUNT}…`);
  execSync('tsup', {
    stdio: 'inherit',
    env: { ...process.env, TSUP_BATCH: String(batch), NODE_OPTIONS: '--max-old-space-size=8192' },
  });
}
