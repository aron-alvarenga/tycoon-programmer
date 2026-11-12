import { PRODUCT_KINDS, STUDIO_BALANCE as B, STUDIO_LINES } from '../data/studio';
import type { GameState, SkillId } from './types';
import { clampBugs, clampStat, skillGain, workEfficiency } from './formulas';

export type ProductKind = typeof PRODUCT_KINDS[number]['id'];
export type Audience = 'local' | 'creators' | 'business';
export type DevelopmentFocus = 'balanced' | 'speed' | 'quality';
export interface StudioProject {
  name: string; kind: ProductKind; audience: Audience; phase: number;
  progress: number; quality: number; bugs: number;
}
export interface StudioRelease {
  id: number; name: string; kind: ProductKind; score: number; fans: number;
  revenueCents: number; monthlyCents: number; day: number;
}
export interface StudioState {
  name: string; hardware: number; office: number; technology: number;
  research: number; fans: number; launched: number;
  project: StudioProject | null; releases: StudioRelease[];
}
export type StudioAction =
  | { type: 'startProject'; kind: ProductKind; name: string; audience: Audience }
  | { type: 'develop'; focus: DevelopmentFocus }
  | { type: 'launchProduct' }
  | { type: 'upgradeStudio'; upgrade: 'hardware' | 'office' }
  | { type: 'researchTechnology' }
  | { type: 'freelance' };

export const createStudio = (): StudioState => ({
  name: 'Meu estúdio', hardware: 0, office: 0, technology: 0, research: 0,
  fans: 0, launched: 0, project: null, releases: [],
});
export const PROJECT_PHASES = ['Criar', 'Programar', 'Testar', 'Pronto para lançar'] as const;
export const OFFICE_NAMES = ['Garagem', 'Estúdio indie', 'Campus tech'] as const;

export const getDevelopmentGain = (state: GameState, focus: DevelopmentFocus): number => {
  const project = state.studio.project;
  const kind = PRODUCT_KINDS.find(item => item.id === project?.kind);
  if (!kind) return 0;
  const skill = project?.phase === 0 ? 'architecture' : project?.phase === 2 ? 'infra' : kind.skill;
  return Math.max(1, Math.round(B.development * workEfficiency(state.player.energy, state.player.stress, state.company.techDebt)
    * (1 + state.player.skills[skill] / B.skillSpeedDivisor) * (1 + state.studio.hardware * B.hardwareSpeed)
    * (focus === 'speed' ? B.focusSpeed : focus === 'quality' ? B.qualitySpeed : 1) / kind.effort));
};

export const getReleasePreview = (state: GameState) => {
  const project = state.studio.project;
  const kind = PRODUCT_KINDS.find(item => item.id === project?.kind);
  if (!project || !kind) return null;
  const score = Math.max(1, Math.min(10, Math.round((B.qualityBase + project.quality + state.studio.technology * B.technologyQuality
    + state.player.skills[kind.skill] / B.skillQualityDivisor - project.bugs * B.bugsPenalty) / 10)));
  const market = B.audienceMultipliers[project.audience];
  const fit = (project.kind === 'website' && project.audience === 'local') || ((project.kind === 'game' || project.kind === 'app') && project.audience === 'creators') || (project.kind === 'saas' && project.audience === 'business') ? B.audienceFitMultiplier : 1;
  return { score, fans: Math.round(score * B.fansPerScore * kind.effort * market * fit),
    revenueCents: Math.round(kind.reward * score / 10 * market * fit),
    monthlyCents: Math.round(kind.monthly * score / 10 * market * fit),
  };
};

const log = (state: GameState, key: keyof typeof STUDIO_LINES, vars: Record<string, string | number> = {}) => {
  let text: string = STUDIO_LINES[key];
  for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  state.log.unshift({id:state.nextLogId++,day:state.day,author:'Estúdio',channel:'#jornada',text});
  state.log = state.log.slice(0,40);
};

