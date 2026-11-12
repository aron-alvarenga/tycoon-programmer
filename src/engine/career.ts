import { careerLines as lines } from '../data/career';
import { CAREER_BALANCE as B, DEBT_EFFICIENCY_DIVISOR, MAX_LOG_ENTRIES, PRODUCTION_CAP, SALARIES_CENTS, WORK_SKILL_BASE } from './balance';
import { clampBugs, clampCents, clampCloud, clampProgress, clampStat, skillGain } from './formulas';
import { getCalendar } from './calendar';
import { getPromotion } from './progression';
import type { BacklogTask, GameContent, GameState, SkillId } from './types';
import type { createRng } from './rng';

export type TaskApproach = 'careful' | 'rush' | 'help' | 'defer';
export type CareerEnding = 'healthy' | 'powerpoint' | 'burnout' | 'dismissed' | 'bankrupt' | 'startup';
export interface CareerDecision {
  id: number; day: number; text: string; kind: string;
  dueDay: number | null; result: string | null;
}
export interface CareerConsequence { decisionId: number; dueDay: number; kind: 'rush'|'careful'|'help'|'defer'|'modular'|'services'; title: string }
export interface CareerReview { day: number; from: string; to: string; outcome: 'promoted'|'maintained'|'warning'; reasons: string[] }
export interface CareerTeamMember { id: number; title: string; proficiency: number; morale: number; trait: 'mentor'|'fast'|'careful'|'independent' }
export interface CareerState {
  enabled: boolean; name: string; xp: number; nextReviewDay: number;
  lastReview: CareerReview | null; warnings: number; lowEnergyDays: number; cashCrisisDays: number;
  decisions: CareerDecision[]; consequences: CareerConsequence[]; nextDecisionId: number;
  team: CareerTeamMember[]; plan: number[]; policy: 'protect'|'balanced'|'push';
  architecture: 'modular'|'services'|null; architectSinceDay: number | null;
  architectDeliveries: number;
  ending: { type: CareerEnding; day: number } | null;
}
export type CareerAction =
  | { type: 'planSprint'; taskIds: number[]; policy: 'protect'|'balanced'|'push' }
  | { type: 'supportTeam' }
  | { type: 'architectureDecision'; choice: 'modular'|'services' }
  | { type: 'concludeCareer' }
  | { type: 'leaveForStartup' };

export const createCareer = (day=1): CareerState => ({
  enabled:true,name:'Dev em formação',xp:0,nextReviewDay:day+B.reviewDays-1,
  lastReview:null,warnings:0,lowEnergyDays:0,cashCrisisDays:0,decisions:[],consequences:[],nextDecisionId:1,
  team:[
    {id:1,title:'Dev Júnior',proficiency:35,morale:65,trait:'mentor'},
    {id:2,title:'Dev Pleno',proficiency:55,morale:60,trait:'fast'},
    {id:3,title:'Dev Sênior',proficiency:75,morale:65,trait:'careful'},
    {id:4,title:'Especialista',proficiency:65,morale:55,trait:'independent'},
  ],plan:[],policy:'balanced',architecture:null,architectSinceDay:null,architectDeliveries:0,ending:null,
});
export const isLeadership = (state: GameState) => state.levelId==='tech_lead'||state.levelId==='architect';
export const careerLine = (key: keyof typeof lines, vars: Record<string,string|number>={}) => {
  let text: string=lines[key];
  for(const [name,value] of Object.entries(vars))text=text.replaceAll(`{${name}}`,String(value));
  return text;
};
export const careerLog = (state: GameState,text: string) => {
  state.log.unshift({id:state.nextLogId++,day:state.day,author:'Carreira',channel:'#sua-história',text});
  state.log=state.log.slice(0,MAX_LOG_ENTRIES);
};
export const recordCareerDecision = (state: GameState, kind:string, text:string, dueDay:number|null=null, result:string|null=null) => {
  const id=state.career.nextDecisionId++;
  state.career.decisions.unshift({id,day:state.day,text,kind,dueDay,result});
  state.career.decisions=state.career.decisions.slice(0,B.decisionCap);
  return id;
};
export const recordTaskApproach = (state:GameState, task:BacklogTask, title:string, approach:TaskApproach,rng:ReturnType<typeof createRng>) => {
  const previous=state.career.decisions.find(item=>item.kind===`task:${task.id}:${approach}`);
  if(previous)return;
  const delay=approach==='rush'?rng.int(B.consequenceMinDays,B.consequenceMaxDays):B.consequenceMinDays;
  const dueDay=state.day+delay;
  const key=approach==='rush'?'rushDecision':approach==='careful'?'carefulDecision':approach==='help'?'helpDecision':'deferDecision';
  const id=recordCareerDecision(state,`task:${task.id}:${approach}`,careerLine(key,{title}),dueDay);
  state.career.consequences.push({decisionId:id,dueDay,kind:approach,title});
};

