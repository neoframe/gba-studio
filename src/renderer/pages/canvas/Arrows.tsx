import { useMemo } from 'react';

import type { GameScene, GoToSceneEvent } from '../../../types';
import { useApp, useCanvas } from '../../services/hooks';
import { getEventsOfType } from '../../services/events';
import Arrow from './Arrow';

export interface ArrowsProps {
  gridSize?: number;
}

const Arrows = ({
  gridSize = 16,
}) => {
  const { scenes, scripts } = useApp();
  const { selectedScene } = useCanvas();

  const sceneArrows = useMemo<[GameScene, GoToSceneEvent[]][]>(() => (
    scenes
      .map<[GameScene, GoToSceneEvent[]]>(s => [
        s,
        getEventsOfType<
          GoToSceneEvent
        >('go-to-scene', s.events || [], { scripts }),
      ])
      .filter(([s, events]) => (
        (s.id === selectedScene?.id || s._file === selectedScene?._file) &&
        !!events.length
      ))
  ), [scenes, scripts, selectedScene]);

  return sceneArrows.map(([scene, events]) => events.map(e => (
    <Arrow
      key={scene.id || scene._file}
      source={scene}
      event={e}
      gridSize={scene.map?.gridSize || gridSize}
    />
  )));
};

export default Arrows;
