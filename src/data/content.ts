import events from './events.json';
import tasks from './tasks.json';
import promotions from './promotions.json';
import team from './team.json';
import lines from './lines.json';
import { parseContent } from './schema';

export const gameContent = parseContent({ events, tasks, promotions, team, lines });