export const getReviewStatus = (state:GameState,content:GameContent) => {
  const promotion=getPromotion(state,content);
  const reasons:string[]=[];
  if(!promotion.requirements.every(req=>req.value>=req.target))reasons.push(careerLine('reasonSkills'));
  if(state.player.tasksDelivered<promotion.deliveries)reasons.push(careerLine('reasonDelivery'));
  if(Object.values(state.player.reputation).some(value=>value<B.reputationMin))reasons.push(careerLine('reasonReputation'));
  const incidentLimit=promotion.current?.order===0?B.initialIncidentRateMax:B.incidentRateMax;
  if(state.player.incidentsCaused/Math.max(1,state.player.tasksDelivered)>incidentLimit)reasons.push(careerLine('reasonIncidents'));
  if((promotion.next?.order??0)>=4&&state.company.techDebt>B.leaderDebtMax)reasons.push(careerLine('reasonDebt'));
  return {...promotion,reasons,windowOpen:state.day>=state.career.nextReviewDay,ready:!!promotion.next&&reasons.length===0&&state.day>=state.career.nextReviewDay};
};
export const evaluateCareer = (state:GameState,content:GameContent) => {
  const status=getReviewStatus(state,content);
  if(!status.windowOpen||!status.next)return;
  const from=state.levelId;
  const outcome=status.ready?'promoted':status.reasons.length>=3?'warning':'maintained';
  if(status.ready){
    state.levelId=status.next!.levelId;
    state.player.salaryCents=SALARIES_CENTS[status.next!.order]??state.player.salaryCents;
    state.career.warnings=0;
    if(isLeadership(state))state.actionsLeft=Math.min(state.actionsLeft,B.leadershipActions);
    if(state.levelId==='architect'){state.career.architectSinceDay=state.day;state.career.architectDeliveries=0;}
  }else if(outcome==='warning')state.career.warnings++;
  state.career.lastReview={day:state.day,from,to:state.levelId,outcome,reasons:status.reasons};
  state.career.nextReviewDay=state.day+B.reviewDays;
  careerLog(state,careerLine(status.ready?'reviewPromoted':outcome==='warning'?'reviewWarning':'reviewMaintain'));
  if(state.career.warnings>=2)state.career.ending={type:'dismissed',day:state.day};
};

export const getTeamCapacity=(state:GameState)=>Math.round(B.teamTargetPoints*state.career.team.reduce((sum,member)=>sum+member.morale,0)/state.career.team.length/B.teamMoraleDivisor*10)/10;
export const getPlanPoints=(state:GameState,ids:readonly number[]=state.career.plan)=>state.backlog.filter(task=>ids.includes(task.id)&&task.column!=='production').reduce((sum,task)=>sum+task.difficulty,0);

