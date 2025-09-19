/// <reference types="electron" />
/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="./src/types.ts" />

interface Window {
  electron: {
    openFileDialog: () => Promise<string>;
    loadScenes: (path: string) => Promise<GameScene[]>;
    loadMap: (path: string) => Promise<GameMap>;
  };
};
