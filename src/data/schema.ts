import { TASK_DIFFICULTY_MAX, TASK_DIFFICULTY_MIN } from '../engine/balance';
import {
  SKILL_IDS,
  EVENT_EFFECT_IDS,
  type EventEffectId,
  type EventDef,
  type GameContent,
  type LabeledDef,
  type PromotionDef,
  type SkillId,
  type TaskDef,
} from '../engine/types';

export class ContentError extends Error {}

type Obj = Record<string, unknown>;

const fail = (path: string, message: string): never => {
  throw new ContentError(`${path}: ${message}`);
};

const asObject = (value: unknown, path: string): Obj =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Obj)
    : fail(path, 'esperado objeto');

const asArray = (value: unknown, path: string): unknown[] =>
  Array.isArray(value) ? value : fail(path, 'esperado array');

const asString = (value: unknown, path: string): string =>
  typeof value === 'string' && value.length > 0 ? value : fail(path, 'esperado texto não vazio');

const asNumber = (value: unknown, path: string, min: number, max: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : fail(path, `esperado número entre ${min} e ${max}`);

const asSkill = (value: unknown, path: string): SkillId =>
  SKILL_IDS.includes(value as SkillId) ? (value as SkillId) : fail(path, 'skill desconhecida');

const assertUniqueIds = (ids: string[], path: string): void => {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(path, `id duplicado "${id}"`);
    seen.add(id);
  }
};

const parseLabeled = (value: unknown, path: string): LabeledDef => {
  const obj = asObject(value, path);
  return { id: asString(obj.id, `${path}.id`), label: asString(obj.label, `${path}.label`) };
};

const parseEvent = (value: unknown, path: string): EventDef => {
  const obj = asObject(value, path);
  const choices = asArray(obj.choices, `${path}.choices`).map((c, i) =>
    {
      const choice = asObject(c, `${path}.choices[${i}]`);
      const effects: Partial<Record<EventEffectId, number>> = {};
      for (const [key, amount] of Object.entries(asObject(choice.effects, `${path}.choices[${i}].effects`))) {
        if (!EVENT_EFFECT_IDS.includes(key as EventEffectId)) fail(path, `efeito desconhecido: ${key}`);
        effects[key as EventEffectId] = asNumber(amount, `${path}.choices[${i}].effects.${key}`, -100, 100);
      }
      return { ...parseLabeled(c, `${path}.choices[${i}]`), effects };
    },
  );
  if (choices.length < 2 || choices.length > 4) fail(`${path}.choices`, 'evento precisa de 2 a 4 escolhas');
  return {
    cooldownDays: obj.cooldownDays === undefined ? 6 : asNumber(obj.cooldownDays, `${path}.cooldownDays`, 1, 100),
    id: asString(obj.id, `${path}.id`),
    title: asString(obj.title, `${path}.title`),
    text: asString(obj.text, `${path}.text`),
    tags: asArray(obj.tags, `${path}.tags`).map((t, i) => asString(t, `${path}.tags[${i}]`)),
    minLevelId: asString(obj.minLevelId, `${path}.minLevelId`),
    choices,
  };
};

const parseTask = (value: unknown, path: string): TaskDef => {
  const obj = asObject(value, path);
  return {
    id: asString(obj.id, `${path}.id`),
    title: asString(obj.title, `${path}.title`),
    skill: asSkill(obj.skill, `${path}.skill`),
    baseDifficulty: asNumber(obj.baseDifficulty, `${path}.baseDifficulty`, TASK_DIFFICULTY_MIN, TASK_DIFFICULTY_MAX),
  };
};

const parsePromotion = (value: unknown, path: string): PromotionDef => {
  const obj = asObject(value, path);
  const rawRequirements = asObject(obj.requirements, `${path}.requirements`);
  const requirements: PromotionDef['requirements'] = {};
  for (const [key, req] of Object.entries(rawRequirements)) {
    requirements[asSkill(key, `${path}.requirements`)] = asNumber(req, `${path}.requirements.${key}`, 0, 100);
  }
  return {
    levelId: asString(obj.levelId, `${path}.levelId`),
    title: asString(obj.title, `${path}.title`),
    focus: asString(obj.focus, `${path}.focus`),
    order: asNumber(obj.order, `${path}.order`, 0, 100),
    requirements,
  };
};

const REQUIRED_LINES = [
  'author.system',
  'author.po',
  'author.you',
  'author.prod',
  'channel.geral',
  'channel.sprint',
  'channel.prod',
  'skill.code',
  'skill.infra',
  'skill.architecture',
  'skill.softSkills',
  'welcome',
  'welcome_po',
  'rest',
  'study',
  'work_start',
  'work_progress',
  'work_done',
  'work_empty',
  'help',
  'end_day',
  'no_actions',
  'weekend',
  'new_sprint',
  'new_task',
  'incident',
  'refactor',
  'fix',
  'promotion',
  'sprint_success',
  'sprint_miss',
  'event_choice',
  'event_pending',
] as const;

const parseLines = (value: unknown): Record<string, string> => {
  const obj = asObject(value, 'lines');
  const lines: Record<string, string> = {};
  for (const [key, raw] of Object.entries(obj)) {
    lines[key] = asString(raw, `lines.${key}`);
  }
  for (const key of REQUIRED_LINES) {
    if (!(key in lines)) fail(`lines.${key}`, 'ausente');
  }
  return lines;
};

export interface RawContent {
  events: unknown;
  tasks: unknown;
  promotions: unknown;
  team: unknown;
  lines: unknown;
}

/** Validates raw JSON and returns typed content, or throws ContentError. */
export const parseContent = (raw: RawContent): GameContent => {
  const events = asArray(raw.events, 'events').map((e, i) => parseEvent(e, `events[${i}]`));
  const tasks = asArray(raw.tasks, 'tasks').map((t, i) => parseTask(t, `tasks[${i}]`));
  const promotions = asArray(raw.promotions, 'promotions').map((p, i) =>
    parsePromotion(p, `promotions[${i}]`),
  );
  const team = asObject(raw.team, 'team');
  const teamArchetypes = asArray(team.archetypes, 'team.archetypes').map((a, i) =>
    parseLabeled(a, `team.archetypes[${i}]`),
  );
  const teamTraits = asArray(team.traits, 'team.traits').map((t, i) =>
    parseLabeled(t, `team.traits[${i}]`),
  );
  const lines = parseLines(raw.lines);

  assertUniqueIds(events.map((e) => e.id), 'events');
  assertUniqueIds(tasks.map((t) => t.id), 'tasks');
  assertUniqueIds(promotions.map((p) => p.levelId), 'promotions');
  assertUniqueIds(teamArchetypes.map((a) => a.id), 'team.archetypes');
  assertUniqueIds(teamTraits.map((t) => t.id), 'team.traits');

  if (tasks.length === 0) fail('tasks', 'precisa de pelo menos 1 task');
  if (promotions.length === 0) fail('promotions', 'precisa de pelo menos 1 nível');
  if (teamArchetypes.length === 0 || teamTraits.length === 0) fail('team', 'arquétipos e traços vazios');

  const levelIds = new Set(promotions.map((p) => p.levelId));
  events.forEach((e, i) => {
    if (!levelIds.has(e.minLevelId)) fail(`events[${i}].minLevelId`, `nível "${e.minLevelId}" não existe`);
  });

  return { events, tasks, promotions, teamArchetypes, teamTraits, lines };
};
