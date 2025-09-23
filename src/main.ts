import path from 'node:path';
import fs from 'node:fs/promises';
import url from 'node:url';

import {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  nativeTheme,
  net,
  protocol,
  session,
} from 'electron';
import started from 'electron-squirrel-startup';

import type { AppPayload, GameProject, GameScene, GameVariables } from './types';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

if (started) {
  app.quit();
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'project', privileges: { bypassCSP: true } },
]);

const createSelectionWindow = () => {
  const win = new BrowserWindow({
    width: 500,
    height: 400,
    backgroundColor: nativeTheme.shouldUseDarkColors
      ? '#121212' : '#FFFFFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    url.searchParams.set('theme',
      nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

    win.loadURL(url.toString());
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { query: {
        theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      } },
    );
  }
};

const createProjectWindow = (projectPath: string) => {
  const projectName = path.basename(projectPath, '.gbasproj');
  const ses = session.fromPartition(projectName);

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#121212' : '#FFFFFF',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      partition: projectName,
    },
  });

  ses.protocol.handle('project', req => {
    const filePath = req.url.replace('project://', '');

    return net.fetch(url.pathToFileURL(path
      .join(path.dirname(projectPath), filePath)).toString());
  });

  win.on('close', () => {
    ses.protocol.unhandle('project');
  });

  win.maximize();
  win.show();

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);

    url.searchParams.set('projectPath', projectPath);
    url.searchParams.set('projectBase', path.dirname(projectPath));
    url.searchParams.set('theme',
      nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

    win.loadURL(url.toString());
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { query: {
        projectPath,
        projectBase: path.dirname(projectPath),
        theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      } },
    );
  }
};

app.whenReady().then(() => {
  createSelectionWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createSelectionWindow();
  }
});

ipcMain.handle('open-file-dialog', async () => {
  const paths = await dialog.showOpenDialog({
    properties: ['openDirectory', 'openFile'],
  });

  if (!paths.filePaths[0]) {
    return;
  }

  const stats = await fs.stat(paths.filePaths[0]);

  if (stats.isDirectory()) {
    const projectFile = await fs
      .readdir(paths.filePaths[0])
      .then(files => files.find(file => file.endsWith('.gbasproj')));

    if (projectFile) {
      createProjectWindow(path.join(paths.filePaths[0], projectFile));
    }
  } else if (stats.isFile() && paths.filePaths[0].endsWith('.gbasproj')) {
    createProjectWindow(paths.filePaths[0]);
  }
});

const getDataFiles = async (
  base: string,
  cond: (file: string) => boolean = () => true
) => {
  return (await fs
    .readdir(path.join(base, 'data')))
    .filter(file => cond(file));
};

ipcMain.handle('load-project', async (event, projectPath: string) => {
  const projectDir = path.dirname(projectPath);

  const win = BrowserWindow.fromWebContents(event.sender);
  win?.setProgressBar(0);

  let current = 0;
  let total = 1;

  // Load project config
  const project: GameProject = JSON.parse(await fs
    .readFile(projectPath, 'utf-8'));
  current++;
  win?.setProgressBar(current / total);

  // Prepare variables
  const variableFiles = await getDataFiles(
    projectDir,
    file =>
      file.startsWith('variables_') &&
      file.endsWith('.json') &&
      file !== 'variables_default.json'
  );
  total += variableFiles.length;

  // Prepare scenes
  const sceneFiles = await getDataFiles(
    projectDir,
    file =>
      file.startsWith('scene_') &&
      file.endsWith('.json') &&
      !file.endsWith('.map.json') &&
      file !== 'scene_default.json'
  );
  total += sceneFiles.length;

  // Load variables
  const variables: GameVariables[] = [];

  for (const file of variableFiles) {
    const registry = JSON
      .parse(await fs.readFile(path.join(projectDir, 'data', file), 'utf-8'));
    variables.push({ _file: file, values: registry });
  }

  current++;
  win?.setProgressBar(current / total);

  // Load scenes
  const scenes: GameScene[] = [];

  for (const file of sceneFiles) {
    const scene: GameScene = JSON.parse(await fs
      .readFile(path.join(projectDir, 'data', file), 'utf-8'));

    scene._file = file;

    // Eventually load map
    try {
      const mapFile = file.replace('.json', '.map.json');
      await fs.access(path.join(projectDir, 'data', mapFile));

      scene.map = JSON.parse(await fs
        .readFile(path.join(projectDir, 'data', mapFile), 'utf-8'));
      scene.map!._file = mapFile;
    } catch {}

    current++;
    win?.setProgressBar(current / total);
    scenes.push(scene);
  }

  win?.setProgressBar(-1);

  return {
    project,
    scenes,
    variables,
  } as AppPayload;
});

ipcMain.handle('save-project', async (
  _,
  projectPath: string,
  data: AppPayload
) => {
  const projectDir = path.dirname(projectPath);

  // Save project config
  await fs.writeFile(projectPath,
    JSON.stringify(data.project || {}, null, 2) + '\n', 'utf-8');

  // Save variables
  for (const variableSet of data.variables || []) {
    if (variableSet._file) {
      const fileName = variableSet._file;
      delete variableSet._file;

      await fs.writeFile(path.join(projectDir, 'data', fileName),
        JSON.stringify(variableSet.values, null, 2) + '\n', 'utf-8');
    }
  }

  // Save scenes
  for (const scene of data.scenes || []) {
    if (scene.map?._file) {
      const fileName = scene.map._file;
      delete scene.map._file;

      await fs.writeFile(path.join(projectDir, 'data', fileName),
        JSON.stringify(scene.map, null, 2) + '\n', 'utf-8');

      delete scene.map;
    }

    if (scene._file) {
      const fileName = scene._file;
      delete scene._file;

      await fs.writeFile(path.join(projectDir, 'data', fileName),
        JSON.stringify(scene, null, 2) + '\n', 'utf-8');
    }
  }
});
