const COLORS = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb'];
const PIECE_COUNT = 60;

export function spawnConfetti(container: HTMLElement): void {
  for (let i = 0; i < PIECE_COUNT; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.animationDuration = `${1.5 + Math.random()}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 200}px`);
    piece.addEventListener('animationend', () => piece.remove());
    container.appendChild(piece);
  }
}
