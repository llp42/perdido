import type { Maze } from '../maze/types';
import { CELL_SIZE } from '../game/constants';

function cellCoord(v: number): number {
  return Math.floor(v / CELL_SIZE);
}

function isWallAt(maze: Maze, cellX: number, cellY: number): boolean {
  if (cellX < 0 || cellY < 0 || cellX >= maze.width || cellY >= maze.height) return true;
  return maze.isWall[cellY][cellX];
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
  const cellX = axis === 'x' ? targetCell : otherCellCoord;
  const cellY = axis === 'x' ? otherCellCoord : targetCell;

  if (!isWallAt(maze, cellX, cellY)) return proposedCoord;

  return movingPositive ? currentCell * CELL_SIZE + CELL_SIZE - radius : currentCell * CELL_SIZE + radius;
}

/**
 * Resolves player movement against solid wall cells using per-axis grid-cell
 * checks ("slide along walls") rather than physics/raycasting — cheap and
 * sufficient since every wall is a full grid-cell cube.
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
