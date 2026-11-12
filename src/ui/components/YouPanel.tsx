import { REPUTATION_IDS, SKILL_IDS, STAT_MAX } from '../../engine';
import type { DeltaKey, GameState, StatDelta } from '../../engine';
import { REPUTATION_LABELS, SKILL_LABELS, TOOLTIPS } from '../copy';
import { Panel } from './Panel';
import { StatBar } from './StatBar';

interface YouPanelProps {
  state: GameState;
  deltas: readonly StatDelta[];
  actionSeq: number;
}

const deltaOf = (deltas: readonly StatDelta[], key: DeltaKey): number | undefined =>
  deltas.find((item) => item.key === key)?.amount;

const SKILL_TONES: Record<string, string> = {
  code: 'skill',
  infra: 'skill',
  architecture: 'skill',
  softSkills: 'skill',
};

export const YouPanel = ({ state, deltas, actionSeq }: YouPanelProps) => (
  <Panel id="panel-you" title="Você" className="you">
    <StatBar
      label="Energia"
      value={state.player.energy}
      max={STAT_MAX}
      tooltip={TOOLTIPS.energy}
      tone="energy"
      deltaKey="energy"
      delta={deltaOf(deltas, 'energy')}
      actionSeq={actionSeq}
    />
    <StatBar
      label="Estresse"
      value={state.player.stress}
      max={STAT_MAX}
      tooltip={TOOLTIPS.stress}
      tone="stress"
      deltaKey="stress"
      delta={deltaOf(deltas, 'stress')}
      actionSeq={actionSeq}
    />

    <h3 className="panel-kicker">Skills</h3>
    {SKILL_IDS.map((skill) => (
      <StatBar
        key={skill}
        label={SKILL_LABELS[skill]}
        value={state.player.skills[skill]}
        max={STAT_MAX}
        tooltip={TOOLTIPS[skill]}
        tone={SKILL_TONES[skill] ?? 'skill'}
        deltaKey={skill}
        delta={deltaOf(deltas, skill)}
        actionSeq={actionSeq}
      />
    ))}

    <h3 className="panel-kicker">Reputação</h3>
    {REPUTATION_IDS.map((rep) => (
      <StatBar
        key={rep}
        label={REPUTATION_LABELS[rep]}
        value={state.player.reputation[rep]}
        max={STAT_MAX}
        tooltip={TOOLTIPS[rep]}
        tone="rep"
        deltaKey={rep}
        delta={deltaOf(deltas, rep)}
        actionSeq={actionSeq}
      />
    ))}
  </Panel>
);
