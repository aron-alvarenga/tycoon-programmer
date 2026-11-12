import { CLOUD_COST_MAX_CENTS, PROD_BUGS_MAX, STAT_MAX } from '../../engine';
import type { DeltaKey, GameState, StatDelta } from '../../engine';
import { TOOLTIPS } from '../copy';
import { formatMoney } from '../format';
import { Panel } from './Panel';
import { StatBar } from './StatBar';

interface CompanyPanelProps {
  state: GameState;
  deltas: readonly StatDelta[];
  actionSeq: number;
}

const deltaOf = (deltas: readonly StatDelta[], key: DeltaKey): number | undefined =>
  deltas.find((item) => item.key === key)?.amount;

export const CompanyPanel = ({ state, deltas, actionSeq }: CompanyPanelProps) => (
  <Panel id="panel-company" title="Empresa" className="company">
    <StatBar
      label="Dívida técnica"
      value={state.company.techDebt}
      max={STAT_MAX}
      tooltip={TOOLTIPS.techDebt}
      tone="debt"
      deltaKey="techDebt"
      delta={deltaOf(deltas, 'techDebt')}
      actionSeq={actionSeq}
    />
    <StatBar
      label="Bugs em produção"
      value={state.company.prodBugs}
      max={PROD_BUGS_MAX}
      displayValue={`${state.company.prodBugs}/${PROD_BUGS_MAX}`}
      tooltip={TOOLTIPS.prodBugs}
      tone="bugs"
      deltaKey="prodBugs"
      delta={deltaOf(deltas, 'prodBugs')}
      actionSeq={actionSeq}
    />
    <StatBar
      label="Custo de cloud"
      value={state.company.cloudCostCents}
      max={CLOUD_COST_MAX_CENTS}
      displayValue={`${formatMoney(state.company.cloudCostCents)}/mês`}
      tooltip={TOOLTIPS.cloudCostCents}
      tone="cloud"
      deltaKey="cloudCostCents"
      delta={deltaOf(deltas, 'cloudCostCents')}
      actionSeq={actionSeq}
    />
    <StatBar
      label="Moral do time"
      value={state.company.teamMorale}
      max={STAT_MAX}
      tooltip={TOOLTIPS.teamMorale}
      tone="morale"
      deltaKey="teamMorale"
      delta={deltaOf(deltas, 'teamMorale')}
      actionSeq={actionSeq}
    />
    <StatBar
      label="Pressão do investidor"
      value={state.company.investorPressure}
      max={STAT_MAX}
      tooltip={TOOLTIPS.investorPressure}
      tone="pressure"
      deltaKey="investorPressure"
      delta={deltaOf(deltas, 'investorPressure')}
      actionSeq={actionSeq}
    />
  </Panel>
);
