/// <reference types="electron" />
/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="./src/types.ts" />

interface AppBridge extends EventTarget {
  addEventListener(
    channel: string,
    func: ((...args: any[]) => void)
  ): void;
  removeEventListener(
    channel: string,
    func: ((...args: any[]) => void)
  ): void;

  openFileDialog(): Promise<string>;
  loadProject(path: string): Promise<AppPayload>;
  saveProject(path: string, payload: AppPayload): Promise<void>;
}

interface Window {
  electron: AppBridge;
};
