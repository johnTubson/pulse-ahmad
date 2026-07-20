/**
 * Export design tokens / variables from a Figma file with view access.
 *
 * View access is enough: the API uses account permissions via a Personal
 * Access Token. You do not need edit rights on the file.
 *
 * Setup
 *   1. Figma → Settings → Security → Personal access tokens
 *      Scopes: File content (read). If you have Enterprise, also
 *      Variables (read) for the Variables API.
 *   2. Copy the file key from the URL:
 *      https://www.figma.com/design/<FILE_KEY>/...
 *   3. Put credentials in .env (or export them):
 *      FIGMA_ACCESS_TOKEN=figd_...
 *      FIGMA_FILE_KEY=...
 *
 * Run
 *   npx tsx scripts/exportFigmaTokens.ts
 *   npx tsx scripts/exportFigmaTokens.ts --file-key KEY --out design-tokens
 *   npx tsx scripts/exportFigmaTokens.ts --from-json path/to/plugin-export.json
 *   npx tsx scripts/exportFigmaTokens.ts --from-flat design-tokens/tokens.flat.json --write
 *
 * Notes
 *   - Variables REST API requires Figma Enterprise. Without it the script
 *     falls back to Styles + walking local paint/text styles (still useful).
 *   - Non-Enterprise alternative: open the file in Dev Mode, run a Variables
 *     exporter plugin, save JSON, then pass --from-json.
 *   - Mapping to tokens.js is scale-aware (Primary/500, typography styles) —
 *     see scripts/lib/mapFigmaTokens.ts.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  flatTokensFromExport,
  formatTokensModule,
  mapFigmaToPulseTokens,
  nestTokens,
  type FlatToken,
} from './lib/mapFigmaTokens';

const ROOT = process.cwd();
const API = 'https://api.figma.com/v1';

type Rgba = { r: number; g: number; b: number; a?: number };

type FigmaVariable = {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, unknown>;
  description?: string;
  hiddenFromPublishing?: boolean;
  scopes?: string[];
  codeSyntax?: Record<string, string>;
};

type FigmaCollection = {
  id: string;
  name: string;
  key: string;
  modes: { modeId: string; name: string }[];
  defaultModeId: string;
  remote?: boolean;
  hiddenFromPublishing?: boolean;
};

type VariablesMeta = {
  variables: Record<string, FigmaVariable>;
  variableCollections: Record<string, FigmaCollection>;
};

type StyleMeta = {
  key: string;
  file_key: string;
  node_id: string;
  style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  name: string;
  description?: string;
};

// ---------------------------------------------------------------------------
// CLI / env
// ---------------------------------------------------------------------------

function loadDotEnv(): void {
  try {
    const raw = readFileSync(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // .env optional
  }
}

function parseArgs(argv: string[]) {
  const out = {
    fileKey: process.env.FIGMA_FILE_KEY ?? process.env.FIGMA_FILE_ID ?? '',
    token: process.env.FIGMA_ACCESS_TOKEN ?? process.env.FIGMA_TOKEN ?? process.env.FIGMA_PAT ?? '',
    outDir: join(ROOT, 'design-tokens'),
    fromJson: '' as string,
    fromFlat: '' as string,
    writeTokensJs: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file-key' || a === '-f') out.fileKey = argv[++i] ?? '';
    else if (a === '--token' || a === '-t') out.token = argv[++i] ?? '';
    else if (a === '--out' || a === '-o') out.outDir = resolve(argv[++i] ?? out.outDir);
    else if (a === '--from-json') out.fromJson = resolve(argv[++i] ?? '');
    else if (a === '--from-flat') out.fromFlat = resolve(argv[++i] ?? '');
    else if (a === '--write') out.writeTokensJs = true;
    else if (a === '--url' && argv[i + 1]) {
      out.fileKey = extractFileKey(argv[++i]!) ?? out.fileKey;
    } else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  if (!out.fileKey && !out.fromJson && !out.fromFlat) {
    const positional = argv.find((a) => !a.startsWith('-'));
    if (positional) {
      out.fileKey = extractFileKey(positional) ?? positional;
    }
  }

  return out;
}

function printHelp(): void {
  console.log(`
Export Figma design tokens (variables + styles).

Usage:
  npx tsx scripts/exportFigmaTokens.ts [--file-key KEY | --url URL] [--out DIR]
  npx tsx scripts/exportFigmaTokens.ts --from-flat design-tokens/tokens.flat.json --write
  npx tsx scripts/exportFigmaTokens.ts --from-json plugin-export.json

Env:
  FIGMA_ACCESS_TOKEN   Personal access token (required unless --from-flat / --from-json)
  FIGMA_FILE_KEY       File key from the Figma URL

Flags:
  --file-key, -f       Figma file key
  --url                Full Figma file URL (key extracted)
  --token, -t          PAT (prefer env / .env)
  --out, -o            Output directory (default: design-tokens/)
  --from-flat          Remap from a previous tokens.flat.json (no API)
  --from-json          Parse a Variables plugin / Dev Mode JSON dump
  --write              Also overwrite tokens.js
  --help, -h
`);
}

function extractFileKey(input: string): string | null {
  const m = input.match(/figma\.com\/(?:file|design|proto|board|slides|deck)\/([a-zA-Z0-9]+)/);
  return m?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Figma HTTP
// ---------------------------------------------------------------------------

async function figmaGet<T>(
  path: string,
  token: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number; body: string }> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'X-Figma-Token': token },
  });
  const body = await res.text();
  if (!res.ok) return { ok: false, status: res.status, body };
  return { ok: true, data: JSON.parse(body) as T };
}

// ---------------------------------------------------------------------------
// Value helpers
// ---------------------------------------------------------------------------

export function rgbaToHex(c: Rgba): string {
  const clamp = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255);
  const h = (n: number) => clamp(n).toString(16).padStart(2, '0');
  const hex = `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  const a = c.a ?? 1;
  if (a < 1) {
    return `${hex}${Math.round(a * 255)
      .toString(16)
      .padStart(2, '0')}`;
  }
  return hex;
}

function isRgba(v: unknown): v is Rgba {
  return (
    typeof v === 'object' &&
    v !== null &&
    'r' in v &&
    'g' in v &&
    'b' in v &&
    typeof (v as Rgba).r === 'number'
  );
}

function isAlias(v: unknown): v is { type: 'VARIABLE_ALIAS'; id: string } {
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as { type?: string }).type === 'VARIABLE_ALIAS' &&
    typeof (v as { id?: string }).id === 'string'
  );
}

function resolveVariableValue(
  value: unknown,
  variables: Record<string, FigmaVariable>,
  modeId: string,
  depth = 0,
): unknown {
  if (depth > 20) return value;
  if (isAlias(value)) {
    const target = variables[value.id];
    if (!target) return value;
    const next = target.valuesByMode[modeId] ?? Object.values(target.valuesByMode)[0];
    return resolveVariableValue(next, variables, modeId, depth + 1);
  }
  if (isRgba(value)) return rgbaToHex(value);
  return value;
}

function splitName(name: string): string[] {
  return name
    .split(/[/\.]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Variables → flat tokens
// ---------------------------------------------------------------------------

function tokensFromVariables(meta: VariablesMeta): FlatToken[] {
  const tokens: FlatToken[] = [];
  for (const variable of Object.values(meta.variables)) {
    if (variable.hiddenFromPublishing) continue;
    const collection = meta.variableCollections[variable.variableCollectionId];
    const modes = collection?.modes ?? [{ modeId: 'default', name: 'Default' }];
    const defaultMode = collection?.defaultModeId ?? modes[0]?.modeId;

    for (const mode of modes) {
      const raw = variable.valuesByMode[mode.modeId];
      if (raw === undefined) continue;
      const resolved = resolveVariableValue(raw, meta.variables, mode.modeId);
      const type =
        variable.resolvedType === 'COLOR'
          ? 'color'
          : variable.resolvedType === 'FLOAT'
            ? 'number'
            : variable.resolvedType === 'STRING'
              ? 'string'
              : variable.resolvedType === 'BOOLEAN'
                ? 'boolean'
                : 'unknown';

      tokens.push({
        path: splitName(variable.name),
        name: variable.name,
        type,
        value: resolved,
        source: 'variable',
        collection: collection?.name,
        mode: mode.name,
        description: variable.description,
        figmaId: variable.id,
      });

      // Prefer default mode as the primary entry when multiple modes exist
      if (modes.length > 1 && mode.modeId !== defaultMode) {
        // keep all modes; nested tree builder will key by mode
      }
    }
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Styles → flat tokens
// ---------------------------------------------------------------------------

async function tokensFromStyles(
  fileKey: string,
  token: string,
): Promise<{ tokens: FlatToken[]; styles: StyleMeta[]; errors: string[] }> {
  const errors: string[] = [];
  const stylesRes = await figmaGet<{ meta: { styles: StyleMeta[] } }>(
    `/files/${fileKey}/styles`,
    token,
  );
  if (!stylesRes.ok) {
    errors.push(`Styles API ${stylesRes.status}: ${stylesRes.body.slice(0, 200)}`);
    return { tokens: [], styles: [], errors };
  }

  const styles = stylesRes.data.meta.styles ?? [];
  if (styles.length === 0) return { tokens: [], styles, errors };

  // Batch node lookups (Figma allows multiple ids)
  const nodeIds = [...new Set(styles.map((s) => s.node_id))];
  const nodes: Record<string, unknown> = {};
  const chunkSize = 50;
  for (let i = 0; i < nodeIds.length; i += chunkSize) {
    const chunk = nodeIds.slice(i, i + chunkSize);
    const ids = encodeURIComponent(chunk.join(','));
    const nodesRes = await figmaGet<{ nodes: Record<string, { document?: unknown }> }>(
      `/files/${fileKey}/nodes?ids=${ids}`,
      token,
    );
    if (!nodesRes.ok) {
      errors.push(`Nodes API ${nodesRes.status}: ${nodesRes.body.slice(0, 200)}`);
      continue;
    }
    for (const [id, entry] of Object.entries(nodesRes.data.nodes ?? {})) {
      if (entry?.document) nodes[id] = entry.document;
    }
  }

  const tokens: FlatToken[] = [];
  for (const style of styles) {
    const doc = nodes[style.node_id] as
      | {
          fills?: { type: string; color?: Rgba; opacity?: number }[];
          style?: Record<string, unknown>;
          effects?: unknown[];
        }
      | undefined;

    if (style.style_type === 'FILL') {
      const fill = doc?.fills?.find((f) => f.type === 'SOLID' && f.color);
      if (fill?.color) {
        const color = { ...fill.color, a: (fill.color.a ?? 1) * (fill.opacity ?? 1) };
        tokens.push({
          path: splitName(style.name),
          name: style.name,
          type: 'color',
          value: rgbaToHex(color),
          source: 'style',
          description: style.description,
          figmaId: style.node_id,
        });
      }
    } else if (style.style_type === 'TEXT' && doc?.style) {
      tokens.push({
        path: splitName(style.name),
        name: style.name,
        type: 'typography',
        value: {
          fontFamily: doc.style.fontFamily,
          fontWeight: doc.style.fontWeight,
          fontSize: doc.style.fontSize,
          lineHeightPx: doc.style.lineHeightPx,
          letterSpacing: doc.style.letterSpacing,
        },
        source: 'style',
        description: style.description,
        figmaId: style.node_id,
      });
    }
  }

  return { tokens, styles, errors };
}

// ---------------------------------------------------------------------------
// Plugin JSON fallback
// ---------------------------------------------------------------------------

function tokensFromPluginJson(raw: unknown): FlatToken[] {
  // Accept either Variables API shape { meta: { variables, variableCollections } }
  // or a flat array / Tokens Studio-ish { colors: {...} } dump.
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'meta' in raw &&
    typeof (raw as { meta: unknown }).meta === 'object'
  ) {
    const meta = (raw as { meta: VariablesMeta }).meta;
    if (meta.variables && meta.variableCollections) {
      return tokensFromVariables(meta).map((t) => ({ ...t, source: 'plugin-json' as const }));
    }
  }

  const tokens: FlatToken[] = [];
  const walk = (node: unknown, path: string[]) => {
    if (node === null || node === undefined) return;
    if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
      tokens.push({
        path,
        name: path.join('/'),
        type:
          typeof node === 'string' && node.startsWith('#')
            ? 'color'
            : typeof node === 'number'
              ? 'number'
              : typeof node === 'boolean'
                ? 'boolean'
                : 'string',
        value: node,
        source: 'plugin-json',
      });
      return;
    }
    if (typeof node === 'object' && 'value' in (node as object)) {
      const v = (node as { value: unknown; type?: string }).value;
      const t = (node as { type?: string }).type;
      tokens.push({
        path,
        name: path.join('/'),
        type:
          t === 'color' || (typeof v === 'string' && v.startsWith('#'))
            ? 'color'
            : typeof v === 'number'
              ? 'number'
              : 'unknown',
        value: v,
        source: 'plugin-json',
      });
      return;
    }
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (k.startsWith('$')) continue;
        walk(v, [...path, k]);
      }
    }
  };
  walk(raw, []);
  return tokens;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.outDir, { recursive: true });

  let allTokens: FlatToken[] = [];
  const raw: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    fileKey: args.fileKey || null,
  };
  const notes: string[] = [];

  if (args.fromFlat) {
    const parsed = JSON.parse(readFileSync(args.fromFlat, 'utf8')) as unknown;
    allTokens = flatTokensFromExport(parsed);
    raw.fromFlat = args.fromFlat;
    notes.push(`Remapped ${allTokens.length} tokens from ${args.fromFlat}`);
  } else if (args.fromJson) {
    const parsed = JSON.parse(readFileSync(args.fromJson, 'utf8')) as unknown;
    allTokens = tokensFromPluginJson(parsed);
    raw.pluginJson = parsed;
    notes.push(`Loaded ${allTokens.length} tokens from ${args.fromJson}`);
  } else {
    if (!args.token) {
      console.error(
        'Missing FIGMA_ACCESS_TOKEN. Create a PAT in Figma Settings → Security, or use --from-flat / --from-json.',
      );
      printHelp();
      process.exit(1);
    }
    if (!args.fileKey) {
      console.error('Missing FIGMA_FILE_KEY (or pass --file-key / --url).');
      printHelp();
      process.exit(1);
    }

    // 1) Variables API (Enterprise)
    const varsRes = await figmaGet<{ meta: VariablesMeta; error?: boolean; status?: number }>(
      `/files/${args.fileKey}/variables/local`,
      args.token,
    );
    if (varsRes.ok && varsRes.data.meta?.variables) {
      raw.variables = varsRes.data.meta;
      const fromVars = tokensFromVariables(varsRes.data.meta);
      allTokens.push(...fromVars);
      notes.push(
        `Variables API: ${Object.keys(varsRes.data.meta.variables).length} variables → ${fromVars.length} token values`,
      );
    } else if (!varsRes.ok) {
      raw.variablesError = { status: varsRes.status, body: varsRes.body.slice(0, 500) };
      if (varsRes.status === 403 || varsRes.status === 404) {
        notes.push(
          `Variables API unavailable (${varsRes.status}) — needs Enterprise, or use a plugin dump with --from-json. Falling back to Styles.`,
        );
      } else {
        notes.push(`Variables API error ${varsRes.status}: ${varsRes.body.slice(0, 160)}`);
      }
    }

    // 2) Styles API (works with view access on any plan)
    const {
      tokens: styleTokens,
      styles,
      errors,
    } = await tokensFromStyles(args.fileKey, args.token);
    raw.styles = styles;
    if (errors.length) raw.styleErrors = errors;
    allTokens.push(...styleTokens);
    notes.push(`Styles API: ${styles.length} styles → ${styleTokens.length} tokens`);
    for (const e of errors) notes.push(e);

    // 3) File metadata (name) for the dump
    const fileRes = await figmaGet<{ name: string; lastModified: string }>(
      `/files/${args.fileKey}?depth=1`,
      args.token,
    );
    if (fileRes.ok) {
      raw.file = { name: fileRes.data.name, lastModified: fileRes.data.lastModified };
      notes.push(`File: ${fileRes.data.name}`);
    } else if (fileRes.status === 403) {
      console.error(
        '403 on file fetch — your token cannot see this file. Confirm view access on the same Figma account that owns the PAT.',
      );
      process.exit(1);
    }
  }

  const nested = nestTokens(allTokens);
  const flatList = allTokens.map((t) => ({
    name: t.name,
    path: t.path.join('/'),
    type: t.type,
    value: t.value,
    source: t.source,
    collection: t.collection,
    mode: t.mode,
  }));

  if (!args.fromFlat) {
    writeFileSync(join(args.outDir, 'figma-raw.json'), JSON.stringify(raw, null, 2));
    writeFileSync(join(args.outDir, 'tokens.flat.json'), JSON.stringify(flatList, null, 2));
  }
  writeFileSync(join(args.outDir, 'tokens.nested.json'), JSON.stringify(nested, null, 2));

  const pulse = mapFigmaToPulseTokens(allTokens);
  const tokensJs = formatTokensModule(pulse);
  writeFileSync(join(args.outDir, 'tokens.figma.js'), tokensJs);
  writeFileSync(join(args.outDir, 'tokens.mapped.json'), JSON.stringify(pulse, null, 2));

  for (const w of pulse.meta.warnings) notes.push(`map: ${w}`);
  for (const m of pulse.meta.mappedFrom) notes.push(`map: ${m}`);

  if (args.writeTokensJs) {
    writeFileSync(join(ROOT, 'tokens.js'), tokensJs);
    notes.push('Wrote tokens.js (--write)');
  }

  writeFileSync(
    join(args.outDir, 'README.md'),
    `# Figma token export

Generated by \`scripts/exportFigmaTokens.ts\` + \`scripts/lib/mapFigmaTokens.ts\`.

## Files

| File | Purpose |
|------|---------|
| \`figma-raw.json\` | API / plugin payload |
| \`tokens.flat.json\` | Flat list (easy to scan) |
| \`tokens.nested.json\` | Nested by Figma name path |
| \`tokens.mapped.json\` | Pulse token object (+ mapping meta) |
| \`tokens.figma.js\` | Candidate \`tokens.js\` for NativeWind |

## Mapping rules

- Color scales (\`Primary/500\`, \`Error/600\`, …) → semantic + full Tailwind scales
- Text styles (\`Heading/Large/Normal\`, …) → \`typography\` + \`fontSize\`
- Mood / category → fixed palette midtones (not in Figma as named styles)
- Spacing / radius → product defaults until Figma exposes number styles

## Re-run

\`\`\`bash
# API (view access + PAT)
FIGMA_ACCESS_TOKEN=figd_... FIGMA_FILE_KEY=... npm run tokens:figma -- --write

# Remap from an existing flat export (no API)
npx tsx scripts/exportFigmaTokens.ts --from-flat ./design-tokens/tokens.flat.json --write
\`\`\`
`,
  );

  console.log('\nFigma token export complete\n');
  for (const n of notes) console.log(`  • ${n}`);
  console.log(`\n  ${flatList.length} flat tokens → ${args.outDir}/`);
  console.log(`  Candidate tokens.js: ${join(args.outDir, 'tokens.figma.js')}`);
  console.log(
    `  Semantics: primary=${(pulse.colors.primary as { DEFAULT: string }).DEFAULT} error=${(pulse.colors.error as { DEFAULT: string }).DEFAULT}\n`,
  );
}

if (process.argv[1]?.includes('exportFigmaTokens')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
