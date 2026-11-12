import { useState } from 'react';
import { getCalendar, getLevelTitle } from '../../engine';
import type { GameState } from '../../engine';
import { gameContent } from '../../data/content';
import { gameStore, useGameStore } from '../../store/useGameStore';
import { LOAD_ERROR_MESSAGES, TOOLTIPS, WEEKDAY_LABELS } from '../copy';
import { formatMoney } from '../format';

interface TopBarProps {
  state: GameState;
}

export const TopBar = ({ state }: TopBarProps) => {
  const { lastLoadError } = useGameStore();
  const [status, setStatus] = useState<string | null>(null);
  const calendar = getCalendar(state.day);
  const weekday = WEEKDAY_LABELS[calendar.weekday - 1] ?? 'Segunda';
  const title = getLevelTitle(state.levelId, gameContent);

  const handleSave = () => {
    setStatus(gameStore.saveGame() ? 'Salvo. Diferente daquele PR de 2000 linhas.' : null);
  };

  const handleLoad = () => {
    setStatus(gameStore.loadGame() ? 'Carreira carregada.' : null);
  };

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div>
          <p className="topbar-company">Programmer Simulator · estúdio</p>
          <p className="topbar-role">{title}</p>
        </div>
      </div>

      <p className="topbar-calendar" aria-label={`${weekday}, dia ${calendar.day}, semana ${calendar.week}, sprint ${calendar.sprint}`}>
        <span className="num">{weekday}</span>
        <span aria-hidden="true"> · </span>
        Dia <span className="num">{calendar.day}</span>
        <span aria-hidden="true"> · </span>
        Sem <span className="num">{calendar.week}</span>
        <span aria-hidden="true"> · </span>
        Sprint <span className="num">{calendar.sprint}</span>
      </p>

      <dl className="topbar-money">
        <div title={TOOLTIPS.salaryCents}>
          <dt>Salário</dt>
          <dd className="num">{formatMoney(state.player.salaryCents)}</dd>
        </div>
        <div title={TOOLTIPS.cashCents}>
          <dt>Caixa</dt>
          <dd className="num">{formatMoney(state.company.cashCents)}</dd>
        </div>
      </dl>

      <div className="topbar-actions">
        <button type="button" className="btn-ghost" onClick={handleSave}>
          Salvar
        </button>
        <button type="button" className="btn-ghost" onClick={handleLoad}>
          Carregar
        </button>
      </div>
      {(status || lastLoadError) && (
        <p className={lastLoadError ? 'error topbar-status' : 'topbar-status'} role="status">
          {lastLoadError ? LOAD_ERROR_MESSAGES[lastLoadError] : status}
        </p>
      )}
    </header>
  );
};
