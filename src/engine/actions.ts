import {
  ACTIONS_PER_DAY,
  BACKLOG_DIFFICULTY_JITTER_MAX,
  END_DAY_ENERGY,
  END_DAY_STRESS_PER_BUG,
  HELP_ENERGY,
  HELP_MORALE,
  HELP_SOFT_BASE,
  HELP_STRESS,
  HELP_TEAM_REP,
  INCIDENT_BUGS,
  INCIDENT_MORALE,
  INCIDENT_PRESSURE,
  INCIDENT_SATISFACTION,
  INCIDENT_STRESS,
  MAX_LOG_ENTRIES,
  PRODUCTION_CAP,
  REST_ENERGY,
  REST_STRESS,
  STUDY_ENERGY,
  STUDY_SKILL_BASE,
  STUDY_STRESS,
  TASK_DIFFICULTY_MAX,
  TASK_PROGRESS_MAX,
  WEEKEND_ENERGY,
  WEEKEND_STRESS,
  WEEKLY_CLOUD_DRIFT_CENTS,
  WEEKLY_TASKS_MAX,
  WEEKLY_TASKS_MIN,
  WORK_DEBT_ON_DONE,
  WORK_ENERGY,
  WORK_PO_ON_DONE,
  WORK_PO_ON_PROGRESS,
  WORK_SKILL_BASE,
  WORK_STRESS,
} from './balance';
import { getCalendar } from './calendar';
import { applyStudioAction, type StudioAction } from './studio';
import { advanceCareerDay, applyCareerAction, careerLine, evaluateCareer, getTaskApproachProgress, isLeadership, recordCareerDecision, recordTaskApproach, runLeadershipDay, type CareerAction, type TaskApproach } from './career';
import { CAREER_BALANCE as CB } from './balance';
import { BACKLOG_CAP, DELIVERY_REVENUE_CENTS, DELIVERY_SATISFACTION, EVENT_INTERVAL_DAYS, FIX_BUGS, FIX_SATISFACTION, MAINTENANCE_ENERGY, NIGHT_STRESS_RECOVERY, REFACTOR_DEBT, RUSH_BUGS, RUSH_DEBT, SPRINT_BONUS_CENTS, SPRINT_TARGET, SPRINT_BOSS_SUCCESS, SPRINT_BOSS_MISS, SPRINT_PRESSURE_SUCCESS, SPRINT_PRESSURE_MISS, TASK_DEADLINE_DAYS } from './balance';
import { getDailyNet, getTaskReward, getWorkProgress } from './progression';
import {
  clampBugs,
  clampCents,
  clampCloud,
  clampProgress,
  clampStat,
  incidentChance,
  skillGain,
} from './formulas';
import { createRng } from './rng';
import { cloneState, line } from './state';
import type { GameContent, GameState, SkillId } from './types';

export type DeltaKey =
  | 'energy'
  | 'stress'
  | 'code'
  | 'infra'
  | 'architecture'
  | 'softSkills'
  | 'boss'
  | 'team'
  | 'po'
  | 'techDebt'
  | 'prodBugs'
  | 'cloudCostCents'
  | 'teamMorale'
  | 'investorPressure'
  | 'cashCents';

export interface StatDelta {
  key: DeltaKey;
  amount: number;
}

export type PlayerAction =
  | StudioAction
  | CareerAction
  | { type: 'work'; taskId?: number; rush?: boolean; approach?: TaskApproach }
  | { type: 'refactor' }
  | { type: 'fix' }
  | { type: 'promote' }
  | { type: 'chooseEvent'; choiceId: string }
  | { type: 'study'; skill: SkillId }
  | { type: 'rest' }
  | { type: 'help' }
  | { type: 'endDay' };

export interface ActionResult {
  state: GameState;
  deltas: StatDelta[];
}

