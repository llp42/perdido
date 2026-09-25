import * as THREE from 'three';
import { generate as generateMaze } from '../maze/MazeGenerator';
import type { Maze } from '../maze/types';
import { buildMazeScene, type MazeSceneHandle } from '../scene/MazeSceneBuilder';
import { setupLighting } from '../scene/lighting';
import { PlayerController } from '../player/PlayerController';
import { JoystickInput } from '../input/JoystickInput';
import { HUD } from '../ui/HUD';
import { RoundState } from './RoundState';
import { MAZE_HEIGHT, MAZE_WIDTH } from './constants';

const WIN_PAUSE_MS = 1500;
const MAX_DELTA_SECONDS = 0.1;

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly player: PlayerController;
  private readonly joystick: JoystickInput;
  private readonly hud: HUD;
  private readonly roundState = new RoundState();

  private maze!: Maze;
  private mazeHandle?: MazeSceneHandle;
  private state: 'playing' | 'won' = 'playing';
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement, joystickZone: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x101014);
    setupLighting(this.scene);

    this.player = new PlayerController(window.innerWidth / window.innerHeight);
    this.joystick = new JoystickInput(joystickZone);
    this.hud = new HUD();

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
    });

    window.addEventListener('resize', this.handleResize);
    window.visualViewport?.addEventListener('resize', this.handleResize);
  }

  start(): void {
    this.startRound();
    requestAnimationFrame(this.loop);
  }

  private startRound(): void {
    this.maze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);

    if (this.mazeHandle) {
      this.scene.remove(this.mazeHandle.group);
      this.mazeHandle.dispose();
    }
    this.mazeHandle = buildMazeScene(this.maze);
    this.scene.add(this.mazeHandle.group);

    this.player.resetTo(this.maze, this.maze.start);
    this.hud.setRound(this.roundState.current);
    this.hud.hideWinMessage();
    this.state = 'playing';
  }

  private readonly loop = (time: number): void => {
    const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, MAX_DELTA_SECONDS) : 0;
    this.lastTime = time;

    if (this.state === 'playing') {
      this.player.update(dt, this.joystick.getVector());

      const cell = this.player.getCurrentCell();
      if (cell.x === this.maze.exit.x && cell.y === this.maze.exit.y) {
        this.state = 'won';
        this.hud.showWinMessage();
        this.roundState.advance();
        setTimeout(() => this.startRound(), WIN_PAUSE_MS);
      }
    }

    this.renderer.render(this.scene, this.player.camera);
    requestAnimationFrame(this.loop);
  };

  private readonly handleResize = (): void => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.player.setAspect(window.innerWidth / window.innerHeight);
  };
}
