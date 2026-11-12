import type { BacklogTask, GameContent, GameState, SkillId } from './types';
import { DELIVERY_REWARD_CENTS, LATE_REWARD_MULTIPLIER, MONTH_WORKDAYS, MORALE_PRODUCTIVITY_BASE, MORALE_PRODUCTIVITY_DIVISOR, PROMOTION_DELIVERIES, RUSH_MULTIPLIER, SKILL_PRODUCTIVITY_DIVISOR, TEAM_PAYROLL_CENTS, WORK_PROGRESS_BASE } from './balance';
import { STUDIO_BALANCE } from '../data/studio';
import { workEfficiency } from './formulas';

export const getPromotion = (state: GameState, content: GameContent) => {
  const levels = [...content.promotions].sort((a, b) => a.order - b.order);
  const index = levels.findIndex(level => level.levelId === state.levelId);
  const current = levels[index];
  const next = levels[index + 1];
  const requirements = Object.entries(current?.requirements ?? {}).map(([skill, target]) => ({
    skill: skill as SkillId, target, value: state.player.skills[skill as SkillId],
  }));
  const deliveries = (index + 1) * PROMOTION_DELIVERIES;
  return { current, next, requirements, deliveries,
    ready: !!next && state.player.tasksDelivered >= deliveries && requirements.every(req => req.value >= req.target),
  };
};

export const getWorkProgress = (state: GameState, task: BacklogTask, content: GameContent, rush = false): number => {
  const skill = content.tasks.find(item => item.id === task.taskId)?.skill ?? 'code';
  return Math.max(1, Math.round(WORK_PROGRESS_BASE * workEfficiency(state.player.energy, state.player.stress, state.company.techDebt)
    * (1 + state.player.skills[skill] / SKILL_PRODUCTIVITY_DIVISOR)
    * (MORALE_PRODUCTIVITY_BASE + state.company.teamMorale / MORALE_PRODUCTIVITY_DIVISOR)
    * (rush ? RUSH_MULTIPLIER : 1) / task.difficulty));
};

export const getTaskReward = (task: BacklogTask, day: number): number =>
  Math.round(task.difficulty * DELIVERY_REWARD_CENTS * (day > task.dueDay ? LATE_REWARD_MULTIPLIER : 1));

export const getDailyNet = (state: GameState): number => Math.round(
  state.career.enabled ?
  (state.company.revenueCents * state.company.customerSatisfaction / 100 - state.company.cloudCostCents - TEAM_PAYROLL_CENTS - state.player.salaryCents) / MONTH_WORKDAYS :
  (state.company.revenueCents * state.company.customerSatisfaction / 100 - state.company.cloudCostCents
    ) / MONTH_WORKDAYS - STUDIO_BALANCE.dailyLivingCost * (1 + state.studio.office),
);
