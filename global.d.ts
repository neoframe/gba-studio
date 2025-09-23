/// <reference types="electron" />
/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="./src/types.ts" />

interface Window {
  electron: {
    openFileDialog: () => Promise<string>;
    loadProject: (path: string) => Promise<AppPayload>;
    saveProject: (path: string, payload: AppPayload) => Promise<void>;
  };
};
