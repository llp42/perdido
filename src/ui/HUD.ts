import { spawnConfetti } from './confetti';
import { playWinSound } from './sound';

export class HUD {
  private roundCounter: HTMLElement;
  private winMessage: HTMLElement;
  private confettiContainer: HTMLElement;

  constructor() {
    this.roundCounter = document.getElementById('round-counter')!;
    this.winMessage = document.getElementById('win-message')!;
    this.confettiContainer = document.getElementById('confetti-container')!;
  }

  setRound(round: number): void {
    this.roundCounter.textContent = `Round ${round}`;
  }

  celebrate(): void {
    this.winMessage.classList.remove('hidden');
    spawnConfetti(this.confettiContainer);
    playWinSound();
  }

  hideWinMessage(): void {
    this.winMessage.classList.add('hidden');
  }
}
