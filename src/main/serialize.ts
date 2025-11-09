import type { AppPayload, GameScene } from '../types';

export const serializeScene = (scene: GameScene): GameScene => {
  if (scene.map?.collisions?.length) {
    if (!Array.isArray(scene.map.collisions[0])) {
      return scene;
    }

    // @ts-expect-error - we know this is a 2D array
    scene.map.collisions = scene.map.collisions.map(l => l.join(','));
  }

  return scene;
};

export const unserializeScene = (scene: GameScene): GameScene => {
  if (scene.map?.collisions?.length) {
    if (Array.isArray(scene.map.collisions[0])) {
      return scene;
    }

    // @ts-expect-error - we know this is a string array
    scene.map.collisions = scene.map.collisions.map(l => l.split(','));
  }

  return scene;
};

export const serialize = (
  payload: Partial<AppPayload>
): Partial<AppPayload> => {
  payload.scenes = payload.scenes?.map(scene => serializeScene(scene));

  return payload;
};

export const unserialize = (
  payload: Partial<AppPayload>
): Partial<AppPayload> => {
  payload.scenes = payload.scenes?.map(scene => unserializeScene(scene));

  return payload;
};
