import { describe, expect, it } from 'vitest';
import { gameContent } from '../src/data/content';
import { applyAction, createInitialState, deserializeSave, getDailyNet, getPromotion, getTaskReward, getWorkProgress, serializeSave, SPRINT_BONUS_CENTS } from '../src/engine';
import type { GameState, PlayerAction } from '../src/engine';

const play = (state: GameState, action: PlayerAction) => applyAction(state, action, gameContent).state;
const resolveEvent = (state: GameState) => {
  const event = gameContent.events.find(item => item.id === state.pendingEventId);
  return event ? play(state, { type: 'chooseEvent', choiceId: event.choices[0]!.id }) : state;
};

describe('strategic progression', () => {
  it('introduces the loop with a task that can be delivered in the first day', () => {
    for (let seed = 0; seed < 20; seed++) {
      let state = createInitialState(`onboarding-${seed}`, gameContent);
      const taskId = state.backlog[0]!.id;
      state = play(play(state, {type:'work',taskId}), {type:'work',taskId});
      expect(state.backlog[0]!.column).toBe('production');
      expect(state.player.tasksDelivered).toBe(1);
    }
  });
  it('skill, morale and refactoring improve productivity; estimates match actual work', () => {
    const initial = createInitialState('productivity', gameContent);
    const task = initial.backlog[0]!;
    const skill = gameContent.tasks.find(item => item.id === task.taskId)!.skill;
    const estimate = getWorkProgress(initial, task, gameContent);
    expect(play(initial, { type: 'work', taskId: task.id }).backlog[0]!.progress).toBe(Math.min(100, estimate));
    const trained = structuredClone(initial);
    trained.player.skills[skill] = 80;
    expect(getWorkProgress(trained, task, gameContent)).toBeGreaterThan(estimate);
    trained.company.techDebt = 0;
    expect(getWorkProgress(trained, task, gameContent)).toBeGreaterThan(getWorkProgress({...trained, company: initial.company}, task, gameContent));
    trained.company.teamMorale = 100;
    expect(getWorkProgress(trained, task, gameContent)).toBeGreaterThanOrEqual(getWorkProgress({...trained,company:{...trained.company,teamMorale:0}},task,gameContent));
  });

  it('work follows the selected task and pauses the previous task without losing progress', () => {
    let state = createInitialState('selection', gameContent);
    const first = state.backlog[0]!;
    const second = state.backlog[1]!;
    state = play(state, { type:'work', taskId: second.id });
    expect(state.backlog[0]!.progress).toBe(0);
    expect(state.backlog[1]!.progress).toBeGreaterThan(0);
    const savedProgress = state.backlog[1]!.progress;
    state = play(state, { type:'work', taskId: first.id });
    expect(state.backlog[1]!.progress).toBe(savedProgress);
    expect(state.backlog.filter(task => task.column === 'doing').length).toBeLessThanOrEqual(1);
  });

  it('rushing trades faster work for debt and bugs on every block', () => {
    const state = createInitialState('rush', gameContent);
    const safe = play(state,{type:'work'});
    const rush = play(state,{type:'work',rush:true});
    expect(rush.backlog[0]!.progress).toBeGreaterThan(safe.backlog[0]!.progress);
    expect(rush.company.prodBugs).toBe(safe.company.prodBugs+1);
    expect(rush.company.techDebt).toBeGreaterThanOrEqual(safe.company.techDebt+8);
  });

  it('maintenance fixes the degradation spiral and unavailable actions cost nothing', () => {
    const state = createInitialState('maintenance', gameContent);
    state.company.prodBugs = 2;
    const fixed = play(state,{type:'fix'});
    expect(fixed.company.prodBugs).toBe(0);
    expect(fixed.company.customerSatisfaction).toBeGreaterThan(state.company.customerSatisfaction);
    expect(play(fixed,{type:'fix'})).toEqual(fixed);
    const clean = play(state,{type:'refactor'});
    expect(clean.company.techDebt).toBe(state.company.techDebt-12);
    expect(clean.player.skills.architecture).toBeGreaterThan(state.player.skills.architecture);
    const empty = {...state,backlog:[]};
    expect(play(empty,{type:'work'}).actionsLeft).toBe(state.actionsLeft);
    expect(play(state,{type:'work',taskId:999}).actionsLeft).toBe(state.actionsLeft);
  });

  it('delivery pays once, raises revenue, counts for the sprint and late work pays half', () => {
    const state = createInitialState('delivery', gameContent);
    const task = state.backlog[0]!;
    task.progress = 99;
    task.column = 'doing';
    const delivered = play(state,{type:'work',taskId:task.id});
    expect(delivered.company.cashCents-state.company.cashCents).toBe(getTaskReward(task,state.day));
    expect(delivered.company.revenueCents).toBeGreaterThan(state.company.revenueCents);
    expect(delivered.sprintDelivered).toBe(1);
    expect(delivered.player.tasksDelivered).toBe(1);
    expect(play(delivered,{type:'work',taskId:task.id}).company.cashCents).toBe(delivered.company.cashCents);
    expect(getTaskReward(task,task.dueDay+1)).toBe(getTaskReward(task,task.dueDay)/2);
  });

  it('nights recover energy and settle operating costs', () => {
    const state = createInitialState('night',gameContent);
    state.player.energy=30;
    state.company.techDebt=0;
    state.company.prodBugs=0;
    const next=play(state,{type:'endDay'});
    expect(next.player.energy).toBe(54);
    expect(next.company.cashCents).toBe(state.company.cashCents+getDailyNet(state));
    expect(next.actionsLeft).toBe(2);
  });

  it('sprint success pays a single bonus and failure remains recoverable', () => {
    const state=createInitialState('review',gameContent);
    state.day=10;
    state.sprintDelivered=3;
    const next=play(state,{type:'endDay'});
    expect(next.lastSprintReport).toEqual({sprint:1,delivered:3,success:true});
    expect(next.sprintDelivered).toBe(0);
    expect(next.company.cashCents).toBe(state.company.cashCents+getDailyNet(state)+SPRINT_BONUS_CENTS);
    state.sprintDelivered=1;
    const missed=play(state,{type:'endDay'});
    expect(missed.lastSprintReport?.success).toBe(false);
    expect(missed.company.cashCents).toBe(state.company.cashCents+getDailyNet(state));
    expect(missed.player.reputation.boss).toBeLessThan(state.player.reputation.boss);
  });

  it('promotion requires skill AND deliveries and raises salary without using a block', () => {
    let state=createInitialState('promotion',gameContent);
    expect(play(state,{type:'promote'}).levelId).toBe('intern');
    state.player.skills.code=25;
    expect(getPromotion(state,gameContent).ready).toBe(false);
    state.player.tasksDelivered=3;
    state.career.nextReviewDay=state.day;
    expect(getPromotion(state,gameContent).ready).toBe(true);
    state=play(state,{type:'promote'});
    expect(state.levelId).toBe('junior');
    expect(state.player.salaryCents).toBe(350000);
    expect(state.actionsLeft).toBe(2);
    expect(getPromotion(state,gameContent).requirements.map(item=>item.skill)).toContain('infra');
  });

  it('office events show eligible choices, block time advancement, and apply exactly once', () => {
    let state=createInitialState('events',gameContent);
    state=play(play(state,{type:'endDay'}),{type:'endDay'});
    expect(state.pendingEventId).not.toBeNull();
    expect(play(state,{type:'endDay'}).day).toBe(state.day);
    expect(play(state,{type:'work'}).actionsLeft).toBe(state.actionsLeft);
    expect(play(state,{type:'chooseEvent',choiceId:'invalid'}).pendingEventId).toBe(state.pendingEventId);
    const event=gameContent.events.find(item=>item.id===state.pendingEventId)!;
    expect(gameContent.promotions.find(level=>level.levelId===event.minLevelId)!.order).toBe(0);
    const choice=event.choices[0]!;
    const next=play(state,{type:'chooseEvent',choiceId:choice.id});
    expect(next.pendingEventId).toBeNull();
    expect(next.player.energy).toBe(Math.min(100,Math.max(0,state.player.energy+(choice.effects.energy??0))));
    expect(next.actionsLeft).toBe(state.actionsLeft);
    expect(play(next,{type:'chooseEvent',choiceId:choice.id})).toEqual(next);
    expect(deserializeSave(serializeSave(state))).toEqual({ok:true,state});
  });

  it('a sustainable strategy reaches the final career without runaway backlog across 240 days', () => {
    const run=()=>{
      let state=createInitialState('long-career',gameContent);
      for(let day=0;day<240;day++){
        state=resolveEvent(state);
        if(getPromotion(state,gameContent).ready) state=play(state,{type:'promote'});
        for(let block=0;block<2;block++){
          const promotion=getPromotion(state,gameContent);
          const missing=promotion.requirements.find(req=>req.value<req.target);
          const task=state.backlog.filter(task=>task.column!=='production').sort((a,b)=>a.difficulty-b.difficulty)[0];
          const action: PlayerAction = state.company.prodBugs>0 ? {type:'fix'}
            : state.player.energy<30 || state.player.stress>65 ? {type:'rest'}
            : state.company.techDebt>40 ? {type:'refactor'}
            : missing && (day%3===0 || !task) ? {type:'study',skill:missing.skill}
            : task ? {type:'work',taskId:task.id} : {type:'help'};
          state=play(state,action);
        }
        state=play(state,{type:'endDay'});
        expect(state.backlog.filter(task=>task.column!=='production').length).toBeLessThanOrEqual(8);
      }
      return state;
    };
    const state=run();
    expect(state.day).toBe(241);
    expect(state.levelId).toBe('architect');
    expect(state.player.energy).toBeGreaterThan(0);
    expect(state.company.prodBugs).toBeLessThan(4);
    expect(state).toEqual(run());
  });
});
