import { createContext } from 'react';

import type { GameScene } from './types';

export interface AppContext {
  scenes: GameScene[];
};

export const AppContext = createContext<AppContext>({
  scenes: [],
});
