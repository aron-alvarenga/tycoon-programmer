import {
  ACTIONS_PER_DAY,
  BACKLOG_DIFFICULTY_JITTER_MAX,
  INITIAL_BACKLOG_SIZE,
  INITIAL_TASK_DIFFICULTY_MAX,
  INITIAL_COMPANY,
  INITIAL_PLAYER,
  TASK_DIFFICULTY_MAX,
  TEAM_SIZE,
  TASK_DEADLINE_DAYS,
} from './balance';
import { createRng, seedToRngState } from './rng';
import { createStudio } from './studio';
import { createCareer } from './career';
import type { BacklogTask, GameContent, GameState, LogEntry, TeamMember } from './types';

const getStartingLevelId = (content: GameContent): string => {
  const [first] = [...content.promotions].sort((a, b) => a.order - b.order);
  if (!first) throw new Error('content has no promotion levels');
  return first.levelId;
};

/** Same seed + same content => identical state, always. */
export const createInitialState = (seed: string, content: GameContent): GameState => {
  const rng = createRng(seedToRngState(seed));

  const team: TeamMember[] = [];
  for (let i = 0; i < TEAM_SIZE; i++) {
    team.push({
      id: i + 1,
      archetypeId: rng.pick(content.teamArchetypes).id,
      traitId: rng.pick(content.teamTraits).id,
    });
  }

  const backlog: BacklogTask[] = [];
  for (let i = 0; i < INITIAL_BACKLOG_SIZE; i++) {
    const difficultyCap = Math.min(i + 1, INITIAL_TASK_DIFFICULTY_MAX);
    const candidates = content.tasks.filter(task => task.baseDifficulty <= difficultyCap);
    const task = rng.pick(candidates.length ? candidates : content.tasks);
    backlog.push({
      id: i + 1,
      taskId: task.id,
      difficulty: Math.min(
        TASK_DIFFICULTY_MAX,
        Math.max(difficultyCap, task.baseDifficulty),
        task.baseDifficulty + rng.int(0, BACKLOG_DIFFICULTY_JITTER_MAX),
      ),
      column: 'todo',
      progress: 0,
      dueDay: TASK_DEADLINE_DAYS,
    });
  }

  const log: LogEntry[] = [
    {
      id: 2,
      day: 1,
      author: line(content, 'author.po'),
      channel: line(content, 'channel.sprint'),
      text: line(content, 'welcome_po'),
    },
    {
      id: 1,
      day: 1,
      author: line(content, 'author.system'),
      channel: line(content, 'channel.geral'),
      text: line(content, 'welcome'),
    },
  ];

  return {
    career: createCareer(),
    studio: createStudio(),
    pendingEventId: null,
    sprintDelivered: 0,
    lastSprintReport: null,
    seed,
    rngState: rng.getState(),
    day: 1,
    levelId: getStartingLevelId(content),
    actionsLeft: ACTIONS_PER_DAY,
    nextTaskId: backlog.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1,
    nextLogId: 3,
    player: {
      ...INITIAL_PLAYER,
      skills: { ...INITIAL_PLAYER.skills },
      reputation: { ...INITIAL_PLAYER.reputation },
    },
    company: { ...INITIAL_COMPANY },
    team,
    backlog,
    log,
  };
};

export const line = (
  content: GameContent,
  key: string,
  vars: Record<string, string | number> = {},
): string => {
  const template = content.lines[key] ?? key;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name: string) =>
    vars[name] === undefined ? `{${name}}` : String(vars[name]),
  );
};

export const cloneState = (state: GameState): GameState => ({
  ...state,
  career: { ...state.career, lastReview: state.career.lastReview ? { ...state.career.lastReview, reasons: [...state.career.lastReview.reasons] } : null,
    decisions: state.career.decisions.map(item=>({...item})), consequences: state.career.consequences.map(item=>({...item})),
    team: state.career.team.map(item=>({...item})), plan:[...state.career.plan], ending:state.career.ending?{...state.career.ending}:null },
  studio: { ...state.studio, project: state.studio.project ? { ...state.studio.project } : null, releases: state.studio.releases.map(item => ({ ...item })) },
  lastSprintReport: state.lastSprintReport ? { ...state.lastSprintReport } : null,
  player: {
    ...state.player,
    skills: { ...state.player.skills },
    reputation: { ...state.player.reputation },
  },
  company: { ...state.company },
  team: state.team.map((member) => ({ ...member })),
  backlog: state.backlog.map((task) => ({ ...task })),
  log: state.log.map((entry) => ({ ...entry })),
});
