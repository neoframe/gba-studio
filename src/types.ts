export type VariableValue = string | number | boolean;

export interface GameVariables {
  values: Record<string, VariableValue>;
  // Internals
  _file?: string;
}

export interface MapSensor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameMap {
  type: 'map';
  width: number;
  height: number;
  gridSize: number;
  scene: string;
  collisions: string[];
  sensors: MapSensor[];
  // Internals
  _file?: string;
}

export interface GameScene {
  type: 'scene';
  name: string;
  background?: string;
  map?: GameMap;
  // Internals
  _file?: string;
}

export interface ProjectSceneData {
  x: number;
  y: number;
  _file?: string;
}

export interface GameProject {
  scenes: ProjectSceneData[];
}

export interface AppPayload {
  project: GameProject;
  scenes: GameScene[];
  variables: GameVariables[];
};
