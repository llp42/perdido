import type { Maze } from '../maze/types';
import { CELL_SIZE } from '../game/constants';

function isWallAt(maze: Maze, cellX: number, cellY: number): boolean {
  if (cellX < 0 || cellY < 0 || cellX >= maze.width || cellY >= maze.height) return true;
  return maze.isWall[cellY][cellX];
}

/**
 * Resolves player movement as a circle against every nearby solid grid cell
 * (closest-point-on-AABB push-out), rather than checking only the cell
 * directly ahead on each axis. A per-axis-only check lets a round player body
 * clip a solid cell's CORNER at an oblique approach angle — which happens
 * constantly in real play, since tilting the joystick diagonally turns and
 * moves in the same frame — and an interpenetrated cube renders as invisible
 * (back-face culled), letting the camera see straight through it.
 */
export function resolveMovement(
  maze: Maze,
  _current: { x: number; z: number },
  proposed: { x: number; z: number },
  radius: number,
): { x: number; z: number } {
  let { x, z } = proposed;

  const minCellX = Math.floor((x - radius) / CELL_SIZE);
  const maxCellX = Math.floor((x + radius) / CELL_SIZE);
  const minCellZ = Math.floor((z - radius) / CELL_SIZE);
  const maxCellZ = Math.floor((z + radius) / CELL_SIZE);

  for (let cellY = minCellZ; cellY <= maxCellZ; cellY++) {
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      if (!isWallAt(maze, cellX, cellY)) continue;

      const cellMinX = cellX * CELL_SIZE;
      const cellMaxX = cellMinX + CELL_SIZE;
      const cellMinZ = cellY * CELL_SIZE;
      const cellMaxZ = cellMinZ + CELL_SIZE;

      const closestX = Math.max(cellMinX, Math.min(x, cellMaxX));
      const closestZ = Math.max(cellMinZ, Math.min(z, cellMaxZ));

      const dx = x - closestX;
      const dz = z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq) || 1e-6;
        const overlap = radius - dist;
        x += (dx / dist) * overlap;
        z += (dz / dist) * overlap;
      }
    }
  }

  return { x, z };
}
