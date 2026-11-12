import { describe, expect, it } from 'vitest';
import { gameContent } from '../src/data/content';
import { INITIAL_COMPANY, INITIAL_PLAYER, TEAM_SIZE, createInitialState } from '../src/engine';

describe('createInitialState', () => {
  it('same seed always generates the same state', () => {
    const a = createInitialState('legado-e-filhos', gameContent);
    const b = createInitialState('legado-e-filhos', gameContent);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('different seeds generate different rolls', () => {
    const states = ['a', 'b', 'c', 'd', 'e'].map((seed) =>
      JSON.stringify(createInitialState(seed, gameContent).team),
    );
    expect(new Set(states).size).toBeGreaterThan(1);
  });

  it('starts as intern with GDD values', () => {
    const state = createInitialState('x', gameContent);
    expect(state.levelId).toBe('intern');
    expect(state.day).toBe(1);
    expect(state.actionsLeft).toBe(2);
    expect(state.log.length).toBeGreaterThan(0);
    expect(state.backlog.every((task) => task.column === 'todo')).toBe(true);
    expect(state.player).toEqual(INITIAL_PLAYER);
    expect(state.company).toEqual(INITIAL_COMPANY);
    expect(state.team).toHaveLength(TEAM_SIZE);
  });

  it('does not share nested objects with the balance constants', () => {
    const state = createInitialState('x', gameContent);
    state.player.skills.code = 99;
    expect(INITIAL_PLAYER.skills.code).toBe(15);
  });
});
