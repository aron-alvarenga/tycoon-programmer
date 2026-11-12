import { useSyncExternalStore } from 'react';
import { gameContent } from '../data/content';
import { createGameStore } from './gameStore';
import type { GameStoreSnapshot } from './gameStore';

export const gameStore = createGameStore(gameContent, window.localStorage);

export const useGameStore = (): GameStoreSnapshot =>
  useSyncExternalStore(gameStore.subscribe, gameStore.getSnapshot);
