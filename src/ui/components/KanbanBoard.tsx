import { TASK_COLUMNS, getKanbanCards } from '../../engine';
import type { GameState, KanbanCard, TaskColumn } from '../../engine';
import { gameContent } from '../../data/content';
import { COLUMN_EMPTY, COLUMN_LABELS, SKILL_LABELS } from '../copy';
import { Panel } from './Panel';

interface KanbanBoardProps {
  state: GameState;
}

const Difficulty = ({ value }: { value: number }) => (
  <span className="task-diff" aria-label={`dificuldade ${value} de 5`}>
    {Array.from({ length: 5 }, (_, index) => (
      <i key={index} className={index < value ? 'on' : undefined} />
    ))}
  </span>
);

const TaskCard = ({ card }: { card: KanbanCard }) => (
  <article className="task-card">
    <p className="task-title">{card.title}</p>
    <div className="task-meta">
      <span className="task-skill">{SKILL_LABELS[card.skill]}</span>
      <Difficulty value={card.difficulty} />
    </div>
    {card.column === 'doing' && (
      <div
        className="task-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={card.progress}
        aria-label={`Progresso ${card.progress}%`}
      >
        <span style={{ width: `${card.progress}%` }} />
      </div>
    )}
  </article>
);

const Column = ({ column, cards }: { column: TaskColumn; cards: KanbanCard[] }) => {
  const items = cards.filter((card) => card.column === column);
  return (
    <div className="kanban-column">
      <h3>
        {COLUMN_LABELS[column]} <span className="num">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="kanban-empty">{COLUMN_EMPTY[column]}</p>
      ) : (
        <ul className="task-list">
          {items.map((card) => (
            <li key={card.id}>
              <TaskCard card={card} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const KanbanBoard = ({ state }: KanbanBoardProps) => {
  const cards = getKanbanCards(state, gameContent);
  return (
    <Panel id="panel-kanban" title="Quadro de tasks" className="kanban">
      <div className="kanban-columns">
        {TASK_COLUMNS.map((column) => (
          <Column key={column} column={column} cards={cards} />
        ))}
      </div>
    </Panel>
  );
};
