import * as THREE from 'three';
import type { Direction, GridPos, Maze } from '../maze/types';
import { CELL_SIZE, EYE_HEIGHT, MOVE_SPEED, PLAYER_RADIUS, TURN_SPEED } from '../game/constants';
import { resolveMovement } from './collision';

// Yaw values for which `forward = (-sin(yaw), 0, -cos(yaw))` points into each
// direction's neighboring cell — used to spawn the player facing an open
// passage instead of a fixed, possibly wall-blocked, orientation.
const YAW_FOR_DIRECTION: Record<Direction, number> = {
  N: 0,
  W: Math.PI / 2,
  S: Math.PI,
  E: -Math.PI / 2,
};
const DIRECTION_PRIORITY: Direction[] = ['N', 'E', 'S', 'W'];

export interface JoystickVector {
  x: number;
  y: number;
}

export class PlayerController {
  readonly camera: THREE.PerspectiveCamera;
  private maze!: Maze;
  private x = 0;
  private z = 0;
  private yaw = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 200);
  }

  resetTo(maze: Maze, gridPos: GridPos): void {
    this.maze = maze;
    this.x = gridPos.x * CELL_SIZE + CELL_SIZE / 2;
    this.z = gridPos.y * CELL_SIZE + CELL_SIZE / 2;
    this.yaw = this.initialYawFor(maze, gridPos);
    this.syncCamera();
  }

  update(dt: number, joystick: JoystickVector): void {
    this.yaw -= joystick.x * TURN_SPEED * dt;

    const forwardX = -Math.sin(this.yaw);
    const forwardZ = -Math.cos(this.yaw);
    const moveDist = joystick.y * MOVE_SPEED * dt;

    const proposed = { x: this.x + forwardX * moveDist, z: this.z + forwardZ * moveDist };
    const resolved = resolveMovement(this.maze, { x: this.x, z: this.z }, proposed, PLAYER_RADIUS);
    this.x = resolved.x;
    this.z = resolved.z;

    this.syncCamera();
  }

  getCurrentCell(): GridPos {
    return { x: Math.floor(this.x / CELL_SIZE), y: Math.floor(this.z / CELL_SIZE) };
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  private initialYawFor(maze: Maze, gridPos: GridPos): number {
    const walls = maze.cells[gridPos.y][gridPos.x].walls;
    const openDirection = DIRECTION_PRIORITY.find((dir) => !walls[dir]);
    return openDirection ? YAW_FOR_DIRECTION[openDirection] : 0;
  }

  private syncCamera(): void {
    this.camera.position.set(this.x, EYE_HEIGHT, this.z);
    this.camera.rotation.set(0, this.yaw, 0);
  }
}
