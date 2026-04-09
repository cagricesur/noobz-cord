/**
 * Short notification tones for remote participant join/leave (Web Audio; no asset files).
 */
function playTwoTone(highFirst: [number, number]): void {
  try {
    const ctx = new AudioContext();
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    const now = ctx.currentTime;
    playNote(highFirst[0], now, 0.1);
    playNote(highFirst[1], now + 0.12, 0.11);
    window.setTimeout(() => void ctx.close(), 450);
  } catch {
    /* ignore if AudioContext unavailable */
  }
}

export function playParticipantJoinSound(): void {
  playTwoTone([523.25, 659.25]);
}

export function playParticipantLeaveSound(): void {
  playTwoTone([659.25, 392]);
}
