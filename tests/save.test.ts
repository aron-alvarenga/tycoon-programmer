import { describe, expect, it } from 'vitest';
import { gameContent } from '../src/data/content';
import { SAVE_VERSION, createInitialState, deserializeSave, serializeSave } from '../src/engine';
import { SAVE_STORAGE_KEY, createGameStore } from '../src/store/gameStore';
import type { KeyValueStorage } from '../src/store/gameStore';

const createMemoryStorage = (): KeyValueStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
};

describe('save format', () => {
  it('writes the save version', () => {
    const raw = serializeSave(createInitialState('v', gameContent));
    expect(JSON.parse(raw).version).toBe(SAVE_VERSION);
  });

  it('roundtrips the state', () => {
    const state = createInitialState('roundtrip', gameContent);
    expect(deserializeSave(serializeSave(state))).toEqual({ ok: true, state });
  });

  it('migrates a v1 save into the dashboard shape', () => {
    const raw = JSON.stringify({
      version: 1,
      state: {
        seed: 'legacy-save',
        rngState: 1,
        day: 4,
        levelId: 'intern',
        player: { energy: 70 },
        company: { techDebt: 40 },
        team: [],
        backlog: [{ id: 7, taskId: 'fix_the_thing', difficulty: 2 }],
      },
    });
    const loaded = deserializeSave(raw);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.state.actionsLeft).toBe(2);
    expect(loaded.state.log).toEqual([]);
    expect(loaded.state.backlog[0]).toMatchObject({
      id: 7,
      column: 'todo',
      progress: 0,
    });
  });

  it('rejects broken or future saves', () => {
    expect(deserializeSave('{nope')).toEqual({ ok: false, reason: 'invalid-json' });
    expect(deserializeSave('{"state":{}}')).toEqual({ ok: false, reason: 'invalid-shape' });
    expect(deserializeSave(JSON.stringify({ version: SAVE_VERSION + 1, state: {} }))).toEqual({
      ok: false,
      reason: 'unsupported-version',
    });
    expect(deserializeSave(JSON.stringify({ version: SAVE_VERSION, state: { seed: 1 } }))).toEqual({
      ok: false,
      reason: 'invalid-shape',
    });
  });

  it('migrates v2 careers without losing existing progress', () => {
    const state = createInitialState('old-career', gameContent);
    state.day = 17;
    state.player.tasksDelivered = 8;
    const old = JSON.parse(serializeSave(state));
    old.version = 2;
    delete old.state.pendingEventId;
    delete old.state.sprintDelivered;
    delete old.state.lastSprintReport;
    old.state.backlog.forEach((task: Record<string, unknown>) => delete task.dueDay);
    const loaded = deserializeSave(JSON.stringify(old));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.state.player).toEqual(state.player);
    expect(loaded.state.day).toBe(17);
    expect(loaded.state.backlog[0]?.dueDay).toBe(26);
    expect(loaded.state.sprintDelivered).toBe(0);
    expect(loaded.state.pendingEventId).toBeNull();
  });

  it('rejects malformed nested values before they can crash the interface', () => {
    const raw = JSON.parse(serializeSave(createInitialState('invalid-fields', gameContent)));
    raw.state.player.skills = null;
    expect(deserializeSave(JSON.stringify(raw))).toEqual({ok:false,reason:'invalid-shape'});
    raw.state.player.skills = {code:10,infra:5,architecture:0,softSkills:10};
    raw.state.backlog[0].difficulty = -1;
    expect(deserializeSave(JSON.stringify(raw))).toEqual({ok:false,reason:'invalid-shape'});
    raw.state.backlog[0].difficulty = 2;
    raw.state.actionsLeft = 999;
    expect(deserializeSave(JSON.stringify(raw))).toEqual({ok:false,reason:'invalid-shape'});
  });
});

describe('game store persistence', () => {
  it('rejects unknown content references before the career screen renders', () => {
    const storage=createMemoryStorage();
    const state=createInitialState('unknown-content',gameContent);
    state.levelId='missing-level';
    storage.setItem(SAVE_STORAGE_KEY,serializeSave(state));
    const store=createGameStore(gameContent,storage);
    expect(store.loadGame()).toBe(false);
    expect(store.getSnapshot().lastLoadError).toBe('invalid-shape');
    state.levelId='intern';state.pendingEventId='missing-event';
    storage.setItem(SAVE_STORAGE_KEY,serializeSave(state));
    expect(store.loadGame()).toBe(false);
  });
  it('saves to storage and loads back', () => {
    const storage = createMemoryStorage();
    const store = createGameStore(gameContent, storage);
    store.startNewCareer('persist');
    const original = store.getSnapshot().state;
    expect(store.saveGame()).toBe(true);
    expect(storage.data.has(SAVE_STORAGE_KEY)).toBe(true);

    const freshStore = createGameStore(gameContent, storage);
    expect(freshStore.loadGame()).toBe(true);
    expect(freshStore.getSnapshot().state).toEqual(original);
  });

  it('dispatches UI actions through the store', () => {
    const store = createGameStore(gameContent, createMemoryStorage());
    store.startNewCareer('ui-loop');
    const before = store.getSnapshot().state;
    expect(before).not.toBeNull();
    expect(store.dispatchAction({ type: 'rest' })).toBe(true);
    const after = store.getSnapshot();
    expect(after.state?.player.energy).toBeGreaterThan(before!.player.energy);
    expect(after.lastDeltas.some((delta) => delta.key === 'energy')).toBe(true);
    expect(after.actionSeq).toBe(1);
  });

  it('reports a missing save', () => {
    const store = createGameStore(gameContent, createMemoryStorage());
    expect(store.loadGame()).toBe(false);
    expect(store.getSnapshot().lastLoadError).toBe('no-save');
  });
});
