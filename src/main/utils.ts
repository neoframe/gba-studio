import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const isDev = () =>
  !!MAIN_WINDOW_VITE_DEV_SERVER_URL;

export const getResourcesDir = () => {
  if (isDev()) {
    const url = path.join(__dirname, '../../');

    if (process.platform === 'win32') {
      return url.slice(1).replaceAll('\\', '/');
    } else {
      return url;
    }
  } else {
    return process.resourcesPath;
  }
};
