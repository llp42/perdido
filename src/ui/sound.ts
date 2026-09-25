let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * iOS Safari (and most mobile browsers) only allow audio to start inside a
 * direct user-gesture handler. Call this from the first touch/pointer event
 * so the AudioContext is already unlocked by the time a win sound needs to play.
 */
export function unlockAudio(): void {
  getAudioContext();
}

const WIN_CHIME_NOTES = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

export function playWinSound(): void {
  const ctx = getAudioContext();
  const noteDuration = 0.12;

  WIN_CHIME_NOTES.forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;

    const startTime = ctx.currentTime + index * noteDuration;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration + 0.02);
  });
}
