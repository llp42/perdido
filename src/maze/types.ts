export type Direction = 'N' | 'E' | 'S' | 'W';

export interface GridPos {
  x: number;
  y: number;
}

export interface Maze {
  width: number;
  height: number;
  // isWall[y][x] — true means that grid cell is a fully solid wall cube
  // (cub3D-style block maze), false means open, walkable floor.
  isWall: boolean[][];
  start: GridPos;
  exit: GridPos;
}
