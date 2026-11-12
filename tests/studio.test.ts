import { describe, expect, it } from 'vitest';
import { gameContent } from '../src/data/content';
import { STUDIO_BALANCE as B } from '../src/data/studio';
import { applyAction, createInitialState as createBaseState, deserializeSave, getDevelopmentGain, getReleasePreview, serializeSave } from '../src/engine';
import type { GameState, PlayerAction } from '../src/engine';

const createInitialState: typeof createBaseState = (...args) => {
  const state = createBaseState(...args);
  state.career.enabled = false;
  state.company.cashCents = B.startCash;
  state.company.cloudCostCents = B.monthlyHosting;
  state.company.revenueCents = 0;
  return state;
};

const act = (state: GameState, action: PlayerAction) => applyAction(state, action, gameContent).state;
const resolve = (state: GameState) => {
  const event = gameContent.events.find(item => item.id === state.pendingEventId);
  return event ? act(state, { type: 'chooseEvent', choiceId: event.choices[0]!.id }) : state;
};
const createProject = () => act(createInitialState('studio', gameContent), { type: 'startProject', kind: 'website', name: 'Primeira ideia', audience: 'local' });
const complete = (initial: GameState, focus: 'balanced' | 'speed' | 'quality' = 'balanced') => {
  let state = initial;
  for (let i = 0; i < 150 && state.studio.project && state.studio.project.phase < 3; i++) {
    state = resolve(state);
    if (!state.actionsLeft) state = act(state, {type:'endDay'});
    else state = act(state, {type:'develop',focus});
  }
  expect(state.studio.project?.phase).toBe(3);
  return resolve(state);
};

