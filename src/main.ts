import { Game } from './game/Game';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const joystickZone = document.getElementById('joystick-zone') as HTMLElement;

const game = new Game(canvas, joystickZone);
game.start();
