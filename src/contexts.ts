import { createContext } from 'react';

import type { GameProject, GameScene, GameVariables } from './types';

export interface AppContextType {
  scenes: GameScene[];
  project?: GameProject;
  variables: GameVariables[];
  projectPath: string;
  projectBase: string;
};

export const AppContext = createContext<AppContextType>({
  scenes: [],
  variables: [],
  projectPath: '',
  projectBase: '',
});

export interface CanvasContextType {
  selected?: GameScene;
};

export const CanvasContext = createContext<CanvasContextType>({});
