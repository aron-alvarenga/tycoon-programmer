import { applyAction, createInitialState, getPlanPoints, getReviewStatus, getTeamCapacity, isLeadership } from '../src/engine';
import { gameContent } from '../src/data/content';
import type { GameState, PlayerAction } from '../src/engine';
export type Bot='Equilibrado'|'Gambiarreiro'|'Perfeccionista';
const act=(s:GameState,a:PlayerAction)=>applyAction(s,a,gameContent).state;
const resolve=(s:GameState,bot:Bot)=>{
 const event=gameContent.events.find(e=>e.id===s.pendingEventId);if(!event)return s;
 const score=(effects:Record<string,number>)=>Object.entries(effects).reduce((sum,[key,value])=>sum+value*({energy:.2,stress:-1,techDebt:bot==='Gambiarreiro'?.1:-1,prodBugs:-3,boss:2,team:2,po:1,integrity:.2}[key]??0),0);
 const choice=[...event.choices].sort((a,b)=>score(b.effects)-score(a.effects))[0]!;
 return act(s,{type:'chooseEvent',choiceId:choice.id});
};
const decide=(s:GameState,bot:Bot):PlayerAction=>{
 const tasks=s.backlog.filter(t=>t.column!=='production').sort((a,b)=>a.difficulty-b.difficulty);
 const missing=getReviewStatus(s,gameContent).requirements.find(r=>r.value<r.target);
 if(s.player.energy<30||s.player.stress>(bot==='Gambiarreiro'?85:65))return {type:'rest'};
 if(bot!=='Gambiarreiro'&&s.company.prodBugs>0)return {type:'fix'};
 if(bot!=='Gambiarreiro'&&s.company.techDebt>(bot==='Perfeccionista'?15:40))return {type:'refactor'};
 if(isLeadership(s)){
  if(!s.career.architecture)return {type:'architectureDecision',choice:bot==='Gambiarreiro'?'services':'modular'};
  if(s.company.teamMorale<60)return {type:'supportTeam'};
  if(!tasks.some(t=>s.career.plan.includes(t.id))&&tasks.length){
   const ids:number[]=[];let points=0;
   for(const task of tasks){if(bot==='Gambiarreiro'||points+task.difficulty<=getTeamCapacity(s)){ids.push(task.id);points+=task.difficulty;}}
   if(!ids.length)ids.push(tasks[0]!.id);
   return {type:'planSprint',taskIds:ids,policy:bot==='Gambiarreiro'?'push':bot==='Perfeccionista'?'protect':'balanced'};
  }
 }
 if(Math.min(...Object.values(s.player.reputation))<48&&bot!=='Gambiarreiro')return {type:'help'};
 if(missing&&(s.day%3===0||!tasks.length))return {type:'study',skill:missing.skill};
 if(tasks.length&&!isLeadership(s))return {type:'work',taskId:tasks[0]!.id,approach:bot==='Gambiarreiro'?'rush':'careful'};
 if(missing)return {type:'study',skill:missing.skill};
 if(isLeadership(s)&&getPlanPoints(s)>0)return {type:'supportTeam'};
 return {type:'help'};
};
export function runCareer(bot:Bot,seed:string,maxDays:number){
 let state=createInitialState(seed,gameContent);
 const promotions:Record<string,number>={intern:1};
 while(state.day<=maxDays&&!state.career.ending){
  state=resolve(state,bot);
  if(state.levelId==='architect'&&state.career.architectSinceDay!==null&&state.day-state.career.architectSinceDay>=20&&state.career.architecture&&state.career.architectDeliveries>=6){state=act(state,{type:'concludeCareer'});break;}
  let attempts=0;
  while(state.actionsLeft>0&&!state.career.ending&&attempts++<3)state=act(state,decide(state,bot));
  if(!state.career.ending)state=act(state,{type:'endDay'});
  if(!(state.levelId in promotions))promotions[state.levelId]=state.day;
 }
 return {ending:state.career.ending?.type??'incompleta',day:state.day,level:state.levelId,review:state.career.lastReview,reputation:state.player.reputation,debt:state.company.techDebt,incidents:state.player.incidentsCaused,promotions};
}
