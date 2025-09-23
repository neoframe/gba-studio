import { useCallback, useEffect, useLayoutEffect, useReducer } from 'react';
import { Theme } from '@radix-ui/themes';
import { type MoveableState, mockState } from '@junipero/react';
import { useHotkeys } from 'react-hotkeys-hook';

import type { GameProject, GameScene, GameVariables } from '../types';
import { type AppContextType, AppContext } from '../contexts';
import { useQuery } from '../hooks';
import Canvas from '../Canvas';
import ProjectSelection from '../ProjectSelection';

export interface AppState {
  projectBase: string;
  theme: string;
  scenes: GameScene[];
  variables: GameVariables[];
  loading: boolean;
  ready: boolean;
  dirty: boolean;
  project?: GameProject;
}

const App = () => {
  const { projectPath, projectBase, theme } = useQuery();
  const [state, dispatch] = useReducer(mockState<AppState>, {
    theme,
    projectBase,
    loading: true,
    ready: false,
    scenes: [],
    variables: [],
    project: undefined,
    dirty: false,
  });

  useLayoutEffect(() => {
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    document.querySelector('html')?.classList.remove('light', 'dark');
    document.querySelector('html')?.classList.add(preferred);
  }, []);

  const init = useCallback(async () => {
    if (projectPath) {
      const data = await window.electron.loadProject(projectPath);
      dispatch({ ...data, loading: false, ready: true });
    }
  }, [projectPath]);

  useEffect(() => {
    if (state.ready) {
      return;
    }

    init();
  }, [state.ready, init]);

  const save = useCallback(async () => {
    if (projectPath) {
      await window.electron.saveProject(projectPath, {
        project: state.project,
        scenes: state.scenes,
        variables: state.variables,
      });
    }
  }, [projectPath, state.project, state.scenes, state.variables]);

  useHotkeys('mod+s', e => {
    e.preventDefault();

    if (state.dirty) {
      save();
      dispatch({ dirty: false });
    }
  }, [state.dirty, save]);

  const onMoveScene = useCallback((scene: GameScene, e: MoveableState) => {
    dispatch(s => {
      const foundScene = s.project?.scenes
        ?.find(sc => sc._file === scene._file);

      if (foundScene) {
        foundScene.x = Math.round(e.deltaX || 0);
        foundScene.y = Math.round(e.deltaY || 0);
      } else if (s.project && scene._file) {
        s.project.scenes = s.project.scenes || [];
        s.project.scenes.push({
          _file: scene._file,
          x: Math.round(e.deltaX || 0),
          y: Math.round(e.deltaY || 0),
        });
      }

      return { ...s, dirty: true };
    });
  }, []);

  const getContext = useCallback((): AppContextType => ({
    project: state.project,
    scenes: state.scenes,
    variables: state.variables,
    projectPath: projectPath || '',
    projectBase: state.projectBase,
  }), [
    projectPath,
    state.scenes, state.projectBase, state.variables, state.project,
  ]);

  return (
    <Theme>
      <AppContext.Provider value={getContext()}>
        { projectPath ? (
          <Canvas
            onMoveScene={onMoveScene}
          />
        ) : (
          <ProjectSelection />
        ) }
      </AppContext.Provider>
    </Theme>
  );
};

export default App;
