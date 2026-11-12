import { useEffect, useRef } from 'react';
import { SKILL_IDS } from '../../engine';
import type { GameState, PlayerAction, SkillId } from '../../engine';
import { gameStore } from '../../store/useGameStore';
import { SKILL_LABELS } from '../copy';

interface ActionDockProps {
  state: GameState;
}

const dispatch = (action: PlayerAction): void => {
  gameStore.dispatchAction(action);
};

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLElement && target.isContentEditable);

export const ActionDock = ({ state }: ActionDockProps) => {
  const endDayRef = useRef<HTMLButtonElement>(null);
  const canAct = state.actionsLeft > 0;

  useEffect(() => {
    if (!canAct) endDayRef.current?.focus();
  }, [canAct, state.day]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;

      const key = event.key.toLowerCase();
      if (key === 't' && canAct) {
        event.preventDefault();
        dispatch({ type: 'work' });
      } else if (key === 'r' && canAct) {
        event.preventDefault();
        dispatch({ type: 'rest' });
      } else if (key === 'h' && canAct) {
        event.preventDefault();
        dispatch({ type: 'help' });
      } else if (key === 'e') {
        event.preventDefault();
        dispatch({ type: 'endDay' });
      } else if (['1', '2', '3', '4'].includes(key) && canAct) {
        const skill = SKILL_IDS[Number(key) - 1];
        if (skill) {
          event.preventDefault();
          dispatch({ type: 'study', skill });
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canAct]);

  return (
    <section className="actions" aria-labelledby="actions-title">
      <header className="panel-head">
        <span className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <h2 id="actions-title">Ações do dia</h2>
        <p className="actions-left">
          Restam <span className="num">{state.actionsLeft}</span>
        </p>
      </header>

      <div className="panel-body action-body">
        <div className="action-row" role="group" aria-label="Ações principais">
          <button
            type="button"
            disabled={!canAct}
            aria-keyshortcuts="T"
            onClick={() => dispatch({ type: 'work' })}
          >
            Trabalhar na task
          </button>
          <button
            type="button"
            disabled={!canAct}
            aria-keyshortcuts="R"
            onClick={() => dispatch({ type: 'rest' })}
          >
            Descansar
          </button>
          <button
            type="button"
            disabled={!canAct}
            aria-keyshortcuts="H"
            onClick={() => dispatch({ type: 'help' })}
          >
            Ajudar colega
          </button>
          <button
            ref={endDayRef}
            type="button"
            className={canAct ? 'btn-ghost' : 'btn-end'}
            aria-keyshortcuts="E"
            onClick={() => dispatch({ type: 'endDay' })}
          >
            Encerrar o dia
          </button>
        </div>

        <fieldset className="study-row" disabled={!canAct}>
          <legend>Estudar</legend>
          {SKILL_IDS.map((skill: SkillId, index) => (
            <button
              key={skill}
              type="button"
              className="btn-ghost"
              aria-keyshortcuts={String(index + 1)}
              onClick={() => dispatch({ type: 'study', skill })}
            >
              {index + 1}. {SKILL_LABELS[skill]}
            </button>
          ))}
        </fieldset>

        <p className="action-hint">
          Manhã e tarde: 2 ações. Depois encerre o dia. Teclado: T trabalho · R descanso · H
          ajuda · E encerra · 1–4 estudar.
        </p>
      </div>
    </section>
  );
};