/** Mutates only the already-cloned state owned by applyAction. Invalid commands spend nothing. */
export const applyStudioAction = (state: GameState, action: StudioAction): void => {
  const studio = state.studio;
  if (action.type === 'startProject') {
    const kind = PRODUCT_KINDS.find(item => item.id === action.kind);
    if (!kind || studio.project || studio.launched < kind.unlock || state.company.cashCents < kind.cost
      || !['local','creators','business'].includes(action.audience)) return;
    state.company.cashCents -= kind.cost;
    studio.project = { name: action.name.trim().slice(0,40) || kind.name,kind:kind.id,audience:action.audience,phase:0,progress:0,quality:0,bugs:0 };
    log(state,'started',{name:studio.project.name});
  } else if (action.type === 'develop') {
    const project=studio.project;
    if (!project || project.phase >= 3 || state.actionsLeft <= 0 || !['balanced','speed','quality'].includes(action.focus)) return;
    const gain=getDevelopmentGain(state,action.focus);
    state.actionsLeft--;
    state.player.energy=clampStat(state.player.energy-B.energyCost);
    state.player.stress=clampStat(state.player.stress+B.stressCost);
    const kind=PRODUCT_KINDS.find(item=>item.id===project.kind)!;
    const skill: SkillId = project.phase===0?'architecture':project.phase===2?'infra':kind.skill;
    state.player.skills[skill]=clampStat(state.player.skills[skill]+skillGain(state.player.skills[skill],3));
    project.quality=Math.min(B.qualityMax, project.quality+B.qualityGain*(action.focus==='quality'?B.focusQuality:1));
    if(action.focus==='speed') project.bugs+=B.rushBugs;
    if(project.phase===2) project.bugs=Math.max(0,project.bugs-B.polishBugs);
    project.progress=Math.min(100,project.progress+gain);
    if(project.progress===100){project.phase++;project.progress=0;}
    log(state,'developed',{name:project.name});
  } else if(action.type==='launchProduct') {
    const project=studio.project;
    const result=getReleasePreview(state);
    if(!project || project.phase!==3 || !result) return;
    studio.launched++;
    studio.fans+=result.fans;
    studio.research+=B.researchPerRelease;
    studio.releases.unshift({id:studio.launched,name:project.name,kind:project.kind,...result,day:state.day});
    studio.releases=studio.releases.slice(0,B.releaseHistoryCap);
    state.company.cashCents+=result.revenueCents;
    state.company.revenueCents+=result.monthlyCents;
    state.company.prodBugs=clampBugs(state.company.prodBugs+project.bugs);
    state.company.techDebt=clampStat(state.company.techDebt+B.releaseDebt);
    state.player.tasksDelivered++;
    state.sprintDelivered++;
    log(state,'released',{name:project.name,score:result.score,fans:result.fans});
    studio.project=null;
  } else if(action.type==='upgradeStudio') {
    const level=action.upgrade==='hardware'?studio.hardware:studio.office;
    const price=action.upgrade==='hardware'?B.hardwarePrices[level]:B.officePrices[level];
    if(price===undefined || state.company.cashCents<price || (action.upgrade==='office' && studio.launched<(B.officeProducts[level]??Infinity))) return;
    state.company.cashCents-=price;
    if(action.upgrade==='hardware') {studio.hardware++;log(state,'hardware');}
    else {studio.office++;log(state,'office');}
  } else if(action.type==='freelance') {
    if(state.actionsLeft<=0) return;
    state.actionsLeft--;
    state.player.energy=clampStat(state.player.energy-B.freelanceEnergy);
    state.company.cashCents+=B.freelanceReward;
    log(state,'freelance');
  } else if(action.type==='researchTechnology') {
    if(studio.technology>=B.researchMax || studio.research<B.researchCost || state.actionsLeft<=0) return;
    studio.research-=B.researchCost;
    studio.technology++;
    state.actionsLeft--;
    log(state,'researched');
  }
};
