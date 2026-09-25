import { Game } from './game/Game';
import { unlockAudio } from './ui/sound';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const joystickZone = document.getElementById('joystick-zone') as HTMLElement;

window.addEventListener('pointerdown', unlockAudio, { once: true });

const game = new Game(canvas, joystickZone);
game.start();
