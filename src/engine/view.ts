import type { GameContent, GameState, SkillId, TaskColumn } from './types';

export interface KanbanCard {
  id: number;
  title: string;
  skill: SkillId;
  difficulty: number;
  progress: number;
  column: TaskColumn;
}

export const getLevelTitle = (levelId: string, content: GameContent): string =>
  content.promotions.find((level) => level.levelId === levelId)?.title ?? levelId;

export const getKanbanCards = (state: GameState, content: GameContent): KanbanCard[] =>
  state.backlog.map((task) => {
    const definition = content.tasks.find((item) => item.id === task.taskId);
    return {
      id: task.id,
      title: definition?.title ?? task.taskId,
      skill: definition?.skill ?? 'code',
      difficulty: task.difficulty,
      progress: task.progress,
      column: task.column,
    };
  });
