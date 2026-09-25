import * as THREE from 'three';
import type { Maze } from '../maze/types';
import { CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS } from '../game/constants';
import {
  eastWallMaterial,
  exitMarkerMaterial,
  floorMaterial,
  northWallMaterial,
  southWallMaterial,
  wallCapMaterial,
  westWallMaterial,
} from './materials';

interface WallPlacement {
  centerX: number;
  centerZ: number;
}

// BoxGeometry's local ±z faces are its two large faces (CELL_SIZE x WALL_HEIGHT);
// ±x/±y are thin end-caps and top/bottom, rarely visible from inside the maze.
// Face group order for a THREE.BoxGeometry: [px, nx, py, ny, pz, nz].
// For a horizontal (unrotated) wall: local pz -> world +z (south), local nz -> world -z (north).
// For a vertical (rotated 90° around Y) wall: local pz -> world +x (east), local nz -> world -x (west).
// Hence horizontal and vertical walls need distinct material arrays on that same shared geometry.
function makeWallMaterialArray(pzMaterial: THREE.Material, nzMaterial: THREE.Material): THREE.Material[] {
  return [wallCapMaterial, wallCapMaterial, wallCapMaterial, wallCapMaterial, pzMaterial, nzMaterial];
}

function collectWallPlacements(maze: Maze): { horizontal: WallPlacement[]; vertical: WallPlacement[] } {
  const horizontal: WallPlacement[] = [];
  const vertical: WallPlacement[] = [];

  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.cells[y][x];
      const originX = x * CELL_SIZE;
      const originZ = y * CELL_SIZE;

      if (cell.walls.N) {
        horizontal.push({ centerX: originX + CELL_SIZE / 2, centerZ: originZ });
      }
      if (cell.walls.W) {
        vertical.push({ centerX: originX, centerZ: originZ + CELL_SIZE / 2 });
      }
      // Only the far boundary (S edge of the last row, E edge of the last column)
      // needs an explicit placement — every other S/E wall is already covered by
      // the neighboring cell's N/W wall.
      if (y === maze.height - 1 && cell.walls.S) {
        horizontal.push({ centerX: originX + CELL_SIZE / 2, centerZ: originZ + CELL_SIZE });
      }
      if (x === maze.width - 1 && cell.walls.E) {
        vertical.push({ centerX: originX + CELL_SIZE, centerZ: originZ + CELL_SIZE / 2 });
      }
    }
  }

  return { horizontal, vertical };
}

function buildWallMesh(
  geometry: THREE.BoxGeometry,
  materials: THREE.Material[],
  placements: WallPlacement[],
  rotationY: number,
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, materials, placements.length);
  const matrix = new THREE.Matrix4();
  matrix.makeRotationY(rotationY);

  placements.forEach((placement, index) => {
    matrix.setPosition(placement.centerX, WALL_HEIGHT / 2, placement.centerZ);
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export interface MazeSceneHandle {
  group: THREE.Group;
  dispose(): void;
}

export function buildMazeScene(maze: Maze): MazeSceneHandle {
  const group = new THREE.Group();

  const { horizontal, vertical } = collectWallPlacements(maze);
  const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, WALL_THICKNESS);

  const horizontalMesh = buildWallMesh(
    wallGeometry,
    makeWallMaterialArray(southWallMaterial, northWallMaterial),
    horizontal,
    0,
  );
  const verticalMesh = buildWallMesh(
    wallGeometry,
    makeWallMaterialArray(eastWallMaterial, westWallMaterial),
    vertical,
    Math.PI / 2,
  );
  group.add(horizontalMesh, verticalMesh);

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
