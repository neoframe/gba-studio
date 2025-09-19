import { Card, Moveable } from '@junipero/react';

import type { GameScene } from '../types';

export interface SceneProps {
  scene: GameScene;
}

const Scene = ({
  scene,
}: SceneProps) => {
  return (
    <Moveable>
      <div>
        <Card
          style={{
            width: Math.max(240,
              (scene.map?.width || 0) * (scene.map?.gridSize || 16)),
            height: Math.max(160,
              (scene.map?.height || 0) * (scene.map?.gridSize || 16)),
          }}
        >
          { scene.name }
        </Card>
      </div>
    </Moveable>
  );
};

export default Scene;
