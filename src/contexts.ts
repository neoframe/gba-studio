import { createContext } from 'react';

import type {
  GameActor,
  GameProject,
  GameScene,
  GameSensor,
  GameVariables,
  ToolType,
} from './types';

export interface AppContextType {
  scenes: GameScene[];
  project?: GameProject;
  variables: GameVariables[];
  projectPath: string;
  projectBase: string;
  dirty: boolean;
};

export const AppContext = createContext<AppContextType>({
  scenes: [],
  variables: [],
  projectPath: '',
  projectBase: '',
  dirty: false,
});

export interface CanvasContextType {
  selectedScene?: GameScene;
  selectedItem?: GameActor | GameSensor;
  tool: ToolType;
};

export const CanvasContext = createContext<CanvasContextType>({
  tool: 'move',
});
