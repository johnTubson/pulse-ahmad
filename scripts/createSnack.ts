#!/usr/bin/env node
/**
 * Create an Expo Snack from a filtered subset of this repo.
 * `npx create-snack` OOMs here because it recursively reads everything except
 * node_modules/.git (including android/ ~3GB and dist/).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Snack } from 'snack-sdk';

const ROOT = process.cwd();

/** Top-level dirs/files to include when packing for Snack. */
const INCLUDE_TOP = new Set([
  'App.tsx',
  'app.json',
  'app.config.js',
  'babel.config.js',
  'metro.config.js',
  'package.json',
  'tsconfig.json',
  'global.css',
  'nativewind-env.d.ts',
  'snack-env.d.ts',
  'tailwind.config.js',
  'app',
  'src',
  'assets',
]);

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.expo',
  'android',
  'ios',
  'dist',
  'coverage',
  '__tests__',
  'docs',
  'design-tokens',
  'scripts',
  '.cursor',
  '.claude',
  '.husky',
  '.github',
  '.vscode',
]);

const SKIP_FILE_NAMES = new Set(['package-lock.json', '.DS_Store', '.env', '.env.local']);

const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.txt', '.svg']);

const ASSET_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ttf', '.otf']);

type SnackFile = { type: 'CODE' | 'ASSET'; contents: string };

function shouldSkip(relPath: string, isDir: boolean): boolean {
  const parts = relPath.split(path.sep);
  if (parts.some((p) => SKIP_DIR_NAMES.has(p))) return true;
  if (!isDir && SKIP_FILE_NAMES.has(path.basename(relPath))) return true;
  return false;
}

function collectFiles(dir: string, files: Record<string, SnackFile>, root: string) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = path.relative(root, full);
    const stat = fs.statSync(full);

    if (shouldSkip(rel, stat.isDirectory())) continue;

    if (stat.isDirectory()) {
      collectFiles(full, files, root);
      continue;
    }

    const ext = path.extname(entry).toLowerCase();
    if (TEXT_EXT.has(ext)) {
      files[rel.replace(/\\/g, '/')] = {
        type: 'CODE',
        contents: fs.readFileSync(full, 'utf8'),
      };
      continue;
    }

    if (ASSET_EXT.has(ext) && stat.size <= 512 * 1024) {
      files[rel.replace(/\\/g, '/')] = {
        type: 'ASSET',
        contents: fs.readFileSync(full).toString('base64'),
      };
    }
  }
}

async function main() {
  const files: Record<string, SnackFile> = {};

  for (const name of INCLUDE_TOP) {
    const full = path.join(ROOT, name);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, files, ROOT);
    } else if (!shouldSkip(name, false)) {
      const ext = path.extname(name).toLowerCase();
      if (TEXT_EXT.has(ext)) {
        files[name] = { type: 'CODE', contents: fs.readFileSync(full, 'utf8') };
      }
    }
  }

  const count = Object.keys(files).length;
  const approxKb = Math.round(
    Object.values(files).reduce((n, f) => n + f.contents.length, 0) / 1024,
  );
  console.log(`Packing ${count} files (~${approxKb} KB) for Snack…`);

  if (!files['App.js'] && !files['App.tsx'] && !files['App.ts'] && !files['App.jsx']) {
    files['App.js'] = {
      type: 'CODE',
      contents: `import { ExpoRoot } from 'expo-router';
import Head from 'expo-router/head';
const ctx = require.context('./app');
export default function App() {
  return (
    <Head.Provider>
      <ExpoRoot context={ctx} />
    </Head.Provider>
  );
}
`,
    };
  }

  const platform = (process.argv[2] ?? 'android').toLowerCase();
  const snack = new Snack({
    name: 'Pulse',
    description: 'Pulse local project (filtered upload)',
    files,
  });

  const saved = await snack.saveAsync();
  let url = `https://snack.expo.dev/${saved.id}`;
  if (platform === 'ios') url += '?platform=ios';
  else if (platform === 'android') url += '?platform=android';

  console.log(`Expo Snack URL: ${url}`);
}

main().catch((err) => {
  console.error('Failed to create Expo Snack:', err);
  process.exit(1);
});
