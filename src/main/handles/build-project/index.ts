import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';

import type { IpcMainInvokeEvent } from 'electron';
import fse from 'fs-extra';

import type { AppPayload, Build } from '../../../types';
import { getResourcesDir } from '../../utils';
import {
  runCommand,
  sendAbort,
  sendError,
  sendLog,
  sendStep,
  sendSuccessLog,
} from './utils';
import { buildTemplates } from './templates';
import Storage from '../../storage';

const builds = new Map<string, Build>();
let latestBuildId: string | null = null;

const getBuildConfiguration = (
  storage: Storage,
  build: Build,
) => {
  const confName = storage.config?.buildConfiguration || 'default';

  if (confName === 'default') {
    return build?.data?.project?.settings;
  }

  return build?.data?.project?.configurations?.find(conf =>
    conf.id === confName
  )?.settings;
};

const getPythonPath = (
  storage: Storage,
  build: Build,
) => {
  const projectSettings = getBuildConfiguration(storage, build);

  return projectSettings?.pythonPath ||
    (process.platform === 'darwin' ? 'python3' : 'python');
};

async function checkGit (
  storage: Storage,
  event: IpcMainInvokeEvent,
  build: Build,
) {
  if (build.controller.signal.aborted) {
    return;
  }

  const projectSettings = getBuildConfiguration(storage, build);

  sendStep(event, build.id, 'Checking project configuration...');
  sendLog(event, build.id, 'Verifying Git repository...');

  try {
    await runCommand(projectSettings?.gitPath || 'git', ['status'], {
      cwd: path.dirname(build.projectPath),
      event,
      build,
      log: false,
      logErrors: false,
    });

    sendSuccessLog(event, build.id,
      'Git repository found, skipping initialization');
  } catch (e) {
    if ((e as Error).message.includes('not a git repository')) {
      sendStep(event, build.id, 'Initializing project...');
      sendLog(event, build.id, 'Initializing Git repository...');

      await runCommand(projectSettings?.gitPath || 'git', ['init'], {
        cwd: path.dirname(build.projectPath),
        event,
        build,
      });
    } else {
      throw e;
    }
  }
}

async function checkButano (
  storage: Storage,
  event: IpcMainInvokeEvent,
  build: Build,
) {
  if (build.controller.signal.aborted) {
    return;
  }

  const projectSettings = getBuildConfiguration(storage, build);

  sendLog(event, build.id, 'Verifying Butano submodule status...');

  // Check if Butano submodule is initialized
  const submodules = await runCommand(
    projectSettings?.gitPath || 'git',
    ['submodule', 'status'],
    {
      cwd: path.dirname(build.projectPath),
      event,
      build,
    }
  );

  if (submodules.includes('butano')) {
    sendSuccessLog(event, build.id, 'Butano submodule is up-to-date, skipping');

    return;
  }

  // Initialize Butano submodule
  await runCommand(projectSettings?.gitPath || 'git', [
    'submodule', 'add', 'https://github.com/GValiente/butano.git',
  ], {
    cwd: path.dirname(build.projectPath),
    event,
    build,
  });

  sendSuccessLog(event, build.id, 'Butano submodule initialized');
}

async function checkPython (
  storage: Storage,
  event: IpcMainInvokeEvent,
  build: Build,
) {
  if (build.controller.signal.aborted) {
    return;
  }

  const command = getPythonPath(storage, build);

  sendLog(event, build.id, 'Checking Python...');

  const version = await runCommand(command, ['--version'], {
    cwd: path.dirname(build.projectPath),
    event,
    build,
  });

  sendSuccessLog(event, build.id, 'Python found: ' + version.trim());
}

async function checkDependencies (
  storage: Storage,
  event: IpcMainInvokeEvent,
  build: Build,
) {
  if (build.controller.signal.aborted) {
    return;
  }

  sendStep(event, build.id, 'Checking project dependencies...');

  await checkButano(storage, event, build);
  await checkPython(storage, event, build);
}

