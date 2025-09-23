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
  const { selected } = useCanvas();

  const sceneConfig = useMemo(() => (
    project?.scenes?.find(s => s._file === scene._file)
  ), [project, scene]);

  const backgroundPath = useMemo(() => scene.background ? (
    `project://graphics/${scene.background}.bmp`
  ) : '', [projectBase, scene]);

  const onSelect_ = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect?.(scene);
  }, [onSelect, scene, selected]);

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
          { 'z-100' : selected === scene },
        )}
      >
        <Card
          className={classNames(
            'bg-cover bg-center transition-[outline-width] duration-200',
            { '!outline-4 !outline-(--accent-9)': selected === scene },
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
        </Card>
        <span className="absolute block w-full left-0 bottom-full text-center">
          { scene.name }
        </span>
      </div>
    </Moveable>
  );
};

export default Scene;
