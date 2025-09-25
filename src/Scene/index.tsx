import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  useCallback,
  useMemo,
} from 'react';
import {
  type MoveableState,
  Moveable,
  classNames,
  useInfiniteCanvas,
} from '@junipero/react';
import { Card } from '@radix-ui/themes';

import type { GameScene } from '../types';
import { useApp, useCanvas } from '../hooks';

export interface SceneProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect' | 'onChange'> {
  scene: GameScene;
  onChange?: (scene: GameScene) => void;
  onSelect?: (scene: GameScene) => void;
  onMove?: (scene: GameScene, e: MoveableState) => void;
}

const Scene = ({
  scene,
  className,
  onChange,
  onSelect,
  onMove,
}: SceneProps) => {
  const { zoom } = useInfiniteCanvas();
  const { projectBase, project } = useApp();
  const { selectedScene } = useCanvas();

  const sceneConfig = useMemo(() => (
    project?.scenes?.find(s => s._file === scene._file)
  ), [project, scene]);

  const backgroundPath = useMemo(() => scene.background ? (
    `project://graphics/${scene.background}.bmp`
  ) : '', [projectBase, scene]);

  const collisions = useMemo(() => (
    scene.map?.collisions?.map(line => line.split(','))
  ), [scene]);

  const sensors = useMemo(() => (
    scene.map?.sensors || []
  ), [scene]);

  const gridSize = useMemo(() => (
    scene.map?.gridSize || 16
  ), [scene]);

  const onSelect_ = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect?.(scene);
  }, [onSelect, scene, selectedScene]);

  const onMoveEnd = useCallback((e: MoveableState) => {
    onMove?.(scene, e);
  }, [onChange, scene]);

  return (
    <Moveable
      onMouseDown={onSelect_}
      onMoveEnd={onMoveEnd}
      transformScale={zoom}
      x={sceneConfig?.x || 0}
      y={sceneConfig?.y || 0}
    >
      <div
        className={classNames(
          'relative select-none',
          { 'z-100' : selectedScene === scene },
        )}
      >
        <Card
          className={classNames(
            '!relative bg-cover bg-center transition-[outline-width]',
            'duration-200',
            { '!outline-4 !outline-(--accent-9)': selectedScene === scene },
            className
          )}
          style={{
            backgroundImage: `url(${backgroundPath})`,
            contain: 'none',
            imageRendering: 'pixelated',
            width: Math.max(240,
              (scene.map?.width || 0) * (scene.map?.gridSize || 16)),
            height: Math.max(160,
              (scene.map?.height || 0) * (scene.map?.gridSize || 16)),
          }}
        >
          { collisions?.map((line, y) => (
            line.map((cell, x) => (
              cell === '1' && (
                <div
                  key={`${x}-${y}`}
                  className="absolute bg-red-500/50 pointer-events-none"
                  style={{
                    left: x * gridSize,
                    top: y * gridSize,
                    width: gridSize,
                    height: gridSize,
                  }}
                />
              )
            ))
          )) }

          { sensors.map((sensor, i) => (
            <div
              key={i}
              className={classNames(
                'absolute bg-orange-500/50 pointer-events-none border-2',
                'border-orange-500'
              )}
              style={{
                left: (sensor.x || 0) * gridSize,
                top: (sensor.y || 0) * gridSize,
                width: (sensor.width || 1) * gridSize,
                height: (sensor.height || 1) * gridSize,
              }}
            />
          )) }
        </Card>
        <span className="absolute block w-full left-0 bottom-full text-center">
          { scene.name }
        </span>
      </div>
    </Moveable>
  );
};

export default Scene;
