export type Direction = 'N' | 'E' | 'S' | 'W';

export interface Walls {
  N: boolean;
  E: boolean;
  S: boolean;
  W: boolean;
}

export interface Cell {
  x: number;
  y: number;
  walls: Walls;
  visited: boolean;
}

export interface GridPos {
  x: number;
  y: number;
}

export interface Maze {
  width: number;
  height: number;
  cells: Cell[][]; // cells[y][x]
  start: GridPos;
  exit: GridPos;
}
