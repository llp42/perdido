export class HUD {
  private roundCounter: HTMLElement;
  private winMessage: HTMLElement;

  constructor() {
    this.roundCounter = document.getElementById('round-counter')!;
    this.winMessage = document.getElementById('win-message')!;
  }

  setRound(round: number): void {
    this.roundCounter.textContent = `Round ${round}`;
  }

  showWinMessage(): void {
    this.winMessage.classList.remove('hidden');
  }

  hideWinMessage(): void {
    this.winMessage.classList.add('hidden');
  }
}
