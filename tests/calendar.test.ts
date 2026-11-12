import { describe, expect, it } from 'vitest';
import { getCalendar } from '../src/engine';

describe('getCalendar', () => {
  it('maps day 1 to week 1, sprint 1, Monday', () => {
    expect(getCalendar(1)).toEqual({ day: 1, week: 1, sprint: 1, weekday: 1 });
  });

  it('rolls week after 5 workdays and sprint after 10', () => {
    expect(getCalendar(5)).toMatchObject({ week: 1, sprint: 1, weekday: 5 });
    expect(getCalendar(6)).toMatchObject({ week: 2, sprint: 1, weekday: 1 });
    expect(getCalendar(11)).toMatchObject({ week: 3, sprint: 2, weekday: 1 });
  });
});
