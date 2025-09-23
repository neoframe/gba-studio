import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  type MoveableState,
  InfiniteCanvas,
  InfiniteCanvasRef,
  classNames,
  mockState,
} from '@junipero/react';
import { Card } from '@radix-ui/themes';
import { Resizable } from 're-resizable';

import type { GameScene } from '../types';
import { CanvasContext } from '../contexts';
import { useApp } from '../hooks';
import Scene from '../Scene';

export interface CanvasProps {
  onMoveScene: (scene: GameScene, e: MoveableState) => void;
}

export interface CanvasState {
  selected?: GameScene;
}

const Canvas = ({
  onMoveScene,
}: CanvasProps) => {
  const infiniteCanvasRef = useRef<InfiniteCanvasRef>(null);
  const { scenes } = useApp();
  const [state, dispatch] = useReducer(mockState<CanvasState>, {
    selected: undefined,
  });

  useEffect(() => {
    infiniteCanvasRef.current?.fitIntoView(200);
  }, []);

  const onSelect = useCallback((item?: GameScene) => {
    if (state.selected === item) {
      return;
    }

    dispatch({ selected: item });
  }, [state.selected]);

  const getContext = useCallback(() => ({
    selected: state.selected,
  }), [state.selected]);

  return (
    <CanvasContext.Provider value={getContext()}>
      <div
        className={classNames(
          'w-screen h-screen relative flex items-stretch overflow-hidden',
        )}
        onMouseDown={() => onSelect()}
      >
        <InfiniteCanvas
          ref={infiniteCanvasRef}
          className="flex-auto overflow-hidden"
        >
          <div className="flex items-start gap-8">
            { scenes.map(scene => (
              <Scene
                key={scene.name}
                scene={scene}
                onSelect={onSelect}
                onMove={onMoveScene}
              />
            ))}
          </div>
        </InfiniteCanvas>
        <Resizable
          defaultSize={{ width: 400 }}
          maxWidth="80%"
          minWidth={400}
          className={classNames(
            'editor-panel !h-[calc(100vh+2px)] -right-1 -top-1 flex-none',
          )}
        >
          <Card
            className={classNames(
              'w-full h-full',
              'bg-white dark:bg-black before:!rounded-none after:!rounded-none',
              '!rounded-none'
            )}
          >
            Sidebar
          </Card>
        </Resizable>
      </div>
    </CanvasContext.Provider>
  );
};

export default Canvas;
