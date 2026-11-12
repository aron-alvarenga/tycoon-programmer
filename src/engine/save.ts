import type { GameState } from './types';
import { SKILL_IDS, REPUTATION_IDS } from './types';
import { INITIAL_PLAYER, INITIAL_COMPANY, CAREER_BALANCE } from './balance';
import { createStudio } from './studio';
import { createCareer } from './career';

/** Bump whenever GameState changes shape, and add a migration below. */
export const SAVE_VERSION = 5;

export interface SaveFile {
  version: number;
  state: GameState;
}

export type LoadResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: 'invalid-json' | 'unsupported-version' | 'invalid-shape' };

const isTaskColumn = (value: unknown): value is GameState['backlog'][number]['column'] =>
  value === 'todo' || value === 'doing' || value === 'production';

/** migrations[n] upgrades a save from version n to n + 1. */
const migrations: Record<number, (state: unknown) => unknown> = {
  4: (state) => {
    if (!isRecord(state)) return state;
    const career = createCareer(typeof state.day === 'number' ? state.day : 1);
    if (isRecord(state.player) && typeof state.player.tasksDelivered === 'number') career.xp = state.player.tasksDelivered * CAREER_BALANCE.xpDelivery;
    if (state.levelId === 'architect') career.architectSinceDay = typeof state.day === 'number' ? state.day : 1;
    const company = isRecord(state.company) && typeof state.company.cloudCostCents === 'number' && state.company.cloudCostCents < CAREER_BALANCE.legacyEmployerThreshold
      ? { ...INITIAL_COMPANY } : state.company;
    return { ...state, company, career };
  },
  3: (state) => isRecord(state) ? { ...state, studio: createStudio() } : state,
  2: (state) => {
    if (!isRecord(state) || !Array.isArray(state.backlog)) return state;
    return { ...state, pendingEventId: null, sprintDelivered: 0, lastSprintReport: null,
      backlog: state.backlog.map(task => isRecord(task) ? { ...task, dueDay: Number(state.day) + 9 } : task) };
  },
  1: (state) => {
    if (!isRecord(state) || !Array.isArray(state.backlog)) return state;
    const backlog = state.backlog.map((item) => {
      if (!isRecord(item)) return item;
      return {
        ...item,
        column: isTaskColumn(item.column) ? item.column : 'todo',
        progress: typeof item.progress === 'number' ? item.progress : 0,
      };
    });
    return {
      ...state,
      player: isRecord(state.player) ? { ...INITIAL_PLAYER, ...state.player,
        skills: { ...INITIAL_PLAYER.skills, ...(isRecord(state.player.skills) ? state.player.skills : {}) },
        reputation: { ...INITIAL_PLAYER.reputation, ...(isRecord(state.player.reputation) ? state.player.reputation : {}) },
      } : state.player,
      company: isRecord(state.company) ? { ...INITIAL_COMPANY, ...state.company } : state.company,
      actionsLeft: 2,
      nextTaskId: backlog.reduce((maxId, item) => {
        if (!isRecord(item) || typeof item.id !== 'number') return maxId;
        return Math.max(maxId, item.id);
      }, 0) + 1,
      nextLogId: 1,
      log: [],
      backlog,
    };
  },
};

export const serializeSave = (state: GameState): string =>
  JSON.stringify({ version: SAVE_VERSION, state } satisfies SaveFile);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumberIn = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;

const hasStats = (value: unknown, keys: readonly string[], max = 100): boolean =>
  isRecord(value) && keys.every(key => isNumberIn(value[key], 0, max));

const isLogEntry = (value: unknown): boolean =>
  isRecord(value) &&
  isNumberIn(value.id, 1) &&
  isNumberIn(value.day, 1) &&
  typeof value.author === 'string' &&
  typeof value.channel === 'string' &&
  typeof value.text === 'string';

const isBacklogTask = (value: unknown): boolean =>
  isRecord(value) &&
  isNumberIn(value.id, 1) &&
  typeof value.taskId === 'string' &&
  isNumberIn(value.difficulty, 1, 5) &&
  isTaskColumn(value.column) &&
  isNumberIn(value.progress, 0, 100) &&
  isNumberIn(value.dueDay, 1);