export const applyCareerAction=(state:GameState,action:CareerAction,content:GameContent)=>{
  if(action.type==='concludeCareer'){
    if(state.levelId!=='architect'||state.career.architectSinceDay===null||state.day-state.career.architectSinceDay<B.architectProofDays||!state.career.architecture||state.career.architectDeliveries<B.architectProofDeliveries)return;
    const healthy=state.company.techDebt<=B.healthyDebt&&state.company.prodBugs<=B.healthyBugs&&state.company.teamMorale>=B.healthyMorale&&state.company.cashCents>0;
    state.career.ending={type:healthy?'healthy':'powerpoint',day:state.day};
    return;
  }
  if(action.type==='leaveForStartup'){
    const order=content.promotions.find(level=>level.levelId===state.levelId)?.order??0;
    if(order>=B.startupLevel&&state.player.integrity>=B.startupIntegrity)state.career.ending={type:'startup',day:state.day};
    return;
  }
  if(!isLeadership(state)||state.actionsLeft<=0)return;
  if(action.type==='planSprint'){
    if(!['protect','balanced','push'].includes(action.policy))return;
    const valid=state.backlog.filter(task=>action.taskIds.includes(task.id)&&task.column!=='production').map(task=>task.id);
    if(!valid.length&&(action.taskIds.length>0||!state.career.plan.length))return;
    state.actionsLeft--;
    state.career.plan=valid;
    state.career.policy=action.policy;
    recordCareerDecision(state,'planning',careerLine('planDecision',{count:valid.length,policy:action.policy}),null,careerLine(action.policy==='push'?'pushDecision':'protectDecision'));
  }else if(action.type==='supportTeam'){
    state.actionsLeft--;
    state.player.skills.softSkills=clampStat(state.player.skills.softSkills+skillGain(state.player.skills.softSkills,WORK_SKILL_BASE));
    state.player.reputation.team=clampStat(state.player.reputation.team+B.teamSupportMorale);
    for(const member of state.career.team)member.morale=clampStat(member.morale+B.teamSupportMorale);
    state.company.teamMorale=clampStat(state.company.teamMorale+B.teamSupportMorale);
    state.career.xp+=B.xpHelp;
  }else if(action.type==='architectureDecision'){
    if(state.career.architecture||state.company.cashCents<B.architectureCost||!['modular','services'].includes(action.choice))return;
    state.actionsLeft--;
    state.company.cashCents-=B.architectureCost;
    state.career.architecture=action.choice;
    const dueDay=state.day+B.architectureDelay;
    const id=recordCareerDecision(state,'architecture',careerLine(action.choice==='modular'?'architectureModular':'architectureServices'),dueDay);
    state.career.consequences.push({decisionId:id,dueDay,kind:action.choice,title:action.choice});
    state.company.techDebt=clampStat(state.company.techDebt+(action.choice==='modular'?B.modularDebt:B.servicesDebt));
  }
};

