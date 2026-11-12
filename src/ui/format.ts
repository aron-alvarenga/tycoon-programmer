import type { DeltaKey } from '../engine';

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const formatMoney = (cents: number): string => moneyFormatter.format(cents / 100);

export const formatSigned = (amount: number): string => (amount > 0 ? `+${amount}` : `${amount}`);

export const formatDelta = (key: DeltaKey, amount: number): string => {
  if (key === 'cloudCostCents' || key === 'cashCents') {
    const formatted = formatMoney(Math.abs(amount));
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatSigned(amount);
};

const UP_IS_GOOD: ReadonlySet<DeltaKey> = new Set([
  'energy',
  'code',
  'infra',
  'architecture',
  'softSkills',
  'boss',
  'team',
  'po',
  'teamMorale',
  'cashCents',
]);

export const deltaTone = (key: DeltaKey, amount: number): 'good' | 'bad' =>
  (amount > 0) === UP_IS_GOOD.has(key) ? 'good' : 'bad';

export const ratioPercent = (value: number, max: number): number =>
  max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
