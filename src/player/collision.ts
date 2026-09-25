import type { Direction, Maze } from '../maze/types';
import { CELL_SIZE } from '../game/constants';

function cellCoord(v: number): number {
  return Math.floor(v / CELL_SIZE);
}

function canCrossEdge(maze: Maze, cellX: number, cellY: number, dir: Direction): boolean {
  if (cellX < 0 || cellY < 0 || cellX >= maze.width || cellY >= maze.height) return false;
  return !maze.cells[cellY][cellX].walls[dir];
}

function resolveAxis(
  maze: Maze,
  currentCoord: number,
  proposedCoord: number,
  otherCellCoord: number,
  radius: number,
  axis: 'x' | 'z',
): number {
  const currentCell = cellCoord(currentCoord);
  const targetCell = cellCoord(proposedCoord);
  if (targetCell === currentCell) return proposedCoord;

  const movingPositive = targetCell > currentCell;
  const dir: Direction = axis === 'x' ? (movingPositive ? 'E' : 'W') : movingPositive ? 'S' : 'N';
  const cellX = axis === 'x' ? currentCell : otherCellCoord;
  const cellY = axis === 'x' ? otherCellCoord : currentCell;

  if (canCrossEdge(maze, cellX, cellY, dir)) return proposedCoord;

  return movingPositive ? (currentCell + 1) * CELL_SIZE - radius : currentCell * CELL_SIZE + radius;
}

/**
 * Resolves player movement against maze walls using per-axis grid-boundary
 * checks ("slide along walls") rather than physics/raycasting — cheap and
 * sufficient since the maze is a fixed grid.
 */
export function resolveMovement(
  maze: Maze,
  current: { x: number; z: number },
  proposed: { x: number; z: number },
  radius: number,
): { x: number; z: number } {
  const resolvedX = resolveAxis(maze, current.x, proposed.x, cellCoord(current.z), radius, 'x');
  const resolvedZ = resolveAxis(maze, current.z, proposed.z, cellCoord(resolvedX), radius, 'z');
  return { x: resolvedX, z: resolvedZ };
}
