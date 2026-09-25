import nipplejs from 'nipplejs';
import type { JoystickVector } from '../player/PlayerController';

export class JoystickInput {
  private vector: JoystickVector = { x: 0, y: 0 };
  private manager: nipplejs.JoystickManager;

  constructor(zone: HTMLElement) {
    this.manager = nipplejs.create({
      zone,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'white',
      size: 100,
    });

    this.manager.on('move', (_evt, data) => {
      const force = Math.min(data.force, 1);
      this.vector = {
        x: Math.cos(data.angle.radian) * force,
        y: Math.sin(data.angle.radian) * force,
      };
    });

    this.manager.on('end', () => {
      this.vector = { x: 0, y: 0 };
    });
  }

  getVector(): JoystickVector {
    return this.vector;
  }

  destroy(): void {
    this.manager.destroy();
  }
}
