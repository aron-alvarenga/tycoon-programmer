import { describe, expect, it } from 'vitest';
import { deltaTone, formatDelta, formatMoney, formatSigned, ratioPercent } from '../src/ui/format';

describe('ui formatters', () => {
  it('formats money in pt-BR without cents', () => {
    expect(formatMoney(1_800_00)).toMatch(/1\.800/);
    expect(formatMoney(1_200_000_00)).toMatch(/1\.200\.000/);
  });

  it('formats signed deltas and paints the tone by variable', () => {
    expect(formatSigned(2)).toBe('+2');
    expect(formatSigned(-5)).toBe('-5');
    expect(formatDelta('energy', 2)).toBe('+2');
    expect(deltaTone('energy', 2)).toBe('good');
    expect(deltaTone('stress', 2)).toBe('bad');
    expect(deltaTone('techDebt', -4)).toBe('good');
  });

  it('clamps bar ratios', () => {
    expect(ratioPercent(50, 100)).toBe(50);
    expect(ratioPercent(12, 0)).toBe(0);
    expect(ratioPercent(200, 100)).toBe(100);
  });
});
