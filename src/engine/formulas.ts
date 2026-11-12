import {
  CLOUD_COST_MAX_CENTS,
  DEBT_EFFICIENCY_DIVISOR,
  ENERGY_EFFICIENCY_DIVISOR,
  INCIDENT_BASE_CHANCE,
  INCIDENT_BUG_RATE,
  INCIDENT_DEBT_RATE,
  PROD_BUGS_MAX,
  SKILL_DIMINISHING_DIVISOR,
  STAT_MAX,
  STAT_MIN,
  STRESS_EFFICIENCY_DIVISOR,
  TASK_PROGRESS_MAX,
} from './balance';

export const clampStat = (value: number): number =>
  Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(value)));

export const clampBugs = (value: number): number =>
  Math.max(0, Math.min(PROD_BUGS_MAX, Math.round(value)));

export const clampCloud = (value: number): number =>
  Math.max(0, Math.min(CLOUD_COST_MAX_CENTS, Math.round(value)));

export const clampProgress = (value: number): number =>
  Math.max(0, Math.min(TASK_PROGRESS_MAX, Math.round(value)));

export const clampCents = (value: number): number => Math.max(0, Math.round(value));

/** GDD: ganho = base × (1 − skill / 120). */
export const skillGain = (current: number, base: number): number =>
  Math.max(0, Math.round(base * (1 - current / SKILL_DIMINISHING_DIVISOR)));

/** GDD: (0,5 + energia/200) × (1 − estresse/250) × (1 − dívida/200). */
export const workEfficiency = (energy: number, stress: number, techDebt: number): number =>
  (0.5 + energy / ENERGY_EFFICIENCY_DIVISOR) *
  (1 - stress / STRESS_EFFICIENCY_DIVISOR) *
  (1 - techDebt / DEBT_EFFICIENCY_DIVISOR);

/** GDD: 1% + dívida × 0,04% + bugs × 0,5%. */
export const incidentChance = (techDebt: number, prodBugs: number): number =>
  INCIDENT_BASE_CHANCE + techDebt * INCIDENT_DEBT_RATE + prodBugs * INCIDENT_BUG_RATE;
