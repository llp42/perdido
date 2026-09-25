import * as THREE from 'three';

// cub3D-style directional wall coloring — one flat color per compass facing for
// now; each of these is meant to be swapped for a texture map later.
export const northWallMaterial = new THREE.MeshLambertMaterial({ color: 0xb84a4a }); // red
export const southWallMaterial = new THREE.MeshLambertMaterial({ color: 0x4a7ab8 }); // blue
export const eastWallMaterial = new THREE.MeshLambertMaterial({ color: 0x4ab86a }); // green
export const westWallMaterial = new THREE.MeshLambertMaterial({ color: 0xd0c04a }); // yellow

// Used for a wall segment's thin end-caps and top/bottom faces, which are
// essentially never visible from inside the maze.
export const wallCapMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });

export const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2e });
export const exitMarkerMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 }); // gold
