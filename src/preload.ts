import { contextBridge, ipcRenderer } from 'electron/renderer';

import type { AppPayload } from './types';

contextBridge.exposeInMainWorld('electron', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  loadProject: (path: string): Promise<AppPayload> =>
    ipcRenderer.invoke('load-project', path),
  saveProject: (path: string, payload: AppPayload): Promise<void> =>
    ipcRenderer.invoke('save-project', path, payload),
  addEventListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.addListener(channel, func);

    return () => {
      ipcRenderer.removeListener(channel, func);
    };
  },
  removeEventListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func);
  },
});
