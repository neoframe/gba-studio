import path from 'node:path';

import type { IpcMainInvokeEvent } from 'electron';

export default function (_: IpcMainInvokeEvent, projectPath: string) {
  return path.join(
    'out',
    path.basename(projectPath, path.extname(projectPath)) + '.gba'
  );
}
