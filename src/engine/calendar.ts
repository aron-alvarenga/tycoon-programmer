import { DAYS_PER_WEEK, WEEKS_PER_SPRINT } from './balance';

export interface Calendar {
  day: number;
  week: number;
  sprint: number;
  weekday: number;
}

/** 1 dia = 1 turno · 1 semana = 5 dias úteis · 1 sprint = 2 semanas. */
export const getCalendar = (day: number): Calendar => {
  const index = Math.max(0, day - 1);
  return {
    day,
    weekday: (index % DAYS_PER_WEEK) + 1,
    week: Math.floor(index / DAYS_PER_WEEK) + 1,
    sprint: Math.floor(index / (DAYS_PER_WEEK * WEEKS_PER_SPRINT)) + 1,
  };
};
