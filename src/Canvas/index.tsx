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

import type { GameScene, ToolType } from '../types';
import { CanvasContext, CanvasContextType } from '../contexts';
import { useApp } from '../hooks';
import Scene from '../Scene';
import Toolbar from './Toolbar';

export interface CanvasProps {
  onMoveScene: (scene: GameScene, e: MoveableState) => void;
}

export interface CanvasState {
  selectedScene?: GameScene;
  tool: ToolType;
}

const Canvas = ({
  onMoveScene,
}: CanvasProps) => {
  const infiniteCanvasRef = useRef<InfiniteCanvasRef>(null);
  const { scenes } = useApp();
  const [state, dispatch] = useReducer(mockState<CanvasState>, {
    selectedScene: undefined,
    tool: 'move',
  });

  useEffect(() => {
    infiniteCanvasRef.current?.fitIntoView(200);
  }, []);

  const onSelectScene = useCallback((scene?: GameScene) => {
    if (state.selectedScene === scene) {
      return;
    }

    dispatch({ selectedScene: scene });
  }, [state.selectedScene]);

  const getContext = useCallback((): CanvasContextType => ({
    selectedScene: state.selectedScene,
    tool: state.tool,
  }), [state.selectedScene, state.tool]);

  return (
    <CanvasContext.Provider value={getContext()}>
      <div
        className={classNames(
          'w-screen h-screen relative flex items-stretch overflow-hidden',
        )}
        onMouseDown={() => onSelectScene()}
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
                onSelect={onSelectScene}
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

        <Toolbar
          className={classNames(
            '!fixed bottom-8 left-1/2 transform -translate-x-1/2 z-1000'
          )}
        />
      </div>
    </CanvasContext.Provider>
  );
};

export default Canvas;