const DELTA_READERS: readonly { key: DeltaKey; read: (state: GameState) => number }[] = [
  { key: 'energy', read: (state) => state.player.energy },
  { key: 'stress', read: (state) => state.player.stress },
  { key: 'code', read: (state) => state.player.skills.code },
  { key: 'infra', read: (state) => state.player.skills.infra },
  { key: 'architecture', read: (state) => state.player.skills.architecture },
  { key: 'softSkills', read: (state) => state.player.skills.softSkills },
  { key: 'boss', read: (state) => state.player.reputation.boss },
  { key: 'team', read: (state) => state.player.reputation.team },
  { key: 'po', read: (state) => state.player.reputation.po },
  { key: 'techDebt', read: (state) => state.company.techDebt },
  { key: 'prodBugs', read: (state) => state.company.prodBugs },
  { key: 'cloudCostCents', read: (state) => state.company.cloudCostCents },
  { key: 'teamMorale', read: (state) => state.company.teamMorale },
  { key: 'investorPressure', read: (state) => state.company.investorPressure },
  { key: 'cashCents', read: (state) => state.company.cashCents },
];

const snapshotNumbers = (state: GameState): Record<DeltaKey, number> => {
  const snap = {} as Record<DeltaKey, number>;
  for (const reader of DELTA_READERS) snap[reader.key] = reader.read(state);
  return snap;
};

const collectDeltas = (before: Record<DeltaKey, number>, after: GameState): StatDelta[] =>
  DELTA_READERS.flatMap((reader) => {
    const amount = reader.read(after) - before[reader.key];
    return amount === 0 ? [] : [{ key: reader.key, amount }];
  });

const pushLog = (
  state: GameState,
  content: GameContent,
  author: 'system' | 'po' | 'you' | 'prod',
  channel: 'geral' | 'sprint' | 'prod',
  key: string,
  vars: Record<string, string | number> = {},
): void => {
  state.log = [
    {
      id: state.nextLogId,
      day: state.day,
      author: line(content, `author.${author}`),
      channel: line(content, `channel.${channel}`),
      text: line(content, key, vars),
    },
    ...state.log,
  ].slice(0, MAX_LOG_ENTRIES);
  state.nextLogId += 1;
};

const taskTitle = (content: GameContent, taskId: string): string =>
  content.tasks.find((task) => task.id === taskId)?.title ?? taskId;

const spendAction = (state: GameState, content: GameContent): boolean => {
  if (state.actionsLeft <= 0) {
    pushLog(state, content, 'system', 'geral', 'no_actions');
    return false;
  }
  state.actionsLeft -= 1;
  return true;
};

const applyWork = (state: GameState, content: GameContent, action: Extract<PlayerAction, { type: 'work' }>, rng: ReturnType<typeof createRng>): void => {
  const target =
    (action.taskId !== undefined ? state.backlog.find(task => task.id === action.taskId && task.column !== 'production') : undefined) ??
    state.backlog.find((task) => task.column === 'doing') ??
    state.backlog.find((task) => task.column === 'todo');

  if (!target) {
    pushLog(state, content, 'you', 'sprint', 'work_empty');
    return;
  }

  const approach = action.approach ?? (action.rush ? 'rush' : 'careful');
  const title = taskTitle(content, target.taskId);
  if (action.approach) recordTaskApproach(state, target, title, approach, rng);
  if (approach === 'defer') {
    target.column = 'todo'; target.dueDay += TASK_DEADLINE_DAYS;
    target.difficulty = Math.min(TASK_DIFFICULTY_MAX, target.difficulty + 1);
    state.player.stress = clampStat(state.player.stress + CB.deferStress);
    state.player.reputation.po = clampStat(state.player.reputation.po + CB.deferPo);
    return;
  }
  const started = target.column === 'todo';
  for (const task of state.backlog) if (task.column === 'doing' && task.id !== target.id) task.column = 'todo';
  const base = getWorkProgress(state, target, content, approach === 'rush');
  const gain = action.approach ? getTaskApproachProgress(base, approach) : base;
  state.player.energy = clampStat(state.player.energy + WORK_ENERGY);
  state.player.stress = clampStat(state.player.stress + WORK_STRESS);
  if (approach === 'help') state.player.reputation.team = clampStat(state.player.reputation.team + CB.helpReputation);
  if (approach === 'rush') {
    state.company.techDebt = clampStat(state.company.techDebt + (action.approach === 'rush' ? CB.rushDebt : RUSH_DEBT));
    state.company.prodBugs = clampBugs(state.company.prodBugs + (action.approach === 'rush' ? CB.rushImmediateBugs : RUSH_BUGS));
  }
  target.column = 'doing';

  const definition = content.tasks.find((task) => task.id === target.taskId);
  target.progress = clampProgress(target.progress + gain);

  if (definition) {
    const skill = definition.skill;
    state.player.skills[skill] = clampStat(
      state.player.skills[skill] + skillGain(state.player.skills[skill], WORK_SKILL_BASE + (approach === 'help' ? CB.helpLearning : 0)),
    );
  }

  if (target.progress >= TASK_PROGRESS_MAX) {
    target.column = 'production';
    target.progress = TASK_PROGRESS_MAX;
    state.player.tasksDelivered += 1;
    state.career.xp += CB.xpDelivery;
    state.sprintDelivered += 1;
    state.company.cashCents += getTaskReward(target, state.day);
    state.company.revenueCents += DELIVERY_REVENUE_CENTS * target.difficulty;
    state.company.customerSatisfaction = clampStat(state.company.customerSatisfaction + (state.day <= target.dueDay ? DELIVERY_SATISFACTION : -DELIVERY_SATISFACTION));
    state.player.reputation.po = clampStat(state.player.reputation.po + WORK_PO_ON_DONE);
    state.company.techDebt = clampStat(state.company.techDebt + (action.approach === 'careful' ? CB.carefulDebt : WORK_DEBT_ON_DONE));

    const shipped = state.backlog.filter((task) => task.column === 'production');
    if (shipped.length > PRODUCTION_CAP) {
      const overflow = shipped.length - PRODUCTION_CAP;
      let dropped = 0;
      state.backlog = state.backlog.filter((task) => {
        if (task.column !== 'production' || dropped >= overflow) return true;
        dropped += 1;
        return false;
      });
    }

    pushLog(state, content, 'you', 'sprint', 'work_done', { title });
    return;
  }

  state.player.reputation.po = clampStat(state.player.reputation.po + WORK_PO_ON_PROGRESS);
  pushLog(state, content, 'you', 'sprint', started ? 'work_start' : 'work_progress', {
    title,
    progress: target.progress,
  });
};

