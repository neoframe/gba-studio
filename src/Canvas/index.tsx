import { InfiniteCanvas } from '@junipero/react';

import { useApp } from '../hooks';
import Scene from '../Scene';

const Canvas = () => {
  const { scenes } = useApp();

  return (
    <InfiniteCanvas className="w-screen h-screen select-none">
      <div className="flex items-start gap-8">
        { scenes.map(scene => (
          <Scene key={scene.name} scene={scene} />
        ))}
      </div>
    </InfiniteCanvas>
  );
};

export default Canvas;
