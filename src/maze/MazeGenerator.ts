import type { Direction, Maze } from './types';

const OPPOSITE: Record<Direction, Direction> = { N: 'S', E: 'W', S: 'N', W: 'E' };
const DELTA: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

interface Walls {
  N: boolean;
  E: boolean;
  S: boolean;
  W: boolean;
}

interface Room {
  x: number;
  y: number;
  walls: Walls;
  visited: boolean;
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function createRoomGrid(cols: number, rows: number): Room[][] {
  const rooms: Room[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: Room[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({ x, y, walls: { N: true, E: true, S: true, W: true }, visited: false });
    }
    rooms.push(row);
  }
  return rooms;
}

function unvisitedNeighbors(rooms: Room[][], room: Room, cols: number, rows: number): { dir: Direction; neighbor: Room }[] {
  const result: { dir: Direction; neighbor: Room }[] = [];
  for (const dir of ['N', 'E', 'S', 'W'] as Direction[]) {
    const { dx, dy } = DELTA[dir];
    const nx = room.x + dx;
    const ny = room.y + dy;
    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
    const neighbor = rooms[ny][nx];
    if (!neighbor.visited) result.push({ dir, neighbor });
  }
  return result;
}

// Randomized DFS backtracker (iterative) over the logical room graph — same
// algorithm as a classic thin-wall maze, just applied to rooms that will be
// expanded into solid grid cells below.
function generateRoomMaze(cols: number, rows: number): Room[][] {
  const rooms = createRoomGrid(cols, rows);
  const start = rooms[0][0];
  start.visited = true;
  const stack: Room[] = [start];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const candidates = shuffle(unvisitedNeighbors(rooms, current, cols, rows));

    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const { dir, neighbor } = candidates[0];
    current.walls[dir] = false;
    neighbor.walls[OPPOSITE[dir]] = false;
    neighbor.visited = true;
    stack.push(neighbor);
  }

  return rooms;
}

// Rooms sit two grid cells apart (odd indices, e.g. 1, 3, 5, ...), leaving the
// cell between two adjacent rooms free to become either a solid wall cube or,
// once carved, a one-cell-wide open corridor. This also guarantees a solid
// wall border around the whole grid, since indices 0 and the last one or two
// columns/rows are never assigned to a room.
function computeRoomCoords(size: number): number[] {
  const coords: number[] = [];
  for (let i = 1; i + 1 < size; i += 2) coords.push(i);
  return coords;
}

/**
 * Generates a cub3D-style block maze: a width x height grid where every cell
 * is either a fully solid wall cube or open floor, fully enclosed by walls.
 */
export function generate(width: number, height: number): Maze {
  const roomXCoords = computeRoomCoords(width);
  const roomYCoords = computeRoomCoords(height);
  const rooms = generateRoomMaze(roomXCoords.length, roomYCoords.length);

  const isWall: boolean[][] = Array.from({ length: height }, () => new Array(width).fill(true));

  for (let ry = 0; ry < roomYCoords.length; ry++) {
    for (let rx = 0; rx < roomXCoords.length; rx++) {
      const px = roomXCoords[rx];
      const py = roomYCoords[ry];
      isWall[py][px] = false;

      const room = rooms[ry][rx];
      for (const dir of ['N', 'E', 'S', 'W'] as Direction[]) {
        if (!room.walls[dir]) {
          const { dx, dy } = DELTA[dir];
          isWall[py + dy][px + dx] = false;
        }
      }
    }
  }

  const start = { x: roomXCoords[0], y: roomYCoords[0] };
  const exit = { x: roomXCoords[roomXCoords.length - 1], y: roomYCoords[roomYCoords.length - 1] };

  return { width, height, isWall, start, exit };
}

export const MazeGenerator = { generate };