const settleConsequences=(state:GameState,rng:ReturnType<typeof createRng>)=>{
  const due=state.career.consequences.filter(item=>item.dueDay<=state.day);
  state.career.consequences=state.career.consequences.filter(item=>item.dueDay>state.day);
  for(const effect of due){
    let result='';
    if(effect.kind==='rush'){
      const incident=rng.chance(state.company.techDebt/B.debtRiskDivisor);
      if(incident){state.company.prodBugs=clampBugs(state.company.prodBugs+B.consequenceBugs);state.player.stress=clampStat(state.player.stress+B.consequenceStress);state.company.customerSatisfaction=clampStat(state.company.customerSatisfaction+B.consequenceSatisfaction);state.player.incidentsCaused++;}
      result=careerLine(incident?'rushConsequence':'rushAvoided',{title:effect.title});
    }else if(effect.kind==='careful'){
      state.company.techDebt=clampStat(state.company.techDebt+B.carefulDebt);
      result=careerLine('carefulConsequence',{title:effect.title});
    }else if(effect.kind==='help'){
      state.player.reputation.team=clampStat(state.player.reputation.team-B.helpReputation);
      result=careerLine('helpConsequence',{title:effect.title});
    }else if(effect.kind==='defer'){
      state.player.reputation.po=clampStat(state.player.reputation.po+B.deferPo);
      result=careerLine('deferConsequence',{title:effect.title});
    }else{
      state.company.cloudCostCents=clampCloud(state.company.cloudCostCents*(1+(effect.kind==='modular'?B.modularCloud:B.servicesCloud)));
      result=careerLine('architectureConsequence');
    }
    const decision=state.career.decisions.find(item=>item.id===effect.decisionId);
    if(decision)decision.result=result;
    careerLog(state,result);
  }
};
export const runLeadershipDay=(state:GameState,content:GameContent)=>{
  if(!isLeadership(state)||!state.career.enabled)return;
  const tasks=state.backlog.filter(task=>state.career.plan.includes(task.id)&&task.column!=='production');
  if(!tasks.length){
    for(const member of state.career.team)member.morale=clampStat(member.morale+B.teamNormalMorale);
    state.company.teamMorale=clampStat(state.career.team.reduce((sum,m)=>sum+m.morale,0)/state.career.team.length);
    return;
  }
  const overload=getPlanPoints(state)>getTeamCapacity(state);
  const speed=state.career.policy==='push'?B.teamPressureSpeed:state.career.policy==='protect'?B.teamProtectSpeed:1;
  const expertise=state.career.team.reduce((sum,m)=>sum+m.proficiency,0)/state.career.team.length/B.teamMoraleDivisor;
  const fast=state.career.team.some(m=>m.trait==='fast')?B.teamFastTraitSpeed:1;
  const safe=state.career.team.some(m=>m.trait==='careful')&&state.career.policy==='protect';
  let budget=B.teamBaseProgress*speed*(state.company.teamMorale/B.teamMoraleDivisor)*(1-state.company.techDebt/DEBT_EFFICIENCY_DIVISOR)*(1+expertise)*fast*(state.career.architecture==='services'?B.architectureCapacity:1);
  for(const task of tasks){
    const needed=(100-task.progress)*task.difficulty;
    const spent=Math.min(needed,budget);
    task.progress=clampProgress(task.progress+spent/task.difficulty);
    budget-=spent;
    task.column='doing';
    if(task.progress>=100){
      task.column='production';state.sprintDelivered++;state.player.tasksDelivered++;state.career.xp+=B.xpDelivery;
      if(state.levelId==='architect')state.career.architectDeliveries++;
      state.player.reputation.po=clampStat(state.player.reputation.po+B.teamDeliveryPo);
      state.company.techDebt=clampStat(state.company.techDebt+(safe?B.teamSafeDebt:B.teamDeliveryDebt));
      const title=content.tasks.find(def=>def.id===task.taskId)?.title??task.taskId;
      careerLog(state,careerLine('teamDelivered',{title}));
    }
    if(budget<=0)break;
  }
  for(const member of state.career.team){
    const delta=overload||state.career.policy==='push'?B.teamOverloadMorale:B.teamNormalMorale;
    member.morale=clampStat(member.morale+delta+(member.trait==='mentor'?B.teamMentorMorale:0));
  }
  state.company.teamMorale=clampStat(state.career.team.reduce((sum,m)=>sum+m.morale,0)/state.career.team.length);
  if(overload||state.career.policy==='push')state.company.techDebt=clampStat(state.company.techDebt+B.teamOverloadDebt);
  const shipped=state.backlog.filter(task=>task.column==='production');
  if(shipped.length>PRODUCTION_CAP){const remove=new Set(shipped.slice(0,shipped.length-PRODUCTION_CAP).map(task=>task.id));state.backlog=state.backlog.filter(task=>!remove.has(task.id));}
};
export const advanceCareerDay=(state:GameState,rng:ReturnType<typeof createRng>)=>{
  if(!state.career.enabled)return;
  settleConsequences(state,rng);
  state.career.cashCrisisDays=state.company.cashCents===0?state.career.cashCrisisDays+1:0;
  if(state.player.stress>=100||state.career.lowEnergyDays>=B.burnoutDays)state.career.ending={type:'burnout',day:state.day};
  else if(state.player.reputation.boss===0)state.career.ending={type:'dismissed',day:state.day};
  else if(state.career.cashCrisisDays>=B.crisisDays)state.career.ending={type:'bankrupt',day:state.day};
  if(isLeadership(state))state.actionsLeft=B.leadershipActions;
  if(getCalendar(state.day).weekday===1)state.career.plan=state.career.plan.filter(id=>state.backlog.some(task=>task.id===id&&task.column!=='production'));
};
export const ENDING_TEXT:Record<CareerEnding,keyof typeof lines>={healthy:'endingHealthy',powerpoint:'endingPowerpoint',burnout:'endingBurnout',dismissed:'endingDismissed',bankrupt:'endingBankrupt',startup:'endingStartup'};
export const getTaskApproachProgress=(base:number,approach:TaskApproach)=>Math.max(1,Math.round(base*(approach==='careful'?B.carefulSpeed:approach==='help'?B.helpSpeed:1)));
export const getCareerSkillLabel=(skill:SkillId)=>({code:'Java e Spring',infra:'Docker e Cloud',architecture:'System Design',softSkills:'Soft Skills'}[skill]);
export const careerCompanyNet=(state:GameState)=>clampCents(state.company.revenueCents*state.company.customerSatisfaction/100)-state.company.cloudCostCents-state.player.salaryCents;