async function checkTemplates (event: IpcMainInvokeEvent, build: Build) {
  if (build.controller.signal.aborted) {
    return;
  }

  sendStep(event, build.id, 'Updating project\'s core files...');
  sendLog(event, build.id, 'Updating core files from common template...');

  // Copy includes
  await fse.copy(
    path.join(getResourcesDir(), './public/templates/commons/include'),
    path.join(path.dirname(build.projectPath), 'include'),
    { overwrite: true, errorOnExist: false }
  );
  sendSuccessLog(event, build.id, 'include/ folder updated');

  // Copy src
  await fse.copy(
    path.join(getResourcesDir(), './public/templates/commons/src'),
    path.join(path.dirname(build.projectPath), 'src'),
    { overwrite: true, errorOnExist: false }
  );
  sendSuccessLog(event, build.id, 'src/ folder updated');

  // Copy templates
  await fse.copy(
    path.join(getResourcesDir(), './public/templates/commons/templates'),
    path.join(path.dirname(build.projectPath), 'templates'),
    { overwrite: true, errorOnExist: false }
  );
  sendSuccessLog(event, build.id, 'templates/ folder updated');

  // Copy graphics
  await fse.copy(
    path.join(getResourcesDir(), './public/templates/commons/graphics'),
    path.join(path.dirname(build.projectPath), 'graphics'),
    { overwrite: true, errorOnExist: false }
  );
  sendSuccessLog(event, build.id, 'graphics/ folder updated');
}

async function buildProject (
  storage: Storage,
  event: IpcMainInvokeEvent,
  build: Build,
) {
  if (build.controller.signal.aborted) {
    return;
  }

  sendStep(event, build.id, 'Pre-building templates...');
  await buildTemplates(event, build);

  sendStep(event, build.id, 'Building project...');
  sendLog(event, build.id, 'Building project...');

  const pythonPath = getPythonPath(storage, build);

  await runCommand('make', [], {
    cwd: path.dirname(build.projectPath),
    event,
    build,
  }, {
    env: {
      ...process.env,
      PYTHON: pythonPath,
      ROMTITLE: build.data?.project?.romName || 'My Game',
      ROMCODE: build.data?.project?.romCode || 'ABCD',
    },
  });

  sendSuccessLog(event, build.id, 'Project built successfully 🎉');

  // Check for built .gba file
  const builtGbaPath = path.join(
    path.dirname(build.projectPath),
    path.basename(path.dirname(build.projectPath)) + '.gba'
  );

  try {
    await fs.access(builtGbaPath);
  } catch (e) {
    sendError(event, build.id, `Built .gba file not found: ${builtGbaPath}`);
    sendError(event, build.id, (e as Error).message);
    build.controller.abort();
    sendAbort(event, build.id);
  }

  const projectSettings = getBuildConfiguration(storage, build);

  const [command, ...args] = (
    projectSettings?.emulatorCommand || 'open -a mGBA'
  ).split(
    // Take spaces in folders into account
    /\s+(?=(?:[^'"]*['"][^'"]*['"])*[^'"]*$)/gm
  );

  const runner = spawn(command, [
    ...args,
    builtGbaPath,
  ], { stdio: 'inherit', shell: true });

  runner.unref();
}

async function startBuild (
  storage: Storage,
  event: IpcMainInvokeEvent,
  build: Build,
) {
  try {
    await checkGit(storage, event, build);
    await checkDependencies(storage, event, build);
    await checkTemplates(event, build);

    if (build.controller.signal.aborted) {
      return;
    }

    await buildProject(storage, event, build);

    event.sender.send('build-completed', build.id);
  } catch (e) {
    if (build.controller.signal.aborted) {
      sendAbort(event, build.id);
    } else {
      sendError(event, build.id, (e as Error).message);
    }
  }
}

export function startBuildProject (
  storage: Storage,
  event: IpcMainInvokeEvent,
  projectPath: string,
  data?: Partial<AppPayload>,
) {
  const buildId = randomUUID();
  latestBuildId = buildId;
  const controller = new AbortController();
  const build: Build = { id: buildId, projectPath, controller, data };

  builds.set(buildId, build);
  event.sender.send('build-started', { id: buildId });
  startBuild(storage, event, build);

  return buildId;
}

export function abortBuildProject (
  event: IpcMainInvokeEvent,
  buildId?: string
) {
  const controller = builds.get(buildId || latestBuildId || '')?.controller;

  if (controller) {
    controller.abort();
  }

  event.sender.send('build-aborted', { id: buildId });
}
