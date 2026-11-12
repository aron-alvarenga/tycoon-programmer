import { describe, expect, it } from 'vitest';
import { gameContent } from '../src/data/content';
import {
  PROD_BUGS_MAX,
  STAT_MAX,
  applyAction,
  createInitialState,
  skillGain,
} from '../src/engine';
import type { GameState, PlayerAction } from '../src/engine';

const play = (state: GameState, action: PlayerAction) => applyAction(state, action, gameContent);

const assertInRange = (state: GameState): void => {
  const { player, company } = state;
  const stats = [
    player.energy,
    player.stress,
    player.integrity,
    ...Object.values(player.skills),
    ...Object.values(player.reputation),
    company.techDebt,
    company.customerSatisfaction,
    company.teamMorale,
    company.investorPressure,
  ];
  for (const value of stats) {
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(STAT_MAX);
  }
  expect(company.prodBugs).toBeGreaterThanOrEqual(0);
  expect(company.prodBugs).toBeLessThanOrEqual(PROD_BUGS_MAX);
};

describe('applyAction', () => {
  it('rest raises energy and lowers stress', () => {
    const start = createInitialState('rest-day', gameContent);
    const result = play(start, { type: 'rest' });
    expect(result.state.player.energy).toBeGreaterThan(start.player.energy);
    expect(result.state.player.stress).toBeLessThan(start.player.stress);
    expect(result.deltas.some((delta) => delta.key === 'energy' && delta.amount > 0)).toBe(true);
    expect(result.state.actionsLeft).toBe(start.actionsLeft - 1);
  });

  it('study raises the chosen skill with diminishing returns', () => {
    expect(skillGain(0, 6)).toBeGreaterThan(skillGain(60, 6));
    const start = createInitialState('study-day', gameContent);
    const first = play(start, { type: 'study', skill: 'code' });
    expect(first.state.player.skills.code).toBeGreaterThan(start.player.skills.code);
  });

  it('work moves a todo into doing and later into production', () => {
    let state = createInitialState('work-board', gameContent);
    expect(state.backlog.every((task) => task.column === 'todo')).toBe(true);

    state = play(state, { type: 'work' }).state;
    expect(state.backlog.some((task) => task.column === 'doing')).toBe(true);

    for (let i = 0; i < 16; i++) {
      if (state.pendingEventId) {
        const event = gameContent.events.find(item => item.id === state.pendingEventId)!;
        state = play(state, { type: 'chooseEvent', choiceId: event.choices[0]!.id }).state;
      }
      const result = play(state, { type: 'work' });
      state = result.state;
      if (state.actionsLeft === 0) state = play(state, { type: 'endDay' }).state;
    }

    expect(state.backlog.some((task) => task.column === 'production')).toBe(true);
    expect(state.player.tasksDelivered).toBeGreaterThan(0);
  });

  it('same seed and actions replay the same career', () => {
    const actions: PlayerAction[] = [
      { type: 'work' },
      { type: 'study', skill: 'infra' },
      { type: 'endDay' },
      { type: 'help' },
      { type: 'rest' },
      { type: 'endDay' },
    ];
    const run = () => {
      let state = createInitialState('replay-me', gameContent);
      for (const action of actions) state = play(state, action).state;
      return state;
    };
    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
  });

  it('plays 30 days through the action API without leaving ranges', () => {
    let state = createInitialState('thirty-days', gameContent);
    const rotation: PlayerAction[] = [
      { type: 'work' },
      { type: 'rest' },
      { type: 'study', skill: 'code' },
      { type: 'help' },
    ];

    for (let day = 0; day < 30; day++) {
      if (state.pendingEventId) {
        const event = gameContent.events.find(item => item.id === state.pendingEventId)!;
        state = play(state, { type: 'chooseEvent', choiceId: event.choices[0]!.id }).state;
      }
      state = play(state, rotation[day % rotation.length] ?? { type: 'rest' }).state;
      state = play(state, { type: 'work' }).state;
      state = play(state, { type: 'endDay' }).state;
      assertInRange(state);
    }

    expect(state.day).toBe(31);
    expect(state.log[0]).toBeDefined();
  });

  it('spending actions after the daily budget only logs and stays put', () => {
    const start = createInitialState('no-budget', gameContent);
    const spent = play(play(start, { type: 'rest' }).state, { type: 'rest' }).state;
    const blocked = play(spent, { type: 'rest' });
    expect(blocked.state.day).toBe(spent.day);
    expect(blocked.state.player.energy).toBe(spent.player.energy);
    expect(blocked.state.log[0]?.text).toContain('duas ações');
  });
});
