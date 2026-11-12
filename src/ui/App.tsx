import { useGameStore } from '../store/useGameStore';
import { TitleScreen } from './components/TitleScreen';
import { Workspace } from './components/Workspace';

export const App = () => {
  const { state, lastLoadError, lastDeltas, actionSeq } = useGameStore();

  if (!state) {
    return <TitleScreen lastLoadError={lastLoadError} />;
  }

  return <Workspace state={state} lastDeltas={lastDeltas} actionSeq={actionSeq} />;
};
