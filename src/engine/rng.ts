/**
 * Deterministic RNG (mulberry32). The whole generator state is a single uint32,
 * so it can be stored in GameState and in save files.
 */
export type RngState = number;

/** FNV-1a hash: turns any text seed into a uint32 initial state. */
export const seedToRngState = (seed: string): RngState => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** Pure step: returns a float in [0, 1) and the next state. */
export const nextRandom = (state: RngState): [value: number, nextState: RngState] => {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let t = nextState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, nextState];
};

export interface Rng {
  next: () => number;
  /** Integer in [min, max], both inclusive. */
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  chance: (probability: number) => boolean;
  getState: () => RngState;
}

/** Mutable wrapper for convenience inside a single engine step. */
export const createRng = (initialState: RngState): Rng => {
  let state = initialState >>> 0;
  const next = (): number => {
    const [value, nextState] = nextRandom(state);
    state = nextState;
    return value;
  };
  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) throw new Error('rng.pick: empty list');
    return items[int(0, items.length - 1)] as T;
  };
  return {
    next,
    int,
    pick,
    chance: (probability) => next() < probability,
    getState: () => state,
  };
};
