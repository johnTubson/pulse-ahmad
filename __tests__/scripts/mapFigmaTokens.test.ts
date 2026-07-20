import {
  flatTokensFromExport,
  isColorScale,
  mapFigmaToPulseTokens,
  pickStep,
  type FlatToken,
} from '../../scripts/lib/mapFigmaTokens';

function color(name: string, value: string): FlatToken {
  return {
    name,
    path: name.split('/'),
    type: 'color',
    value,
    source: 'style',
  };
}

function typeStyle(name: string, fontSize: number, fontWeight = 400): FlatToken {
  return {
    name,
    path: name.split('/'),
    type: 'typography',
    value: {
      fontFamily: 'Manrope',
      fontWeight,
      fontSize,
      lineHeightPx: fontSize * 1.4,
      letterSpacing: 0,
    },
    source: 'style',
  };
}

function scale(prefix: string, values: Record<string, string>): FlatToken[] {
  return Object.entries(values).map(([step, hex]) => color(`${prefix}/${step}`, hex));
}

const FULL = {
  '50': '#f8fafc',
  '100': '#f1f5f9',
  '200': '#e2e8f0',
  '300': '#cbd5e1',
  '400': '#94a3b8',
  '500': '#64748b',
  '600': '#475569',
  '700': '#334155',
  '800': '#1e293b',
  '900': '#0f172a',
  '950': '#020617',
};

describe('mapFigmaToPulseTokens', () => {
  it('picks mid-scale steps for semantics (not 50/200)', () => {
    const tokens: FlatToken[] = [
      ...scale('Primary', {
        ...FULL,
        '500': '#2b7fff',
        '700': '#1447e6',
      }),
      ...scale('Indigo', { ...FULL, '500': '#615fff', '700': '#432dd7' }),
      ...scale('Success', { ...FULL, '500': '#00c950', '600': '#00a63e', '800': '#016630' }),
      ...scale('Warning', { ...FULL, '500': '#fe9a00', '600': '#e17100', '800': '#973c00' }),
      ...scale('Error', { ...FULL, '50': '#fef2f2', '500': '#fb2c36', '800': '#9f0712' }),
      ...scale('Grey', {
        '50': '#f9fafb',
        '100': '#f3f4f6',
        '200': '#e5e7eb',
        '300': '#d1d5dc',
        '400': '#99a1af',
        '500': '#6a7282',
        '600': '#4a5565',
        '700': '#364153',
        '800': '#1e2939',
        '900': '#101828',
        '950': '#09090b',
      }),
      color('Base/White', '#ffffff'),
      ...scale('Teal', { ...FULL, '500': '#00bba7', '600': '#009689' }),
      ...scale('Orange', { ...FULL, '500': '#ff6900' }),
      ...scale('Pink', { ...FULL, '500': '#f6339a' }),
      ...scale('Sky', { ...FULL, '500': '#00a6f4', '600': '#0084d1' }),
      ...scale('Violet', { ...FULL, '500': '#8e51ff' }),
      ...scale('Yellow', { ...FULL, '500': '#f0b100' }),
      ...scale('Emerald', { ...FULL, '500': '#00bc7d' }),
      ...scale('Cyan', { ...FULL, '500': '#00b8db', '600': '#0092b8' }),
      ...scale('Fuchsia', { ...FULL, '500': '#e12afb' }),
      ...scale('Lime', { ...FULL, '500': '#7ccf00' }),
      typeStyle('Body/Medium', 14),
      typeStyle('Body/Large', 17),
      typeStyle('Label/Small', 11),
      typeStyle('Label/Medium', 12),
      typeStyle('Heading/Large/Normal', 20, 500),
      typeStyle('Display/Small/Normal', 24, 500),
      typeStyle('Display/Medium/Normal', 28, 500),
      typeStyle('Display/Large/Normal', 34, 500),
    ];

    const pulse = mapFigmaToPulseTokens(tokens);
    const primary = pulse.colors.primary as { DEFAULT: string; dark: string; '500': string };
    const error = pulse.colors.error as { DEFAULT: string; '50': string };
    const success = pulse.colors.success as { DEFAULT: string };

    expect(primary.DEFAULT).toBe('#2b7fff');
    expect(primary.dark).toBe('#1447e6');
    expect(error.DEFAULT).toBe('#fb2c36');
    expect(error.DEFAULT).not.toBe(error['50']);
    expect(success.DEFAULT).toBe('#00a63e');
    expect(pulse.colors.background).toBe('#f9fafb');
    expect(pulse.colors.surface).toBe('#ffffff');
    expect((pulse.colors.text as { DEFAULT: string; muted: string }).DEFAULT).toBe('#101828');
    expect(pulse.colors.border).toBe('#e5e7eb');
    expect(pulse.fontSize.base).toBe(14);
    expect(pulse.fontSize['4xl']).toBe(34);
    expect(pulse.fontFamily.sans).toBe('Manrope');
    expect((pulse.colors.mood as Record<string, string>)['1']).toBe('#fb2c36');
    expect((pulse.colors.mood as Record<string, string>)['5']).toBe('#00c950');
    expect((pulse.colors.category as Record<string, string>).groceries).toBe('#009689');
    expect(pulse.typography.body).toBeDefined();
  });

  it('reloads tokens.flat.json export shape', () => {
    const flat = flatTokensFromExport([
      {
        name: 'Primary/500',
        path: 'Primary/500',
        type: 'color',
        value: '#2b7fff',
        source: 'style',
      },
      {
        name: 'Primary/700',
        path: 'Primary/700',
        type: 'color',
        value: '#1447e6',
        source: 'style',
      },
      { name: 'Grey/50', path: 'Grey/50', type: 'color', value: '#f9fafb', source: 'style' },
      { name: 'Grey/900', path: 'Grey/900', type: 'color', value: '#101828', source: 'style' },
      { name: 'Base/White', path: 'Base/White', type: 'color', value: '#ffffff', source: 'style' },
    ]);
    const pulse = mapFigmaToPulseTokens(flat);
    expect((pulse.colors.primary as { DEFAULT: string }).DEFAULT).toBe('#2b7fff');
    expect((pulse.colors.primary as { dark: string }).dark).toBe('#1447e6');
  });
});

describe('pickStep / isColorScale', () => {
  it('prefers requested steps', () => {
    const scale = { '50': '#ffffff', '500': '#aabbcc', '600': '#ddeeff' };
    expect(isColorScale(scale)).toBe(true);
    expect(pickStep(scale, ['600', '500'])).toBe('#ddeeff');
    expect(pickStep(scale, ['999', '500'])).toBe('#aabbcc');
  });
});
