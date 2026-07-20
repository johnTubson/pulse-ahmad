/**
 * Map Figma style exports (Tailwind-like color scales + text styles)
 * into Pulse `tokens.js` shape.
 *
 * Designed for the Pulse design file layout:
 *   Primary/50–950, Success/*, Warning/*, Error/*, Grey/*, Base/White…
 *   Display|Heading|Body|Label|Button / {size} / {Normal|Emphasized}
 */

export type FlatToken = {
  path: string[];
  name: string;
  type: 'color' | 'number' | 'string' | 'boolean' | 'typography' | 'unknown';
  value: unknown;
  source: 'variable' | 'style' | 'plugin-json';
  collection?: string;
  mode?: string;
  description?: string;
  figmaId?: string;
};

export type TypeStyle = {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeightPx: number;
  letterSpacing: number;
};

export type PulseTokens = {
  fontFamily: { sans: string };
  colors: Record<string, unknown>;
  typography: Record<string, unknown>;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  fontSize: Record<string, number>;
  meta: {
    mappedFrom: string[];
    warnings: string[];
  };
};

const SCALE_STEPS = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

const TYPOGRAPHY_ROOTS = new Set(['Display', 'Heading', 'Body', 'Label', 'Button']);

/** App category → Figma palette + step (no category styles in the file). */
const CATEGORY_MAP: Record<string, [string, string]> = {
  groceries: ['Teal', '600'],
  'eating-out': ['Orange', '500'],
  delivery: ['Pink', '500'],
  transport: ['Sky', '600'],
  shopping: ['Violet', '500'],
  entertainment: ['Yellow', '500'],
  bills: ['Indigo', '500'],
  health: ['Emerald', '500'],
  education: ['Cyan', '600'],
  gifts: ['Fuchsia', '500'],
  savings: ['Grey', '500'],
  other: ['Grey', '400'],
};

/** Mood 1–5 → palette step (low → high). */
const MOOD_MAP: Record<1 | 2 | 3 | 4 | 5, [string, string]> = {
  1: ['Error', '500'],
  2: ['Orange', '500'],
  3: ['Yellow', '500'],
  4: ['Lime', '500'],
  5: ['Success', '500'],
};

const DEFAULT_SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const DEFAULT_RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };

export function nestTokens(tokens: FlatToken[]): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  const ranked = [...tokens].sort((a, b) => {
    const src = (x: FlatToken) =>
      x.source === 'variable' ? 0 : x.source === 'plugin-json' ? 1 : 2;
    return src(a) - src(b);
  });

  for (const t of ranked) {
    let cursor: Record<string, unknown> = root;
    const parts = t.path.length ? t.path : [t.name];
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i]!;
      const next = cursor[key];
      if (typeof next !== 'object' || next === null || Array.isArray(next)) {
        cursor[key] = {};
      }
      cursor = cursor[key] as Record<string, unknown>;
    }
    const leaf = parts[parts.length - 1]!;
    if (cursor[leaf] === undefined) {
      cursor[leaf] =
        t.mode && t.mode.toLowerCase() !== 'default' && t.mode.toLowerCase() !== 'mode 1'
          ? { [t.mode]: t.value }
          : t.value;
    } else if (
      t.mode &&
      typeof cursor[leaf] === 'object' &&
      cursor[leaf] !== null &&
      !Array.isArray(cursor[leaf])
    ) {
      (cursor[leaf] as Record<string, unknown>)[t.mode] = t.value;
    }
  }
  return root;
}

function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);
}

function isTypeStyle(v: unknown): v is TypeStyle {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as TypeStyle).fontSize === 'number' &&
    typeof (v as TypeStyle).fontFamily === 'string'
  );
}

/** Detect Tailwind-like `{ 50: '#…', 500: '#…' }` scales. */
export function isColorScale(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length < 2) return false;
  let scaleKeys = 0;
  for (const [k, v] of entries) {
    if (!isHexColor(v)) return false;
    if (/^\d{2,3}$/.test(k)) scaleKeys++;
  }
  return scaleKeys >= 2;
}

function findScale(
  nested: Record<string, unknown>,
  names: string[],
): { name: string; scale: Record<string, string> } | undefined {
  for (const name of names) {
    const hit = nested[name];
    if (isColorScale(hit)) return { name, scale: hit };
    // case-insensitive
    const key = Object.keys(nested).find((k) => k.toLowerCase() === name.toLowerCase());
    if (key && isColorScale(nested[key]))
      return { name: key, scale: nested[key] as Record<string, string> };
  }
  return undefined;
}

