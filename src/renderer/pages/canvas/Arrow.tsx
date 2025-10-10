import { useMemo } from 'react';

import type {
  GameActor,
  GamePlayer,
  GameScene,
  GoToSceneEvent,
} from '../../../types';
import { tileToPixel } from '../../../helpers';
import { useApp } from '../../services/hooks';

export interface ArrowProps {
  source: GameScene | GameActor | GamePlayer;
  event: GoToSceneEvent;
  gridSize?: number;
}

const Arrow = ({
  source,
  event,
  gridSize = 16,
}: ArrowProps) => {
  const { project } = useApp();

  const sourceConfig = useMemo(() => (
    (source as GameScene | GameActor).type === 'scene'
      ? project?.scenes?.find(s => (
        s.id === (source as GameScene).id ||
        s._file === (source as GameScene)._file)
      )
      : (source as GameActor)
  ), [project, source]);

  const start = useMemo(() => (
    (source as GameScene | GameActor).type === 'scene'
      ? {
        x: sourceConfig?.x ?? 0,
        y: sourceConfig?.y ?? 0,
      }
      : {
        x: tileToPixel((source as GameActor).x, 16) ?? 0,
        y: tileToPixel((source as GameActor).y, 16) ?? 0,
      }
  ), [source, sourceConfig?.x, sourceConfig?.y]);

  const targetConfig = useMemo(() => (
    project?.scenes?.find(s => (
      s.id === event.target ||
      s._file === event.target)
    )
  ), [project, event]);

  const end = useMemo(() => ({
    x: targetConfig?.x ?? 0,
    y: targetConfig?.y ?? 0,
  }), [targetConfig?.x, targetConfig?.y]);

  const distance = useMemo(() => (
    Math.sqrt(
      (end.x - start.x) ** 2 +
      (end.y - start.y) ** 2,
    )
  ), [start, end]);

  return (
    <svg
      className="absolute top-0 left-0 z-1000 w-px h-px pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-9)" />
        </marker>
      </defs>
      <path
        d={
          // Start
          `M ${start.x} ${start.y} ` +
          // Bezier start control point
          `C ${start.x + (start.x > end.x ? -50 : 50)} ` +
            `${start.y - 50}, ` +
          // Bezier end control point
          `${end.x + (end.x > start.x ? -50 : 50)} ` +
          `${end.y - 50}, ` +
          // End
          `${end.x} ${end.y}`
        }
        stroke="var(--accent-9)"
        strokeWidth="2"
        fill="transparent"
        markerEnd="url(#arrowhead)"
        strokeDasharray={gridSize}
      />
    </svg>
  );
};

export default Arrow;
