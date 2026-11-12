import { describe, expect, it } from 'vitest';
import { gameContent } from '../src/data/content';
import { applyAction, CAREER_BALANCE as B, createInitialState, deserializeSave, getPlanPoints, getReviewStatus, getTeamCapacity, serializeSave } from '../src/engine';
import type { GameState, PlayerAction } from '../src/engine';

const act=(state:GameState,action:PlayerAction)=>applyAction(state,action,gameContent).state;
const resolve=(state:GameState)=>{
 const event=gameContent.events.find(item=>item.id===state.pendingEventId);
 return event?act(state,{type:'chooseEvent',choiceId:event.choices[0]!.id}):state;
};
const qualified=()=>{
 const state=createInitialState('qualified',gameContent);
 state.player.skills={code:100,infra:100,architecture:100,softSkills:100};
 state.player.tasksDelivered=30;
 state.player.reputation={boss:80,team:80,po:80};
 state.company.techDebt=20;state.company.prodBugs=0;
 return state;
};
const leader=()=>{
 const state=qualified();state.levelId='tech_lead';state.actionsLeft=1;state.company.teamMorale=90;
 state.career.team.forEach(member=>member.morale=90);
 state.career.nextReviewDay=1000;
 return state;
};

describe('developer career from the original guide',()=>{
 it('records different task approaches and their asymmetric tradeoffs without changing input',()=>{
  const state=createInitialState('approaches',gameContent);
  const before=structuredClone(state);
  const careful=act(state,{type:'work',approach:'careful'});
  const rushed=act(state,{type:'work',approach:'rush'});
  const helped=act(state,{type:'work',approach:'help'});
  expect(state).toEqual(before);
  expect(rushed.backlog[0]!.progress).toBeGreaterThan(careful.backlog[0]!.progress);
  expect(rushed.company.techDebt).toBeGreaterThan(careful.company.techDebt);
  expect(rushed.company.prodBugs).toBe(careful.company.prodBugs);
  expect(helped.player.reputation.team).toBe(state.player.reputation.team-3);
  const skill=gameContent.tasks.find(task=>task.id===state.backlog[0]!.taskId)!.skill;
  expect(helped.player.skills[skill]).toBeGreaterThan(careful.player.skills[skill]);
  expect(rushed.career.consequences[0]!.kind).toBe('rush');
  expect(rushed.career.decisions[0]!.text).toContain('gambiarra');
  expect(rushed.career.consequences[0]!.dueDay).toBeGreaterThanOrEqual(state.day+B.consequenceMinDays);
 });
 it('negotiates a task deadline for a real cost and avoids duplicate delayed consequences for the same approach',()=>{
  const state=createInitialState('defer',gameContent);
  const task=state.backlog[0]!;
  const deferred=act(state,{type:'work',taskId:task.id,approach:'defer'});
  expect(deferred.backlog[0]!.dueDay).toBe(task.dueDay+10);
  expect(deferred.backlog[0]!.difficulty).toBe(task.difficulty+1);
  expect(deferred.player.reputation.po).toBe(state.player.reputation.po-4);
  expect(deferred.actionsLeft).toBe(1);
  const again=act(deferred,{type:'work',taskId:task.id,approach:'defer'});
  expect(again.career.consequences.length).toBe(1);
 });
 it('settles a delayed incident with a message referencing its original choice and saves the queue',()=>{
  let state=act(createInitialState('delayed',gameContent),{type:'work',approach:'rush'});
  const due=state.career.consequences[0]!;
  expect(deserializeSave(serializeSave(state))).toEqual({ok:true,state});
  state.day=due.dueDay-1;state.company.techDebt=100;state.player.stress=0;
  const next=act(state,{type:'endDay'});
  expect(next.career.consequences).toHaveLength(0);
  expect(next.career.decisions[0]!.result).toContain(due.title);
  expect(next.career.decisions[0]!.result).toContain('atalho voltou');
  expect(next.player.incidentsCaused).toBeGreaterThan(state.player.incidentsCaused);
  const after=resolve(next);
  expect(act(after,{type:'endDay'}).career.decisions[0]!.result).toBe(next.career.decisions[0]!.result);
 });
 it('runs an automatic review after eight weeks and changes salary and responsibilities',()=>{
  const state=qualified();
  expect(act(state,{type:'promote'}).levelId).toBe('intern');
  state.day=39;
  const promoted=act(state,{type:'endDay'});
  expect(promoted.levelId).toBe('junior');
  expect(promoted.player.salaryCents).toBe(350000);
  expect(promoted.career.lastReview).toMatchObject({day:40,outcome:'promoted',from:'intern',to:'junior'});
  expect(promoted.career.nextReviewDay).toBe(80);
  expect(act(promoted,{type:'promote'}).levelId).toBe('junior');
 });
 it('blocks promotion for low trust and gives specific feedback instead of granting a cosmetic level',()=>{
  const state=qualified();state.career.nextReviewDay=1;state.player.reputation.team=20;
  expect(getReviewStatus(state,gameContent).reasons.join(' ')).toContain('confiança');
  const reviewed=act(state,{type:'promote'});
  expect(reviewed.levelId).toBe('intern');
  expect(reviewed.career.lastReview?.outcome).toBe('maintained');
  expect(reviewed.career.lastReview?.reasons.join(' ')).toContain('confiança');
  state.levelId='senior';state.company.techDebt=80;
  expect(getReviewStatus(state,gameContent).reasons.join(' ')).toContain('dívida');
 });
 it('a Tech Lead plans once per day and the team advances without the player coding each task',()=>{
  const state=leader();const ids=state.backlog.slice(0,2).map(task=>task.id);
  const planned=act(state,{type:'planSprint',taskIds:ids,policy:'balanced'});
  expect(planned.actionsLeft).toBe(0);
  expect(planned.career.plan).toEqual(ids);
  const unchanged=act(planned,{type:'supportTeam'});
  expect(unchanged.career.team).toEqual(planned.career.team);
  const next=act(planned,{type:'endDay'});
  expect(next.backlog[0]!.progress).toBeGreaterThan(state.backlog[0]!.progress);
  expect(next.actionsLeft).toBe(1);
  expect(state.backlog[0]!.progress).toBe(0);
 });
 it('overcommitment and rushing trade team morale for throughput',()=>{
  const state=leader();state.career.team.forEach(member=>member.morale=25);state.company.teamMorale=25;
  const ids=state.backlog.map(task=>task.id);
  const overloaded=act(state,{type:'planSprint',taskIds:ids,policy:'push'});
  expect(getPlanPoints(overloaded)).toBeGreaterThan(getTeamCapacity(overloaded));
  const next=act(overloaded,{type:'endDay'});
  expect(next.career.team[0]!.morale).toBeLessThan(state.career.team[0]!.morale);
  expect(next.company.techDebt).toBeGreaterThan(state.company.techDebt);
  const supported=act(state,{type:'supportTeam'});
  expect(supported.career.team[0]!.morale).toBeGreaterThan(state.career.team[0]!.morale);
 });
 it('records architecture decisions once and applies their cloud consequence later',()=>{
  const state=leader();state.company.cloudCostCents=100000;
  const next=act(state,{type:'architectureDecision',choice:'modular'});
  expect(next.career.architecture).toBe('modular');
  expect(next.company.cashCents).toBe(state.company.cashCents-B.architectureCost);
  expect(next.company.techDebt).toBe(state.company.techDebt-10);
  next.actionsLeft=1;
  expect(act(next,{type:'architectureDecision',choice:'services'}).career.architecture).toBe('modular');
  next.day=10;
  const settled=act(next,{type:'endDay'});
  expect(settled.career.consequences).toHaveLength(0);
  expect(settled.career.decisions[0]!.result).toContain('cloud');
  expect(settled.company.cloudCostCents).toBeLessThan(next.company.cloudCostCents);
 });
 it('can play three complete leadership sprints with actual deliveries and team reactions',()=>{
  let state=leader();
  for(let day=0;day<30;day++){
   state=resolve(state);
   const pending=state.backlog.filter(task=>task.column!=='production');
   const stillPlanned=pending.some(task=>state.career.plan.includes(task.id));
   if(!stillPlanned&&pending.length){
    let total=0;const ids:number[]=[];
    for(const task of [...pending].sort((a,b)=>a.difficulty-b.difficulty)){if(total+task.difficulty<=getTeamCapacity(state)){ids.push(task.id);total+=task.difficulty;}}
    if(!ids.length)ids.push(pending[0]!.id);
    state=act(state,{type:'planSprint',taskIds:ids,policy:'balanced'});
   }else if(state.company.prodBugs>0)state=act(state,{type:'fix'});
   else state=act(state,{type:'supportTeam'});
   state=act(state,{type:'endDay'});
  }
  expect(state.day).toBe(31);
  expect(state.player.tasksDelivered).toBeGreaterThan(30);
  expect(state.career.decisions.some(item=>item.kind==='planning')).toBe(true);
  expect(state.career.team[0]!.morale).not.toBe(90);
  expect(deserializeSave(serializeSave(state))).toEqual({ok:true,state});
 });
 it('supports the six distinct career endings and freezes a concluded career',()=>{
  for(const healthy of [true,false]){
   const state=leader();state.levelId='architect';state.day=21;state.career.architectSinceDay=1;state.career.architecture='modular';
   state.company.techDebt=healthy?20:90;state.career.architectDeliveries=6;
   const ended=act(state,{type:'concludeCareer'});
   expect(ended.career.ending?.type).toBe(healthy?'healthy':'powerpoint');
   expect(act(ended,{type:'endDay'})).toEqual(ended);
  }
  const burnout=qualified();burnout.player.stress=99;
  expect(act(burnout,{type:'study',skill:'code'}).career.ending?.type).toBe('burnout');
  let dismissed=createInitialState('warnings',gameContent);dismissed.career.nextReviewDay=1;dismissed.player.reputation.team=20;
  dismissed=act(dismissed,{type:'promote'});
  expect(dismissed.career.warnings).toBe(1);
  dismissed.day=dismissed.career.nextReviewDay;
  dismissed=act(dismissed,{type:'promote'});
  expect(dismissed.career.ending?.type).toBe('dismissed');
  let bankrupt=qualified();bankrupt.company.cashCents=0;bankrupt.company.revenueCents=0;
  for(let i=0;i<5;i++)bankrupt=act(resolve(bankrupt),{type:'endDay'});
  expect(bankrupt.career.ending?.type).toBe('bankrupt');
  const startup=qualified();startup.levelId='senior';
  expect(act(startup,{type:'leaveForStartup'}).career.ending?.type).toBe('startup');
 });
 it('requires time and an ADR before concluding the architect proof',()=>{
  const state=leader();state.levelId='architect';state.career.architectSinceDay=1;
  expect(act(state,{type:'concludeCareer'}).career.ending).toBeNull();
  state.day=21;
  expect(act(state,{type:'concludeCareer'}).career.ending).toBeNull();
  state.career.architecture='modular';
  expect(act(state,{type:'concludeCareer'}).career.ending).toBeNull();
  state.career.architectDeliveries=6;
  expect(act(state,{type:'concludeCareer'}).career.ending?.type).toBe('healthy');
 });
 it('honors event cooldowns and retains career data when loading a v4 save',()=>{
  let state=createInitialState('cooldown',gameContent);state.day=2;
  state=act(state,{type:'endDay'});
  const eventId=state.pendingEventId!;
  state=resolve(state);state.day=5;
  const next=act(state,{type:'endDay'});
  expect(next.pendingEventId).not.toBe(eventId);
  const raw=JSON.parse(serializeSave(state));raw.version=4;delete raw.state.career;
  const loaded=deserializeSave(JSON.stringify(raw));
  expect(loaded.ok).toBe(true);
  if(!loaded.ok)return;
  expect(loaded.state.levelId).toBe(state.levelId);
  expect(loaded.state.player).toEqual(state.player);
  expect(loaded.state.career.enabled).toBe(true);
 });
 it('lets a leader cancel an overloaded plan and recover instead of locking the team in exhaustion',()=>{
  const state=leader();state.career.plan=state.backlog.map(task=>task.id);
  state.career.team.forEach(member=>member.morale=5);state.company.teamMorale=5;
  const cancelled=act(state,{type:'planSprint',taskIds:[],policy:'protect'});
  expect(cancelled.career.plan).toEqual([]);
  expect(cancelled.actionsLeft).toBe(0);
  const rested=act(cancelled,{type:'endDay'});
  expect(rested.company.teamMorale).toBeGreaterThan(5);
 });
 it('keeps the old studio commands out of the developer career and safely converts the studio economy',()=>{
  const state=createInitialState('no-owner-loop',gameContent);
  expect(act(state,{type:'startProject',kind:'website',name:'Não é o foco',audience:'local'})).toEqual(state);
  state.levelId='architect';state.company.cloudCostCents=12000;state.company.cashCents=10000;
  const raw=JSON.parse(serializeSave(state));raw.version=4;delete raw.state.career;
  const loaded=deserializeSave(JSON.stringify(raw));
  expect(loaded.ok).toBe(true);
  if(!loaded.ok)return;
  expect(loaded.state.career.architectSinceDay).toBe(state.day);
  expect(loaded.state.company.cashCents).toBeGreaterThan(state.company.cashCents);
  expect(loaded.state.player).toEqual(state.player);
 });
});
