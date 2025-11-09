import path from 'node:path';

import fse from 'fs-extra';

import pkg from '../package.json' with { type: 'json' };

function getVendorsPath (buildPath: string, platform: string) {
  switch (platform) {
    case 'darwin':
    case 'mas':
      return path.join(buildPath,
        pkg.executableName + '.app/Contents/Resources/public/vendors');
    case 'win32':
      return path.join(buildPath, 'resources/public/vendors');
    case 'linux':
      return path.join(buildPath, 'public/vendors');
    default:
      return buildPath;
  }
}

export default function removeVendorsPlugin (
  buildPath: string,
  electronVersion: string,
  platform: string,
  arch: string,
  next: (err: Error | null) => void
) {
  const vendorsPath = getVendorsPath(buildPath, platform);

  // Butano
  [
    'butano/common',
    'butano/credits',
    'butano/docs',
    'butano/docs_tools',
    'butano/examples',
    'butano/games',
    'butano/issues',
    'butano/template',
    'butano/tests',
    'butano/.gitignore',
    'butano/README.md',
  ].forEach(dir => {
    try {
      fse.removeSync(path.join(vendorsPath, dir));
    } catch {}
  });

  next(null);
}
