import { describe, expect, it } from 'vitest';
import { createRng, nextRandom, seedToRngState } from '../src/engine/rng';

const drawSequence = (seed: string, count: number): number[] => {
  const rng = createRng(seedToRngState(seed));
  return Array.from({ length: count }, () => rng.next());
};

describe('rng', () => {
  it('same seed produces the same sequence', () => {
    expect(drawSequence('abc', 50)).toEqual(drawSequence('abc', 50));
  });

  it('different seeds produce different sequences', () => {
    expect(drawSequence('abc', 10)).not.toEqual(drawSequence('abd', 10));
  });

  it('values stay in [0, 1)', () => {
    for (const value of drawSequence('range', 10_000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('int stays within inclusive bounds and hits both ends', () => {
    const rng = createRng(seedToRngState('dice'));
    const seen = new Set<number>();
    for (let i = 0; i < 1_000; i++) {
      const value = rng.int(1, 6);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('resuming from a saved state continues the same sequence', () => {
    const rng = createRng(seedToRngState('resume'));
    rng.next();
    rng.next();
    const resumed = createRng(rng.getState());
    expect(resumed.next()).toBe(rng.next());
  });

  it('nextRandom is pure', () => {
    expect(nextRandom(42)).toEqual(nextRandom(42));
  });
});
