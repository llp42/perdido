import * as THREE from 'three';
import type { Maze } from '../maze/types';
import { CELL_SIZE, WALL_HEIGHT } from '../game/constants';
import {
  eastWallMaterial,
  exitMarkerMaterial,
  floorMaterial,
  northWallMaterial,
  southWallMaterial,
  wallCapMaterial,
  westWallMaterial,
} from './materials';

// BoxGeometry's face-group order is [px, nx, py, ny, pz, nz]. Every wall cube
// is axis-aligned (no rotation), so each face always points the same compass
// direction: +x = east, -x = west, +z = south, -z = north. Top/bottom (py/ny)
// are essentially never seen from inside the maze.
const WALL_MATERIALS = [
  eastWallMaterial,
  westWallMaterial,
  wallCapMaterial,
  wallCapMaterial,
  southWallMaterial,
  northWallMaterial,
];

export interface MazeSceneHandle {
  group: THREE.Group;
  dispose(): void;
}

export function buildMazeScene(maze: Maze): MazeSceneHandle {
  const group = new THREE.Group();

  const wallPositions: { x: number; z: number }[] = [];
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.isWall[y][x]) {
        wallPositions.push({ x: x * CELL_SIZE + CELL_SIZE / 2, z: y * CELL_SIZE + CELL_SIZE / 2 });
      }
    }
  }

  const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
  const wallMesh = new THREE.InstancedMesh(wallGeometry, WALL_MATERIALS, wallPositions.length);

  const matrix = new THREE.Matrix4();
  wallPositions.forEach((pos, index) => {
    matrix.makeTranslation(pos.x, WALL_HEIGHT / 2, pos.z);
    wallMesh.setMatrixAt(index, matrix);
  });
  wallMesh.instanceMatrix.needsUpdate = true;
  group.add(wallMesh);

  const floorGeometry = new THREE.PlaneGeometry(maze.width * CELL_SIZE, maze.height * CELL_SIZE);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((maze.width * CELL_SIZE) / 2, 0, (maze.height * CELL_SIZE) / 2);
  group.add(floor);

  const exitMarkerGeometry = new THREE.PlaneGeometry(CELL_SIZE * 0.9, CELL_SIZE * 0.9);
  const exitMarker = new THREE.Mesh(exitMarkerGeometry, exitMarkerMaterial);
  exitMarker.rotation.x = -Math.PI / 2;
  exitMarker.position.set(
    maze.exit.x * CELL_SIZE + CELL_SIZE / 2,
    0.01, // lifted slightly above the floor to avoid z-fighting
    maze.exit.y * CELL_SIZE + CELL_SIZE / 2,
  );
  group.add(exitMarker);

  return {
    group,
    dispose: () => {
      wallGeometry.dispose();
      floorGeometry.dispose();
      exitMarkerGeometry.dispose();
      // materials are shared/module-level singletons, intentionally not disposed here
    },
  };
}
