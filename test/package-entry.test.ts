import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tscEntrypoint = require.resolve('typescript/bin/tsc');
const distCjsDir = path.join(repoRoot, 'dist-cjs');

const isBuilt = existsSync(distCjsDir);
if (!isBuilt) {
  console.log('Skipping package-entry tests: dist-cjs/ not found. Run "pnpm build" first.');
}

describe.skipIf(!isBuilt).sequential('package entry', () => {
  let tempDir: string;
  let entryFile: string;
  let tsconfigFile: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'agent-browser-package-entry-'));
    entryFile = path.join(tempDir, 'index.ts');
    tsconfigFile = path.join(tempDir, 'tsconfig.json');

    await mkdir(path.join(tempDir, 'node_modules'), { recursive: true });
    await symlink(repoRoot, path.join(tempDir, 'node_modules', 'agent-browser'), 'dir');

    await writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'package-entry-repro', private: true, type: 'module' }, null, 2)
    );

    await writeFile(
      tsconfigFile,
      JSON.stringify(
        {
          compilerOptions: {
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            target: 'ES2024',
            lib: ['ES2024'],
            noEmit: true,
            strict: true,
            skipLibCheck: true,
            types: ['node'],
            typeRoots: [path.join(repoRoot, 'node_modules', '@types')],
          },
          include: ['./index.ts'],
        },
        null,
        2
      )
    );
  });

  afterAll(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('exports BrowserManager from the package root at runtime', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [
        '--input-type=module',
        '-e',
        [
          "import { BrowserManager } from 'agent-browser';",
          'const browser = new BrowserManager();',
          'console.log(JSON.stringify({ browserManager: typeof BrowserManager, navigate: typeof browser.navigate }));',
        ].join(' '),
      ],
      { cwd: tempDir }
    );

    expect(JSON.parse(stdout.trim())).toEqual({
      browserManager: 'function',
      navigate: 'function',
    });
  });

  it('exports BrowserManager from the package root for CommonJS require', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [
        '--input-type=commonjs',
        '-e',
        [
          "const resolved = require.resolve('agent-browser');",
          "const pkg = require('agent-browser');",
          'const browser = new pkg.BrowserManager();',
          'console.log(JSON.stringify({ resolved, browserManager: typeof pkg.BrowserManager, navigate: typeof browser.navigate }));',
        ].join(' '),
      ],
      { cwd: tempDir }
    );

    expect(JSON.parse(stdout.trim())).toEqual({
      resolved: path.join(repoRoot, 'dist-cjs', 'index.js'),
      browserManager: 'function',
      navigate: 'function',
    });
  });

  it('resolves CJS subpath export agent-browser/browser', async () => {
    const { stdout } = await execFileAsync(
      'node',
      [
        '--input-type=commonjs',
        '-e',
        [
          "const resolved = require.resolve('agent-browser/browser');",
          "const m = require('agent-browser/browser');",
          'console.log(JSON.stringify({ resolved, browserManager: typeof m.BrowserManager }));',
        ].join(' '),
      ],
      { cwd: tempDir }
    );

    expect(JSON.parse(stdout.trim())).toEqual({
      resolved: path.join(repoRoot, 'dist-cjs', 'browser.js'),
      browserManager: 'function',
    });
  });

  it('exposes the documented BrowserManager typing from the package root', async () => {
    await writeFile(
      entryFile,
      [
        "import { BrowserManager, type BrowserLaunchOptions } from 'agent-browser';",
        '',
        'const browser = new BrowserManager();',
        'const launchOptions: BrowserLaunchOptions = { headless: true };',
        "// @ts-expect-error 'engine' is CLI-only and not part of BrowserManager.launch()",
        "const unsupportedLaunchOptions: BrowserLaunchOptions = { engine: 'lightpanda' };",
        'await browser.launch(launchOptions);',
        "const navigation = await browser.navigate('https://example.com');",
        'const url: string = navigation.url;',
        'const title: string = await browser.getTitle();',
        'const currentUrl: string = await browser.getUrl();',
        '',
        'void unsupportedLaunchOptions;',
        'void url;',
        'void title;',
        'void currentUrl;',
      ].join('\n')
    );

    await expect(
      execFileAsync(process.execPath, [tscEntrypoint, '--project', tsconfigFile], {
        cwd: tempDir,
      })
    ).resolves.toMatchObject({ stderr: '' });
  });

  it('points package metadata at the programmatic API entry', async () => {
    const packageJson = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));

    expect(packageJson.main).toBe('./dist-cjs/index.js');
    expect(packageJson.types).toBe('./dist/index.d.ts');
    expect(packageJson.exports['.']).toEqual({
      import: './dist/index.js',
      require: './dist-cjs/index.js',
      default: './dist/index.js',
      types: './dist/index.d.ts',
    });
  });
});
