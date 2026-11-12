import type { CompanyState, PlayerState } from './types';

// Every number here is documented in docs/BALANCE.md. Money is in cents.

export const INITIAL_PLAYER: Readonly<PlayerState> = {
  energy: 80,
  stress: 20,
  skills: { code: 15, infra: 5, architecture: 0, softSkills: 10 },
  reputation: { boss: 50, team: 50, po: 50 },
  integrity: 70,
  salaryCents: 1_800_00,
  tasksDelivered: 0,
  incidentsCaused: 0,
};

export const INITIAL_COMPANY: Readonly<CompanyState> = {
  techDebt: 45,
  prodBugs: 2,
  customerSatisfaction: 60,
  cloudCostCents: 4_000_000,
  revenueCents: 18_000_000,
  cashCents: 120_000_000,
  teamMorale: 60,
  investorPressure: 30,
};

export const TEAM_SIZE = 4;
export const INITIAL_BACKLOG_SIZE = 3;
export const INITIAL_TASK_DIFFICULTY_MAX = 3;
/** Extra difficulty rolled on top of a task's base difficulty: [0, max]. */
export const BACKLOG_DIFFICULTY_JITTER_MAX = 1;
export const TASK_DIFFICULTY_MIN = 1;
export const TASK_DIFFICULTY_MAX = 5;

export const STAT_MIN = 0;
export const STAT_MAX = 100;
export const PROD_BUGS_MAX = 20;
export const CLOUD_COST_MAX_CENTS = 250_000_00;
export const TASK_PROGRESS_MAX = 100;

export const DAYS_PER_WEEK = 5;
export const WEEKS_PER_SPRINT = 2;
export const ACTIONS_PER_DAY = 2;
export const MAX_LOG_ENTRIES = 40;
export const PRODUCTION_CAP = 8;
export const WEEKLY_TASKS_MIN = 1;
export const WEEKLY_TASKS_MAX = 2;

/** skillGain = base × (1 − skill / this). Documented in docs/BALANCE.md. */
export const SKILL_DIMINISHING_DIVISOR = 120;

export const REST_ENERGY = 18;
export const REST_STRESS = -10;

export const STUDY_ENERGY = -12;
export const STUDY_STRESS = 3;
export const STUDY_SKILL_BASE = 6;

export const WORK_ENERGY = -14;
export const WORK_STRESS = 5;
export const WORK_SKILL_BASE = 3;
export const WORK_PROGRESS_BASE = 60;
export const WORK_PO_ON_PROGRESS = 1;
export const WORK_PO_ON_DONE = 2;
export const WORK_DEBT_ON_DONE = 2;

export const HELP_ENERGY = -8;
export const HELP_STRESS = 2;
export const HELP_TEAM_REP = 3;
export const HELP_SOFT_BASE = 3;
export const HELP_MORALE = 2;

export const END_DAY_ENERGY = 24;
export const END_DAY_STRESS_PER_BUG = 2;

export const INCIDENT_BASE_CHANCE = 0.01;
export const INCIDENT_DEBT_RATE = 0.0004;
export const INCIDENT_BUG_RATE = 0.005;
export const INCIDENT_STRESS = 8;
export const INCIDENT_PRESSURE = 5;
export const INCIDENT_SATISFACTION = -6;
export const INCIDENT_MORALE = -3;
export const INCIDENT_BUGS = 1;

export const WEEKEND_ENERGY = 16;
export const WEEKEND_STRESS = -8;
export const WEEKLY_CLOUD_DRIFT_CENTS = 80_00;

export const ENERGY_EFFICIENCY_DIVISOR = 200;
export const STRESS_EFFICIENCY_DIVISOR = 250;
export const DEBT_EFFICIENCY_DIVISOR = 200;

export const NIGHT_STRESS_RECOVERY = 10;
export const SKILL_PRODUCTIVITY_DIVISOR = 40;
export const REFACTOR_DEBT = 12;
export const FIX_BUGS = 2;
export const MAINTENANCE_ENERGY = -10;
export const DELIVERY_REWARD_CENTS = 120_000;
export const DELIVERY_REVENUE_CENTS = 30_000;
export const RUSH_MULTIPLIER = 1.6;
export const RUSH_DEBT = 8;
export const RUSH_BUGS = 1;
export const SPRINT_TARGET = 3;
export const SPRINT_BONUS_CENTS = 500_000;
export const PROMOTION_DELIVERIES = 3;
export const SALARIES_CENTS = [180_000, 350_000, 650_000, 1_100_000, 1_600_000, 2_200_000];
export const TASK_DEADLINE_DAYS = 10;
export const BACKLOG_CAP = 8;
export const MONTH_WORKDAYS = 20;
export const TEAM_PAYROLL_CENTS = 9_000_000;
export const EVENT_INTERVAL_DAYS = 3;
export const MORALE_PRODUCTIVITY_BASE = 0.85;
export const MORALE_PRODUCTIVITY_DIVISOR = 400;
export const LATE_REWARD_MULTIPLIER = 0.5;
export const DELIVERY_SATISFACTION = 2;
export const FIX_SATISFACTION = 3;
export const SPRINT_BOSS_SUCCESS = 6;
export const SPRINT_BOSS_MISS = -4;
export const SPRINT_PRESSURE_SUCCESS = -8;
export const SPRINT_PRESSURE_MISS = 5;

export const CAREER_BALANCE = {
  reviewDays: 40, reputationMin: 45, incidentRateMax: .4, leaderDebtMax: 60,
  leadershipActions: 1, carefulSpeed: .85, helpSpeed: 1.2, carefulDebt: -4,
  helpReputation: -3, helpLearning: 2, deferStress: -5, deferPo: -4,
  consequenceMinDays: 10, consequenceMaxDays: 30, debtRiskDivisor: 100,
  consequenceBugs: 1, consequenceStress: 8, consequenceSatisfaction: -5,
  xpDelivery: 30, xpStudy: 5, xpHelp: 8, xpRefactor: 8,
  decisionCap: 120, teamBaseProgress: 75, teamMoraleDivisor: 100,
  teamPressureSpeed: 1.4, teamProtectSpeed: .8, teamOverloadMorale: -5,
  teamNormalMorale: 1, teamTargetPoints: 8, teamSupportMorale: 5,
  burnoutDays: 3, crisisDays: 5, architectProofDays: 20,
  healthyDebt: 45, healthyBugs: 3, healthyMorale: 50,
  startupLevel: 3, startupIntegrity: 60, architectureCost: 300000,
  helpBoss: 1,
  rushDebt: 3, rushImmediateBugs: 0,
  initialIncidentRateMax: 1,
  teamFastTraitSpeed: 1.1, teamMentorMorale: 1, teamDeliveryPo: 2,
  teamSafeDebt: -1, teamDeliveryDebt: 2, teamOverloadDebt: 1,
  legacyEmployerThreshold: 100000,
  architectProofDeliveries: 6,
  modularDebt: -10, modularCloud: -.15, servicesDebt: 8,
  servicesCloud: .25, architectureDelay: 10, architectureCapacity: 1.25,
} as const;
