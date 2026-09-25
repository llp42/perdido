import type { Cell, Direction, Maze } from './types';

const OPPOSITE: Record<Direction, Direction> = { N: 'S', E: 'W', S: 'N', W: 'E' };
const DELTA: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

function createGrid(width: number, height: number): Cell[][] {
  const cells: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, walls: { N: true, E: true, S: true, W: true }, visited: false });
    }
    cells.push(row);
  }
  return cells;
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function unvisitedNeighbors(cells: Cell[][], cell: Cell, width: number, height: number): { dir: Direction; neighbor: Cell }[] {
  const result: { dir: Direction; neighbor: Cell }[] = [];
  for (const dir of ['N', 'E', 'S', 'W'] as Direction[]) {
    const { dx, dy } = DELTA[dir];
    const nx = cell.x + dx;
    const ny = cell.y + dy;
    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
    const neighbor = cells[ny][nx];
    if (!neighbor.visited) result.push({ dir, neighbor });
  }
  return result;
}

/**
 * Generates a fully-connected maze using randomized DFS backtracking (iterative,
 * to avoid recursion depth concerns on large grids).
 */
export function generate(width: number, height: number): Maze {
  const cells = createGrid(width, height);
  const start = { x: 0, y: 0 };
  const exit = { x: width - 1, y: height - 1 };

  const startCell = cells[start.y][start.x];
  startCell.visited = true;
  const stack: Cell[] = [startCell];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const candidates = shuffle(unvisitedNeighbors(cells, current, width, height));

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

  return { width, height, cells, start, exit };
}

export const MazeGenerator = { generate };