const isGameState = (value: unknown): value is GameState =>
  isRecord(value) &&
  isRecord(value.career) &&
  typeof value.career.enabled === 'boolean' && typeof value.career.name === 'string' &&
  isNumberIn(value.career.xp, 0) && isNumberIn(value.career.nextReviewDay, 1) &&
  isNumberIn(value.career.warnings, 0) && isNumberIn(value.career.lowEnergyDays, 0) && isNumberIn(value.career.cashCrisisDays, 0) &&
  isNumberIn(value.career.nextDecisionId, 1) &&
  isNumberIn(value.career.architectDeliveries, 0) &&
  (value.career.lastReview === null || (isRecord(value.career.lastReview) && isNumberIn(value.career.lastReview.day, 1) &&
    typeof value.career.lastReview.from === 'string' && typeof value.career.lastReview.to === 'string' &&
    ['promoted','maintained','warning'].includes(String(value.career.lastReview.outcome)) &&
    Array.isArray(value.career.lastReview.reasons) && value.career.lastReview.reasons.every(reason=>typeof reason==='string'))) &&
  Array.isArray(value.career.decisions) && value.career.decisions.every(item=>isRecord(item)&&isNumberIn(item.id,1)&&isNumberIn(item.day,1)&&typeof item.kind==='string'&&typeof item.text==='string'&&(item.dueDay===null||isNumberIn(item.dueDay,1))&&(item.result===null||typeof item.result==='string')) &&
  Array.isArray(value.career.consequences) && value.career.consequences.every(item=>isRecord(item)&&isNumberIn(item.decisionId,1)&&isNumberIn(item.dueDay,1)&&typeof item.title==='string'&&['rush','careful','help','defer','modular','services'].includes(String(item.kind))) &&
  Array.isArray(value.career.team) && value.career.team.length>0 && value.career.team.every(item=>isRecord(item)&&isNumberIn(item.id,1)&&typeof item.title==='string'&&isNumberIn(item.proficiency,0,100)&&isNumberIn(item.morale,0,100)&&['mentor','fast','careful','independent'].includes(String(item.trait))) &&
  Array.isArray(value.career.plan) && value.career.plan.every(id=>isNumberIn(id,1)) &&
  ['protect','balanced','push'].includes(String(value.career.policy)) &&
  (value.career.architecture===null||['modular','services'].includes(String(value.career.architecture))) &&
  (value.career.architectSinceDay===null||isNumberIn(value.career.architectSinceDay,1)) &&
  (value.career.ending===null||(isRecord(value.career.ending)&&isNumberIn(value.career.ending.day,1)&&['healthy','powerpoint','burnout','dismissed','bankrupt','startup'].includes(String(value.career.ending.type)))) &&
  isRecord(value.studio) &&
  typeof value.studio.name === 'string' &&
  isNumberIn(value.studio.hardware, 0, 3) &&
  isNumberIn(value.studio.office, 0, 2) &&
  isNumberIn(value.studio.technology, 0, 5) &&
  isNumberIn(value.studio.research, 0) &&
  isNumberIn(value.studio.fans, 0) &&
  isNumberIn(value.studio.launched, 0) &&
  (value.studio.project === null || (isRecord(value.studio.project) && typeof value.studio.project.name === 'string' &&
    ['website', 'app', 'game', 'saas'].includes(String(value.studio.project.kind)) &&
    ['local', 'creators', 'business'].includes(String(value.studio.project.audience)) &&
    isNumberIn(value.studio.project.phase, 0, 3) && isNumberIn(value.studio.project.progress, 0, 100) &&
    typeof value.studio.project.quality === 'number' && Number.isFinite(value.studio.project.quality) && value.studio.project.quality >= 0 && value.studio.project.quality <= 100 &&
    isNumberIn(value.studio.project.bugs, 0))) &&
  Array.isArray(value.studio.releases) &&
  value.studio.releases.every(item => isRecord(item) && typeof item.name === 'string' && isNumberIn(item.id, 1) &&
    ['website','app','game','saas'].includes(String(item.kind)) && isNumberIn(item.score, 1, 10) &&
    isNumberIn(item.fans, 0) && isNumberIn(item.revenueCents, 0) && isNumberIn(item.monthlyCents, 0) && isNumberIn(item.day, 1)) &&
  typeof value.seed === 'string' &&
  isNumberIn(value.rngState, 0, 4294967295) &&
  typeof value.levelId === 'string' &&
  isNumberIn(value.actionsLeft, 0, 2) &&
  isNumberIn(value.day, 1) &&
  isNumberIn(value.sprintDelivered, 0) &&
  (value.pendingEventId === null || typeof value.pendingEventId === 'string') &&
  (value.lastSprintReport === null || (isRecord(value.lastSprintReport) &&
    isNumberIn(value.lastSprintReport.sprint, 1) && isNumberIn(value.lastSprintReport.delivered, 0) &&
    typeof value.lastSprintReport.success === 'boolean')) &&
  isNumberIn(value.nextTaskId, 1) &&
  isNumberIn(value.nextLogId, 1) &&
  isRecord(value.player) &&
  hasStats(value.player, ['energy', 'stress', 'integrity']) &&
  hasStats(value.player.skills, SKILL_IDS) &&
  hasStats(value.player.reputation, REPUTATION_IDS) &&
  hasStats(value.player, ['salaryCents', 'tasksDelivered', 'incidentsCaused'], Number.MAX_SAFE_INTEGER) &&
  isRecord(value.company) &&
  hasStats(value.company, ['techDebt', 'customerSatisfaction', 'teamMorale', 'investorPressure']) &&
  hasStats(value.company, ['prodBugs'], 20) &&
  hasStats(value.company, ['cashCents', 'revenueCents', 'cloudCostCents'], Number.MAX_SAFE_INTEGER) &&
  Array.isArray(value.team) &&
  Array.isArray(value.backlog) &&
  value.backlog.every(isBacklogTask) &&
  Array.isArray(value.log) &&
  value.log.every(isLogEntry);

export const deserializeSave = (raw: string): LoadResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
  if (!isRecord(parsed) || typeof parsed.version !== 'number') {
    return { ok: false, reason: 'invalid-shape' };
  }

  let { version } = parsed;
  let state: unknown = parsed.state;
  if (version > SAVE_VERSION) return { ok: false, reason: 'unsupported-version' };
  while (version < SAVE_VERSION) {
    const migrate = migrations[version];
    if (!migrate) return { ok: false, reason: 'unsupported-version' };
    state = migrate(state);
    version++;
  }

  return isGameState(state) ? { ok: true, state } : { ok: false, reason: 'invalid-shape' };
};