/** Prefer exact steps; fall back along the scale toward midtones. */
export function pickStep(
  scale: Record<string, string> | undefined,
  preferred: string[],
): string | undefined {
  if (!scale) return undefined;
  for (const step of preferred) {
    if (isHexColor(scale[step])) return scale[step];
  }
  for (const step of ['500', '600', '400', '700', '300']) {
    if (isHexColor(scale[step])) return scale[step];
  }
  return Object.values(scale).find(isHexColor);
}

function withSemantic(
  scale: Record<string, string>,
  defaults: { DEFAULT: string; dark: string },
): Record<string, string> {
  const out: Record<string, string> = { DEFAULT: defaults.DEFAULT, dark: defaults.dark };
  for (const step of SCALE_STEPS) {
    if (isHexColor(scale[step])) out[step] = scale[step]!;
  }
  // Keep any non-standard keys (e.g. alpha steps already normalized elsewhere)
  for (const [k, v] of Object.entries(scale)) {
    if (!(k in out) && isHexColor(v)) out[k] = v;
  }
  return out;
}

function camelCasePalette(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part, i) => {
      const lower = part.toLowerCase();
      if (i === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function roundPx(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeTypeStyle(style: TypeStyle): TypeStyle {
  return {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontSize: roundPx(style.fontSize),
    lineHeightPx: roundPx(style.lineHeightPx),
    letterSpacing: roundPx(style.letterSpacing),
  };
}

function extractTypography(nested: Record<string, unknown>): {
  tree: Record<string, unknown>;
  styles: { path: string[]; style: TypeStyle }[];
  fontFamily: string | undefined;
} {
  const tree: Record<string, unknown> = {};
  const styles: { path: string[]; style: TypeStyle }[] = [];
  let fontFamily: string | undefined;

  const walk = (node: unknown, path: string[]) => {
    if (isTypeStyle(node)) {
      const style = normalizeTypeStyle(node);
      styles.push({ path, style });
      fontFamily ??= style.fontFamily;
      // nest under lowercase roots: display.large.normal
      let cursor: Record<string, unknown> = tree;
      const keys = path.map((p, i) => (i === 0 ? p.toLowerCase() : p.toLowerCase()));
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]!;
        if (typeof cursor[k] !== 'object' || cursor[k] === null) cursor[k] = {};
        cursor = cursor[k] as Record<string, unknown>;
      }
      cursor[keys[keys.length - 1]!] = style;
      return;
    }
    if (typeof node === 'object' && node !== null) {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        walk(v, [...path, k]);
      }
    }
  };

  for (const root of TYPOGRAPHY_ROOTS) {
    if (nested[root] !== undefined) walk(nested[root], [root]);
  }

  return { tree, styles, fontFamily };
}

function fontSizeFromTypography(
  styles: { path: string[]; style: TypeStyle }[],
): Record<string, number> {
  const byPath = (pred: (p: string[]) => boolean) =>
    styles.find((s) => pred(s.path.map((x) => x.toLowerCase())))?.style.fontSize;

  const labelSmall = byPath((p) => p[0] === 'label' && p[1] === 'small');
  const labelMedium = byPath((p) => p[0] === 'label' && p[1] === 'medium');
  const bodySmall = byPath((p) => p[0] === 'body' && p[1] === 'small');
  const bodyMedium = byPath((p) => p[0] === 'body' && p[1] === 'medium');
  const bodyLarge = byPath((p) => p[0] === 'body' && p[1] === 'large');
  const headingSmall = byPath((p) => p[0] === 'heading' && p[1] === 'small');
  const headingMedium = byPath((p) => p[0] === 'heading' && p[1] === 'medium');
  const headingLarge = byPath((p) => p[0] === 'heading' && p[1] === 'large');
  const displaySmall = byPath((p) => p[0] === 'display' && p[1] === 'small');
  const displayMedium = byPath((p) => p[0] === 'display' && p[1] === 'medium');
  const displayLarge = byPath((p) => p[0] === 'display' && p[1] === 'large');

  return {
    xs: labelSmall ?? bodySmall ?? 11,
    sm: labelMedium ?? bodySmall ?? 12,
    base: bodyMedium ?? 14,
    lg: bodyLarge ?? headingMedium ?? 17,
    xl: headingLarge ?? headingSmall ?? 20,
    '2xl': displaySmall ?? 24,
    '3xl': displayMedium ?? 28,
    '4xl': displayLarge ?? 34,
  };
}

