import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const isDev = () =>
  !!MAIN_WINDOW_VITE_DEV_SERVER_URL;

export const getResourcesDir = () => {
  if (isDev()) {
    return path.join(__dirname, '../../');
  } else {
    return process.resourcesPath;
  }
};
