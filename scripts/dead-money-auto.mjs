import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run in isolation: an invalid second move must not publish the first move.
const root = process.cwd();
const runner = fileURLToPath(new URL('./dead-money-turn.mjs', import.meta.url));
const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'dead-money-'));
const matchFile = 'competition/match.json';
const agents = ['codex', 'claude'];
try {
  fs.mkdirSync(path.join(staging, 'competition'), { recursive: true });
  const match = fs.existsSync(matchFile)
    ? JSON.parse(fs.readFileSync(matchFile, 'utf8'))
    : { day: 1, finished: false };
  if (!Number.isInteger(match.day) || match.day < 1 || match.day > 30) {
    throw new Error('Invalid current match day');
  }
  if (fs.existsSync(matchFile)) fs.copyFileSync(matchFile, path.join(staging, matchFile));
  // Include the next day's filenames for accurate reporting after advancement.
  for (const day of [match.day, Math.min(match.day + 1, 30)]) {
    for (const agent of agents) {
      const file = `competition/moves/${agent}/day-${String(day).padStart(2, '0')}.json`;
      if (fs.existsSync(file)) {
        fs.mkdirSync(path.dirname(path.join(staging, file)), { recursive: true });
        fs.copyFileSync(file, path.join(staging, file));
      }
    }
  }
  const ready = !match.finished && agents.every(agent =>
    fs.existsSync(`competition/moves/${agent}/day-${String(match.day).padStart(2, '0')}.json`));
  function run(approval) {
    const result = spawnSync(process.execPath, [runner], {
      cwd: staging,
      env: { ...process.env, APPROVE_DAY: String(approval) },
      encoding: 'utf8',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr || 'Move validation failed');
  }
  run(ready ? match.day : '');
  // Refresh the report against the resulting day without executing another turn.
  run('');
  const reportFile = path.join(staging, 'competition/REPORT.md');
  const report = fs.readFileSync(reportFile, 'utf8')
    .replace('PAUSED — awaiting your approval', 'Waiting for both players’ moves — automatic processing enabled')
    .replace('Agents submit competition/moves/<agent>/day-XX.json, then run the workflow.',
      'Agents submit competition/moves/<agent>/day-XX.json. Both valid submissions trigger automatic processing.');
  fs.writeFileSync(reportFile, report);
  for (const file of [matchFile, 'competition/REPORT.md', ...agents.map(a => `competition/inbox/${a}.json`)]) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(staging, file), path.join(root, file));
  }
  console.log(ready ? `Processed day ${match.day}; published updated observations.` : 'Report refreshed; no day advanced.');
} finally {
  fs.rmSync(staging, { recursive: true, force: true });
}