const applyStudy = (state: GameState, content: GameContent, skill: SkillId): void => {
  state.career.xp += CB.xpStudy;
  state.player.energy = clampStat(state.player.energy + STUDY_ENERGY);
  state.player.stress = clampStat(state.player.stress + STUDY_STRESS);
  state.player.skills[skill] = clampStat(
    state.player.skills[skill] + skillGain(state.player.skills[skill], STUDY_SKILL_BASE),
  );
  pushLog(state, content, 'you', 'geral', 'study', {
    skill: line(content, `skill.${skill}`),
  });
};

const applyRest = (state: GameState, content: GameContent): void => {
  state.player.energy = clampStat(state.player.energy + REST_ENERGY);
  state.player.stress = clampStat(state.player.stress + REST_STRESS);
  pushLog(state, content, 'you', 'geral', 'rest');
};

const applyHelp = (state: GameState, content: GameContent): void => {
  state.career.xp += CB.xpHelp;
  state.player.reputation.boss = clampStat(state.player.reputation.boss + CB.helpBoss);
  state.player.energy = clampStat(state.player.energy + HELP_ENERGY);
  state.player.stress = clampStat(state.player.stress + HELP_STRESS);
  state.player.reputation.team = clampStat(state.player.reputation.team + HELP_TEAM_REP);
  state.player.skills.softSkills = clampStat(
    state.player.skills.softSkills + skillGain(state.player.skills.softSkills, HELP_SOFT_BASE),
  );
  state.company.teamMorale = clampStat(state.company.teamMorale + HELP_MORALE);
  pushLog(state, content, 'you', 'geral', 'help');
};

const rollIncident = (state: GameState, content: GameContent, rng: ReturnType<typeof createRng>): void => {
  if (!rng.chance(incidentChance(state.company.techDebt, state.company.prodBugs))) return;

  state.company.prodBugs = clampBugs(state.company.prodBugs + INCIDENT_BUGS);
  state.player.stress = clampStat(state.player.stress + INCIDENT_STRESS);
  state.company.investorPressure = clampStat(state.company.investorPressure + INCIDENT_PRESSURE);
  state.company.customerSatisfaction = clampStat(
    state.company.customerSatisfaction + INCIDENT_SATISFACTION,
  );
  state.company.teamMorale = clampStat(state.company.teamMorale + INCIDENT_MORALE);
  state.player.incidentsCaused += 1;
  pushLog(state, content, 'prod', 'prod', 'incident');
};

