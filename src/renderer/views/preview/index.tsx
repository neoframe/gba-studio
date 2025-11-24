import { useCallback, useEffect, useRef, useState } from 'react';
import mGBA, { type mGBAEmulator } from '@thenick775/mgba-wasm';

import { useApp } from '../../services/hooks';
import ConstrainedView from '../../windows/editor/ConstrainedView';

const Preview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emulator, setEmulator] = useState<mGBAEmulator | null>(null);
  const { projectPath } = useApp();
  const scale = 3;

  const init = useCallback(async () => {
    if (!canvasRef.current) {
      return;
    }

    const module = await mGBA({ canvas: canvasRef.current });
    // eslint-disable-next-line new-cap
    await module.FSInit();
    module.setCoreSettings({
      autoSaveStateEnable: false,
      restoreAutoSaveStateOnLoad: false,
      videoSync: true,
    });
    const romPath = await window.electron.getRomPath(projectPath);
    const file = await fetch(`project://${romPath}`);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await new Promise(resolve => {
      module.uploadRom(new File([uint8Array], 'game.gba'), () => {
        // eslint-disable-next-line new-cap
        module.FSSync();
        module.loadGame('/data/games/game.gba');
        module.quickReload();
        module.resumeGame();
        resolve(true);
      });
    });

    setEmulator(module);

    return module;
  }, [projectPath]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    return () => {
      emulator?.quitGame();
    };
  }, [emulator]);

  return (
    <ConstrainedView>
      <div
        className="min-h-full w-full flex-auto flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="bg-black rounded-lg pixelated"
          style={{ width: 240 * scale, height: 160 * scale }}
          onClick={() => emulator ? emulator.resumeGame() : init()}
        />
      </div>
    </ConstrainedView>
  );
};

export default Preview;
