/**
 * Web Audio API Vintage Camera Sound Effects
 * Provides authentic disposable camera mechanical shutter & film winding clicks.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playShutterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. First mechanical click (aperture opening)
  const clickOsc1 = ctx.createOscillator();
  const clickGain1 = ctx.createGain();
  clickOsc1.type = 'triangle';
  clickOsc1.frequency.setValueAtTime(800, now);
  clickOsc1.frequency.exponentialRampToValueAtTime(120, now + 0.04);
  clickGain1.gain.setValueAtTime(0.4, now);
  clickGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  clickOsc1.connect(clickGain1);
  clickGain1.connect(ctx.destination);
  clickOsc1.start(now);
  clickOsc1.stop(now + 0.05);

  // 2. High snap click (disposable spring release)
  const snapOsc = ctx.createOscillator();
  const snapGain = ctx.createGain();
  snapOsc.type = 'square';
  snapOsc.frequency.setValueAtTime(1800, now + 0.03);
  snapOsc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
  snapGain.gain.setValueAtTime(0.3, now + 0.03);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  snapOsc.connect(snapGain);
  snapGain.connect(ctx.destination);
  snapOsc.start(now + 0.03);
  snapOsc.stop(now + 0.09);

  // 3. Subtle motorized/mechanical winding click (film advance)
  setTimeout(() => {
    if (!ctx) return;
    const windNow = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const gearOsc = ctx.createOscillator();
      const gearGain = ctx.createGain();
      const t = windNow + i * 0.05;
      gearOsc.type = 'sine';
      gearOsc.frequency.setValueAtTime(1200 + i * 150, t);
      gearGain.gain.setValueAtTime(0.12, t);
      gearGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      gearOsc.connect(gearGain);
      gearGain.connect(ctx.destination);
      gearOsc.start(t);
      gearOsc.stop(t + 0.035);
    }
  }, 120);
}
