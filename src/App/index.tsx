import { useCallback, useEffect, useLayoutEffect, useReducer } from 'react';
import { mockState } from '@junipero/react';

import '@junipero/theme/dist/junipero.min.css';

import type { GameScene } from '../types';
import { AppContext } from '../contexts';
import { useQuery } from '../hooks';
import Canvas from '../Canvas';
import ProjectSelection from '../ProjectSelection';

export interface AppState {
  currentProject?: string;
  theme: string;
  scenes: GameScene[];
  loading: boolean;
  ready: boolean;
}

const App = () => {
  const { projectPath, theme } = useQuery();
  const [state, dispatch] = useReducer(mockState<AppState>, {
    theme,
    currentProject: projectPath,
    loading: true,
    ready: false,
    scenes: [],
  });

  useLayoutEffect(() => {
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    document.querySelector('html')?.classList.remove('light', 'dark');
    document.querySelector('html')?.classList.add(preferred);
  }, []);

  useEffect(() => {
    if (state.ready) {
      return;
    }

    init();
  }, [projectPath]);

  const init = async () => {
    if (projectPath) {
      const scenes = await window.electron.loadScenes(projectPath);
      dispatch({ scenes, loading: false, ready: true });
    }
  };

  const getContext = useCallback(() => ({
    scenes: state.scenes,
  }), [state.scenes]);

  return (
    <AppContext.Provider value={getContext()}>
      { projectPath ? (
        <Canvas />
      ) : (
        <ProjectSelection />
      ) }
    </AppContext.Provider>
  );
};

export default App;
