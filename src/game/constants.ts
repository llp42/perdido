export const CELL_SIZE = 4;
export const WALL_HEIGHT = CELL_SIZE; // walls are literal cubes, one grid cell per side
export const EYE_HEIGHT = 1.6;
// Kept comfortably larger than the camera's near-clip plane so the camera can
// never get close enough to a wall face to clip through it.
export const PLAYER_RADIUS = 0.6;
export const MOVE_SPEED = CELL_SIZE * 1.2; // world units / second
export const TURN_SPEED = 2.5; // radians / second
export const MAZE_WIDTH = 30;
export const MAZE_HEIGHT = 30;