const addWeeklyTasks = (state: GameState, content: GameContent, rng: ReturnType<typeof createRng>): void => {
  const count = Math.min(rng.int(WEEKLY_TASKS_MIN, WEEKLY_TASKS_MAX), BACKLOG_CAP - state.backlog.filter(task => task.column !== 'production').length);
  for (let i = 0; i < count; i++) {
    const definition = rng.pick(content.tasks);
    state.backlog.push({
      id: state.nextTaskId,
      taskId: definition.id,
      difficulty: Math.min(
        TASK_DIFFICULTY_MAX,
        definition.baseDifficulty + rng.int(0, BACKLOG_DIFFICULTY_JITTER_MAX),
      ),
      column: 'todo',
      progress: 0,
      dueDay: state.day + TASK_DEADLINE_DAYS - 1,
    });
    state.nextTaskId += 1;
    pushLog(state, content, 'po', 'sprint', 'new_task', { title: definition.title });
  }
};

const advanceDay = (state: GameState, content: GameContent, rng: ReturnType<typeof createRng>): void => {
  pushLog(state, content, 'system', 'geral', 'end_day');
  state.career.lowEnergyDays = state.player.energy <= 0 ? state.career.lowEnergyDays + 1 : 0;
  runLeadershipDay(state, content);

  state.player.energy = clampStat(state.player.energy + END_DAY_ENERGY);
  state.player.stress = clampStat(
    state.player.stress + state.company.prodBugs * END_DAY_STRESS_PER_BUG - NIGHT_STRESS_RECOVERY,
  );
  rollIncident(state, content, rng);
  const net = getDailyNet(state);
  state.company.cashCents = clampCents(state.company.cashCents + net);

  const previous = getCalendar(state.day);
  state.day += 1;
  state.actionsLeft = ACTIONS_PER_DAY;
  const next = getCalendar(state.day);

  if (next.week !== previous.week) {
    state.player.energy = clampStat(state.player.energy + WEEKEND_ENERGY);
    state.player.stress = clampStat(state.player.stress + WEEKEND_STRESS);
    state.company.cloudCostCents = clampCloud(state.company.cloudCostCents + WEEKLY_CLOUD_DRIFT_CENTS);
    pushLog(state, content, 'system', 'geral', 'weekend');
    addWeeklyTasks(state, content, rng);
  }

  if (next.sprint !== previous.sprint) {
    const success = state.sprintDelivered >= SPRINT_TARGET;
    state.lastSprintReport = { sprint: previous.sprint, delivered: state.sprintDelivered, success };
    if (success) state.company.cashCents += SPRINT_BONUS_CENTS;
    state.player.reputation.boss = clampStat(state.player.reputation.boss + (success ? SPRINT_BOSS_SUCCESS : SPRINT_BOSS_MISS));
    state.company.investorPressure = clampStat(state.company.investorPressure + (success ? SPRINT_PRESSURE_SUCCESS : SPRINT_PRESSURE_MISS));
    pushLog(state, content, 'system', 'sprint', success ? 'sprint_success' : 'sprint_miss', { delivered: state.sprintDelivered });
    state.sprintDelivered = 0;
    pushLog(state, content, 'po', 'sprint', 'new_sprint', { sprint: next.sprint });
  }
  advanceCareerDay(state, rng);
  if (state.career.enabled && !state.career.ending && state.day >= state.career.nextReviewDay) evaluateCareer(state, content);
  if (!state.career.ending && state.day % EVENT_INTERVAL_DAYS === 0) {
    const order = content.promotions.find(level => level.levelId === state.levelId)?.order ?? 0;
    const eligible = content.events.filter(event => state.day - (state.career.decisions.find(item => item.kind === 'event:' + event.id)?.day ?? -1000) >= event.cooldownDays && (event.id !== 'prod_down' || state.studio.launched > 0 || state.company.prodBugs > 0) && (content.promotions.find(level => level.levelId === event.minLevelId)?.order ?? Infinity) <= order);
    if (eligible.length) state.pendingEventId = rng.pick(eligible).id;
  }
};

