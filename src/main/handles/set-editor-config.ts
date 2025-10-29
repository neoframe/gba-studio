import type { IpcMainInvokeEvent } from 'electron';

import type { AppStorage } from '../../types';
import Storage from '../storage';

export default async (
  storage: Storage,
  _: IpcMainInvokeEvent,
  data: AppStorage
) => {
  storage.config = data;
  storage.save();
};