describe('product tycoon loop', () => {
  it('freelance work lets a cash-starved studio recover without minting money after the daily budget', () => {
    const state = createInitialState('recovery',gameContent);
    state.company.cashCents = 0;
    const recovered = act(state,{type:'freelance'});
    expect(recovered.company.cashCents).toBe(B.freelanceReward);
    expect(recovered.actionsLeft).toBe(state.actionsLeft-1);
    expect(recovered.player.energy).toBe(state.player.energy-B.freelanceEnergy);
    expect(act(recovered,{type:'startProject',kind:'website',name:'De volta',audience:'local'}).studio.project).not.toBeNull();
    recovered.actionsLeft = 0;
    expect(act(recovered,{type:'freelance'})).toEqual(recovered);
  });
  it('starts small and invests once to start a product, without mutating its input', () => {
    const state = createInitialState('start',gameContent);
    const before = structuredClone(state);
    const next = act(state,{type:'startProject',kind:'website',name:'Meu site',audience:'local'});
    expect(state).toEqual(before);
    expect(next.company.cashCents).toBe(state.company.cashCents-15000);
    expect(next.studio.project).toMatchObject({name:'Meu site',phase:0,progress:0});
    expect(act(next,{type:'startProject',kind:'website',name:'Duplicado',audience:'local'})).toEqual(next);
  });

  it('requires actual releases to unlock more ambitious products', () => {
    const state = createInitialState('locked',gameContent);
    expect(act(state,{type:'startProject',kind:'saas',name:'Muito cedo',audience:'business'})).toEqual(state);
    state.studio.launched = 1;
    const app = act(state,{type:'startProject',kind:'app',name:'Meu app',audience:'creators'});
    expect(app.studio.project?.kind).toBe('app');
    state.company.cashCents = 0;
    expect(act(state,{type:'startProject',kind:'website',name:'Sem fundos',audience:'local'})).toEqual(state);
  });

  it('develops through three phases using the displayed estimate and daily action budget', () => {
    const state = createProject();
    const estimate = getDevelopmentGain(state,'balanced');
    const next = act(state,{type:'develop',focus:'balanced'});
    expect(next.studio.project!.progress).toBe(estimate);
    expect(next.player.energy).toBe(state.player.energy-B.energyCost);
    expect(next.actionsLeft).toBe(state.actionsLeft-1);
    next.actionsLeft = 0;
    expect(act(next,{type:'develop',focus:'balanced'})).toEqual(next);
    const done = complete(state);
    expect(act(done,{type:'develop',focus:'balanced'})).toEqual(done);
  });

  it('speed adds risk, quality adds value and testing removes bugs', () => {
    const state = createProject();
    const speed = act(state,{type:'develop',focus:'speed'});
    const quality = act(state,{type:'develop',focus:'quality'});
    expect(speed.studio.project!.progress).toBeGreaterThan(quality.studio.project!.progress);
    expect(speed.studio.project!.bugs).toBe(2);
    expect(quality.studio.project!.quality).toBeGreaterThan(speed.studio.project!.quality);
    state.studio.project!.phase = 2;
    state.studio.project!.bugs = 4;
    expect(act(state,{type:'develop',focus:'balanced'}).studio.project!.bugs).toBe(2);
  });

  it('launches once, awards sales, fans, recurring revenue and research and saves the result', () => {
    const state = complete(createProject());
    const preview = getReleasePreview(state)!;
    const launched = act(state,{type:'launchProduct'});
    expect(launched.studio.launched).toBe(1);
    expect(launched.studio.project).toBeNull();
    expect(launched.studio.fans).toBe(preview.fans);
    expect(launched.studio.research).toBe(B.researchPerRelease);
    expect(launched.company.cashCents).toBe(state.company.cashCents+preview.revenueCents);
    expect(launched.company.revenueCents).toBe(state.company.revenueCents+preview.monthlyCents);
    expect(launched.studio.releases[0]).toMatchObject({name:'Primeira ideia',score:preview.score});
    expect(act(launched,{type:'launchProduct'})).toEqual(launched);
    expect(deserializeSave(serializeSave(launched))).toEqual({ok:true,state:launched});
  });

  it('does not launch unfinished products; matching audience helps market performance', () => {
    const state = createProject();
    expect(act(state,{type:'launchProduct'})).toEqual(state);
    state.studio.project!.audience = 'business';
    const business = getReleasePreview(state)!;
    state.studio.project!.audience = 'local';
    const local = getReleasePreview(state)!;
    expect(local.revenueCents).toBeGreaterThan(business.revenueCents);
  });

  it('hardware consumes money, improves speed, caps at three upgrades, office requires milestones', () => {
    const state = createProject();
    const next = act(state,{type:'upgradeStudio',upgrade:'hardware'});
    expect(next.studio.hardware).toBe(1);
    expect(next.company.cashCents).toBe(state.company.cashCents-B.hardwarePrices[0]);
    expect(getDevelopmentGain(next,'balanced')).toBeGreaterThan(getDevelopmentGain(state,'balanced'));
    state.company.cashCents = 10000000;
    expect(act(state,{type:'upgradeStudio',upgrade:'office'})).toEqual(state);
    state.studio.launched = 3;
    const office = act(state,{type:'upgradeStudio',upgrade:'office'});
    expect(office.studio.office).toBe(1);
    expect(office.company.cashCents).toBe(state.company.cashCents-B.officePrices[0]);
    state.studio.hardware = 3;
    expect(act(state,{type:'upgradeStudio',upgrade:'hardware'})).toEqual(state);
  });

  it('research requires earned points and a block and improves release evaluation', () => {
    const state = createProject();
    expect(act(state,{type:'researchTechnology'})).toEqual(state);
    state.studio.research = 12;
    const researched = act(state,{type:'researchTechnology'});
    expect(researched.studio.technology).toBe(1);
    expect(researched.studio.research).toBe(0);
    expect(researched.actionsLeft).toBe(1);
    expect(getReleasePreview(researched)!.score).toBeGreaterThanOrEqual(getReleasePreview(state)!.score);
  });

  it('migrates real v3 saves while preserving the old career and money', () => {
    const state = createInitialState('v3',gameContent);
    state.company.cashCents = 5000000;
    state.company.cloudCostCents = 4000000;
    state.company.revenueCents = 18000000;
    const raw = JSON.parse(serializeSave(state));
    raw.version = 3;
    delete raw.state.studio;
    const loaded = deserializeSave(JSON.stringify(raw));
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.state.studio.launched).toBe(0);
    expect(loaded.state.company).toEqual(state.company);
    expect(loaded.state.player).toEqual(state.player);
    raw.version = 4;
    raw.state.studio = {...state.studio,hardware:99};
    expect(deserializeSave(JSON.stringify(raw))).toEqual({ok:false,reason:'invalid-shape'});
  });

  it('replays the studio career identically and can grow out of the garage', () => {
    const run = () => {
      let state = createInitialState('growth',gameContent);
      for (let product = 0; product < 8; product++) {
        state = resolve(state);
        state = act(state,{type:'startProject',kind:product>=4?'saas':product>=1?'app':'website',name:`Produto ${product+1}`,audience:product>=4?'business':'local'});
        state = complete(state);
        state = act(state,{type:'launchProduct'});
        if (product===0) state = act(state,{type:'upgradeStudio',upgrade:'hardware'});
        if (state.studio.research>=12 && state.actionsLeft>0) state=act(state,{type:'researchTechnology'});
        if (state.studio.launched>=3 && state.company.cashCents>=B.officePrices[0] && state.studio.office===0) state=act(state,{type:'upgradeStudio',upgrade:'office'});
        if (state.studio.launched>=7 && state.company.cashCents>=B.officePrices[1] && state.studio.office===1) state=act(state,{type:'upgradeStudio',upgrade:'office'});
      }
      return state;
    };
    const state = run();
    expect(state.studio.launched).toBe(8);
    expect(state.studio.office).toBe(2);
    expect(state.studio.fans).toBeGreaterThan(100);
    expect(state.company.cashCents).toBeGreaterThan(0);
    expect(state).toEqual(run());
  });
});