function normalizeAlpha(
  nested: Record<string, unknown>,
  groupName: string,
): Record<string, string> | undefined {
  const group = nested[groupName];
  if (typeof group !== 'object' || group === null) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(group as Record<string, unknown>)) {
    if (!isHexColor(v)) continue;
    const m = k.match(/(\d+)$/);
    out[m?.[1] ?? k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Build Pulse tokens from flat Figma export tokens.
 * Deterministic: scale steps preferred over name substring matching.
 */
export function mapFigmaToPulseTokens(tokens: FlatToken[]): PulseTokens {
  const warnings: string[] = [];
  const mappedFrom: string[] = [];
  const nested = nestTokens(tokens);

  const primaryHit = findScale(nested, ['Primary', 'Brand', 'Blue']);
  const secondaryHit = findScale(nested, ['Indigo', 'Violet', 'Secondary', 'Purple']);
  const successHit = findScale(nested, ['Success', 'Green', 'Emerald']);
  const warningHit = findScale(nested, ['Warning', 'Orange', 'Amber']);
  const errorHit = findScale(nested, ['Error', 'Danger', 'Destructive', 'Rose', 'Red']);
  const greyHit = findScale(nested, ['Grey', 'Gray', 'Neutral', 'Zinc', 'Slate']);
  const slateHit = findScale(nested, ['Slate']);

  if (!primaryHit) warnings.push('No Primary color scale found; using fallbacks');
  else mappedFrom.push(`${primaryHit.name} → colors.primary`);

  const primaryScale = primaryHit?.scale ?? {};
  const secondaryScale = secondaryHit?.scale ?? {};
  const successScale = successHit?.scale ?? {};
  const warningScale = warningHit?.scale ?? {};
  const errorScale = errorHit?.scale ?? {};
  const greyScale = greyHit?.scale ?? {};

  const primaryDefault = pickStep(primaryScale, ['500', '600']) ?? '#2b7fff';
  const primaryDark = pickStep(primaryScale, ['700', '800', '600']) ?? primaryDefault;
  const secondaryDefault = pickStep(secondaryScale, ['500', '600']) ?? '#615fff';
  const successDefault = pickStep(successScale, ['600', '500']) ?? '#00a63e';
  const warningDefault = pickStep(warningScale, ['600', '500']) ?? '#e17100';
  const errorDefault = pickStep(errorScale, ['500', '600']) ?? '#fb2c36';

  const base =
    typeof nested.Base === 'object' && nested.Base !== null
      ? (nested.Base as Record<string, unknown>)
      : {};
  const surface =
    (isHexColor(base.White) ? base.White : undefined) ?? pickStep(greyScale, ['50']) ?? '#ffffff';
  const background =
    pickStep(greyScale, ['50', '100']) ?? pickStep(slateHit?.scale, ['50']) ?? '#f9fafb';
  const textDefault = pickStep(greyScale, ['900', '950', '800']) ?? '#101828';
  const textMuted = pickStep(greyScale, ['500', '400', '600']) ?? '#6a7282';
  const border = pickStep(greyScale, ['200', '300']) ?? '#e5e7eb';

  mappedFrom.push(
    'Grey → background/text/border',
    'Base/White → surface',
    'Success/Error/Warning mid steps → semantics',
  );

  const colors: Record<string, unknown> = {
    primary: withSemantic(primaryScale, { DEFAULT: primaryDefault, dark: primaryDark }),
    secondary: withSemantic(secondaryScale, {
      DEFAULT: secondaryDefault,
      dark: pickStep(secondaryScale, ['700', '800']) ?? secondaryDefault,
    }),
    income: successDefault,
    expense: errorDefault,
    success: withSemantic(successScale, {
      DEFAULT: successDefault,
      dark: pickStep(successScale, ['800', '700']) ?? successDefault,
    }),
    warning: withSemantic(warningScale, {
      DEFAULT: warningDefault,
      dark: pickStep(warningScale, ['800', '700']) ?? warningDefault,
    }),
    error: withSemantic(errorScale, {
      DEFAULT: errorDefault,
      dark: pickStep(errorScale, ['800', '700']) ?? errorDefault,
    }),
    background,
    surface,
    text: { DEFAULT: textDefault, muted: textMuted },
    border,
  };

  // Mood + categories from palette steps (explicit, not substring)
  const mood: Record<string, string> = {};
  for (const n of [1, 2, 3, 4, 5] as const) {
    const [paletteName, step] = MOOD_MAP[n];
    const scale = findScale(nested, [paletteName])?.scale;
    const value = pickStep(scale, [step, '500', '600']);
    if (value) mood[String(n)] = value;
    else {
      warnings.push(`Mood ${n}: missing ${paletteName}/${step}`);
      mood[String(n)] = ['#fb2c36', '#ff6900', '#f0b100', '#7ccf00', '#00c950'][n - 1]!;
    }
  }
  colors.mood = mood;
  mappedFrom.push('Error/Orange/Yellow/Lime/Success → mood');

  const category: Record<string, string> = {};
  for (const [id, [paletteName, step]] of Object.entries(CATEGORY_MAP)) {
    const scale = findScale(nested, [paletteName])?.scale;
    const value = pickStep(scale, [step, '500', '600']);
    if (value) category[id] = value;
    else {
      warnings.push(`Category ${id}: missing ${paletteName}/${step}`);
    }
  }
  colors.category = category;
  mappedFrom.push('Palette midtones → category');

  // Expose remaining color scales for Tailwind (grey-100, teal-500, …)
  for (const [name, value] of Object.entries(nested)) {
    if (TYPOGRAPHY_ROOTS.has(name) || name === 'Base') continue;
    if (name.startsWith('Alpha ')) continue;
    if (!isColorScale(value)) continue;
    const key = camelCasePalette(name);
    // Avoid clobbering semantic objects we already set
    if (['primary', 'secondary', 'success', 'warning', 'error'].includes(key)) continue;
    if (colors[key] === undefined) colors[key] = value;
  }

  const alphaBlack = normalizeAlpha(nested, 'Alpha Black');
  const alphaWhite = normalizeAlpha(nested, 'Alpha White');
  if (alphaBlack) colors.alphaBlack = alphaBlack;
  if (alphaWhite) colors.alphaWhite = alphaWhite;

  const { tree: typography, styles: typeStyles, fontFamily } = extractTypography(nested);
  if (typeStyles.length === 0) {
    warnings.push('No typography styles found (Display/Heading/Body/Label/Button)');
  } else {
    mappedFrom.push(`Typography (${typeStyles.length} styles) → typography + fontSize`);
  }

  // Spacing / radius: not in this Figma styles dump — keep intentional defaults
  warnings.push(
    'spacing and borderRadius: no Figma number styles; kept product defaults (4/8/16/24/32, 8/12/16/20)',
  );

  return {
    fontFamily: { sans: fontFamily ?? 'Manrope' },
    colors,
    typography,
    spacing: { ...DEFAULT_SPACING },
    borderRadius: { ...DEFAULT_RADIUS },
    fontSize: fontSizeFromTypography(typeStyles),
    meta: { mappedFrom, warnings },
  };
}

/** Serialize a PulseTokens object to CommonJS module source. */
export function formatTokensModule(tokens: PulseTokens, generatedAt = new Date()): string {
  const { meta, ...rest } = tokens;
  const warningBlock =
    meta.warnings.length > 0 ? meta.warnings.map((w) => ` *  - ${w}`).join('\n') : ' *  (none)';
  const mappedBlock = meta.mappedFrom.map((m) => ` *  - ${m}`).join('\n');

  return `/**
 * Auto-generated from Figma styles — do not hand-edit semantic mappings.
 * Re-run: npm run tokens:figma  (or --from-flat design-tokens/tokens.flat.json)
 * Generated: ${generatedAt.toISOString()}
 *
 * Mapped:
${mappedBlock}
 *
 * Notes:
${warningBlock}
 */
module.exports = ${stringifyJs(rest, 0)};
`;
}

export function stringifyJs(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((v) => `${padIn}${stringifyJs(v, indent + 1)}`).join(',\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padIn}${key}: ${stringifyJs(v, indent + 1)}`;
    });
    return `{\n${lines.join(',\n')},\n${pad}}`;
  }
  return 'undefined';
}

/** Reload tokens from our own tokens.flat.json export. */
export function flatTokensFromExport(raw: unknown): FlatToken[] {
  if (!Array.isArray(raw)) {
    throw new Error('Expected tokens.flat.json to be an array');
  }
  return raw.map((row) => {
    const r = row as {
      name?: string;
      path?: string | string[];
      type?: FlatToken['type'];
      value?: unknown;
      source?: FlatToken['source'];
      collection?: string;
      mode?: string;
    };
    const path = Array.isArray(r.path)
      ? r.path
      : typeof r.path === 'string'
        ? r.path
            .split('/')
            .map((s) => s.trim())
            .filter(Boolean)
        : typeof r.name === 'string'
          ? r.name
              .split('/')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
    return {
      name: r.name ?? path.join('/'),
      path,
      type: r.type ?? 'unknown',
      value: r.value,
      source: r.source ?? 'style',
      collection: r.collection,
      mode: r.mode,
    };
  });
}
