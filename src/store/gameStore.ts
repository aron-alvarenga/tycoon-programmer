import { applyAction, createInitialState, deserializeSave, serializeSave } from '../engine';
import type { GameContent, GameState, LoadResult, PlayerAction, StatDelta } from '../engine';

export const SAVE_STORAGE_KEY = 'programmer-simulator:save';

/** Subset of the Web Storage API, so tests can inject an in-memory fake. */
export interface KeyValueStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface GameStoreSnapshot {
  state: GameState | null;
  lastLoadError: Extract<LoadResult, { ok: false }>['reason'] | 'no-save' | null;
  lastDeltas: readonly StatDelta[];
  actionSeq: number;
}

export interface GameStore {
  getSnapshot: () => GameStoreSnapshot;
  subscribe: (listener: () => void) => () => void;
  startNewCareer: (seed: string, playerName?: string) => void;
  dispatchAction: (action: PlayerAction) => boolean;
  saveGame: () => boolean;
  loadGame: () => boolean;
  hasSave: () => boolean;
}

export const createGameStore = (content: GameContent, storage: KeyValueStorage): GameStore => {
  let snapshot: GameStoreSnapshot = {
    state: null,
    lastLoadError: null,
    lastDeltas: [],
    actionSeq: 0,
  };
  const listeners = new Set<() => void>();

  const setSnapshot = (next: GameStoreSnapshot): void => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    startNewCareer: (seed, playerName) => {
      const state = createInitialState(seed, content);
      if (playerName?.trim()) state.career.name = playerName.trim().slice(0, 40);
      setSnapshot({
        state,
        lastLoadError: null,
        lastDeltas: [],
        actionSeq: 0,
      });
    },
    dispatchAction: (action) => {
      if (!snapshot.state) return false;
      const result = applyAction(snapshot.state, action, content);
      setSnapshot({
        ...snapshot,
        state: result.state,
        lastLoadError: null,
        lastDeltas: result.deltas,
        actionSeq: snapshot.actionSeq + 1,
      });
      return true;
    },
    saveGame: () => {
      if (!snapshot.state) return false;
      storage.setItem(SAVE_STORAGE_KEY, serializeSave(snapshot.state));
      return true;
    },
    loadGame: () => {
      const raw = storage.getItem(SAVE_STORAGE_KEY);
      if (raw === null) {
        setSnapshot({ ...snapshot, lastLoadError: 'no-save', lastDeltas: [] });
        return false;
      }
      const result = deserializeSave(raw);
      if (!result.ok) {
        setSnapshot({ ...snapshot, lastLoadError: result.reason, lastDeltas: [] });
        return false;
      }
      if (!content.promotions.some(level => level.levelId === result.state.levelId) ||
        (result.state.pendingEventId !== null && !content.events.some(event => event.id === result.state.pendingEventId)) ||
        result.state.backlog.some(task => !content.tasks.some(def => def.id === task.taskId))) {
        setSnapshot({ ...snapshot, lastLoadError: 'invalid-shape', lastDeltas: [] });
        return false;
      }
      setSnapshot({
        state: result.state,
        lastLoadError: null,
        lastDeltas: [],
        actionSeq: snapshot.actionSeq + 1,
      });
      return true;
    },
    hasSave: () => storage.getItem(SAVE_STORAGE_KEY) !== null,
  };
};
