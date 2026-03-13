import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const distCjsDir = path.resolve('dist-cjs');

mkdirSync(distCjsDir, { recursive: true });
writeFileSync(
  path.join(distCjsDir, 'package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2) + '\n'
);
