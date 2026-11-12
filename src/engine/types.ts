import type { RngState } from './rng';
import type { StudioState } from './studio';
import type { CareerState } from './career';

// ---------- Content definitions (static, loaded from src/data) ----------

export const SKILL_IDS = ['code', 'infra', 'architecture', 'softSkills'] as const;
export type SkillId = (typeof SKILL_IDS)[number];

export const REPUTATION_IDS = ['boss', 'team', 'po'] as const;
export type ReputationId = (typeof REPUTATION_IDS)[number];

export const TASK_COLUMNS = ['todo', 'doing', 'production'] as const;
export type TaskColumn = (typeof TASK_COLUMNS)[number];

export const EVENT_EFFECT_IDS = ['energy', 'stress', 'techDebt', 'prodBugs', 'boss', 'team', 'po', 'integrity'] as const;
export type EventEffectId = (typeof EVENT_EFFECT_IDS)[number];
export interface EventChoiceDef {
  id: string;
  label: string;
  effects: Partial<Record<EventEffectId, number>>;
}

export interface EventDef {
  cooldownDays: number;
  id: string;
  title: string;
  text: string;
  tags: string[];
  minLevelId: string;
  choices: EventChoiceDef[];
}

export interface TaskDef {
  id: string;
  title: string;
  skill: SkillId;
  baseDifficulty: number;
}

export interface PromotionDef {
  levelId: string;
  title: string;
  focus: string;
  order: number;
  requirements: Partial<Record<SkillId, number>>;
}

export interface LabeledDef {
  id: string;
  label: string;
}

export interface GameContent {
  events: EventDef[];
  tasks: TaskDef[];
  promotions: PromotionDef[];
  teamArchetypes: LabeledDef[];
  teamTraits: LabeledDef[];
  lines: Record<string, string>;
}

// ---------- Runtime state ----------

export interface PlayerState {
  energy: number;
  stress: number;
  skills: Record<SkillId, number>;
  reputation: Record<ReputationId, number>;
  integrity: number;
  salaryCents: number;
  tasksDelivered: number;
  incidentsCaused: number;
}

export interface CompanyState {
  techDebt: number;
  prodBugs: number;
  customerSatisfaction: number;
  cloudCostCents: number;
  revenueCents: number;
  cashCents: number;
  teamMorale: number;
  investorPressure: number;
}

export interface TeamMember {
  id: number;
  archetypeId: string;
  traitId: string;
}

export interface BacklogTask {
  id: number;
  taskId: string;
  difficulty: number;
  column: TaskColumn;
  progress: number;
  dueDay: number;
}

export interface LogEntry {
  id: number;
  day: number;
  author: string;
  channel: string;
  text: string;
}

export interface GameState {
  career: CareerState;
  studio: StudioState;
  pendingEventId: string | null;
  sprintDelivered: number;
  lastSprintReport: { sprint: number; delivered: number; success: boolean } | null;
  seed: string;
  rngState: RngState;
  day: number;
  levelId: string;
  actionsLeft: number;
  nextTaskId: number;
  nextLogId: number;
  player: PlayerState;
  company: CompanyState;
  team: TeamMember[];
  backlog: BacklogTask[];
  log: LogEntry[];
}