/** Pure: same state + action + content => same result. */
export const applyAction = (
  state: GameState,
  action: PlayerAction,
  content: GameContent,
): ActionResult => {
  const next = cloneState(state);
  if (next.career.ending) return { state: next, deltas: [] };
  const before = snapshotNumbers(next);
  const rng = createRng(next.rngState);

  if (action.type === 'chooseEvent') {
    const event = content.events.find(item => item.id === next.pendingEventId);
    const choice = event?.choices.find(item => item.id === action.choiceId);
    if (choice) {
      for (const [key, amount] of Object.entries(choice.effects)) {
        if (key === 'energy' || key === 'stress' || key === 'integrity') next.player[key] = clampStat(next.player[key] + amount);
        else if (key === 'boss' || key === 'team' || key === 'po') next.player.reputation[key] = clampStat(next.player.reputation[key] + amount);
        else if (key === 'techDebt') next.company.techDebt = clampStat(next.company.techDebt + amount);
        else if (key === 'prodBugs') next.company.prodBugs = clampBugs(next.company.prodBugs + amount);
      }
      pushLog(next, content, 'you', 'geral', 'event_choice', { title: event!.title, choice: choice.label });
      recordCareerDecision(next, 'event:' + event!.id, careerLine('eventDecision', { title: event!.title, choice: choice.label }), null, Object.entries(choice.effects).map(([key, amount]) => (content.lines['effect.' + key] ?? key) + ': ' + amount).join(' · '));
      next.pendingEventId = null;
    }
  } else if (next.pendingEventId) {
    pushLog(next, content, 'system', 'geral', 'event_pending');
  } else if (action.type === 'planSprint' || action.type === 'supportTeam' || action.type === 'architectureDecision' || action.type === 'concludeCareer' || action.type === 'leaveForStartup') {
    applyCareerAction(next, action, content);
  } else if (action.type === 'startProject' || action.type === 'develop' || action.type === 'launchProduct' || action.type === 'upgradeStudio' || action.type === 'researchTechnology' || action.type === 'freelance') {
    if (!next.career.enabled) applyStudioAction(next, action);
  } else if (action.type === 'promote') {
    evaluateCareer(next, content);
  } else if (action.type === 'work' && (action.taskId !== undefined
    ? !next.backlog.some(task => task.id === action.taskId && task.column !== 'production')
    : !next.backlog.some(task => task.column !== 'production'))) {
    pushLog(next, content, 'system', 'sprint', 'work_empty');
  } else if (action.type === 'fix' && next.company.prodBugs === 0) {
    // No resources spent on an unavailable action.
  } else if (action.type === 'refactor' && next.company.techDebt === 0) {
    // No resources spent on an unavailable action.
  } else if (action.type === 'endDay') {
    advanceDay(next, content, rng);
  } else if (spendAction(next, content)) {
    if (action.type === 'work') applyWork(next, content, action, rng);
    else if (action.type === 'study') applyStudy(next, content, action.skill);
    else if (action.type === 'rest') applyRest(next, content);
    else if (action.type === 'help') applyHelp(next, content);
    else if (action.type === 'fix' || action.type === 'refactor') {
      next.career.xp += CB.xpRefactor;
      next.player.energy = clampStat(next.player.energy + MAINTENANCE_ENERGY);
      if (action.type === 'fix') {
        next.company.prodBugs = clampBugs(next.company.prodBugs - FIX_BUGS);
        next.company.customerSatisfaction = clampStat(next.company.customerSatisfaction + FIX_SATISFACTION);
        next.player.skills.infra = clampStat(next.player.skills.infra + skillGain(next.player.skills.infra, WORK_SKILL_BASE));
      } else {
        next.company.techDebt = clampStat(next.company.techDebt - REFACTOR_DEBT);
        next.player.skills.architecture = clampStat(next.player.skills.architecture + skillGain(next.player.skills.architecture, WORK_SKILL_BASE));
      }
      pushLog(next, content, 'you', 'prod', action.type);
    }
  }

  if (next.career.enabled && next.player.stress >= 100) next.career.ending = { type: 'burnout', day: next.day };
  if (next.career.enabled && isLeadership(next)) next.actionsLeft = Math.min(next.actionsLeft, CB.leadershipActions);
  next.company.cashCents = clampCents(next.company.cashCents);
  next.rngState = rng.getState();
  return { state: next, deltas: collectDeltas(before, next) };
};
