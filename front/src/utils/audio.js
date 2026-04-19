import { withBase } from "./asset";

let audioContext = null;
let lastScratchAt = 0;
let scratchPlayers = null;
let scratchPlayerIndex = 0;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function getScratchPlayers() {
  if (!scratchPlayers) {
    scratchPlayers = Array.from({ length: 4 }, () => {
      const audio = new Audio(withBase("audio/scratch.mp3"));
      audio.preload = "auto";
      audio.volume = 0.22;
      return audio;
    });
  }

  return scratchPlayers;
}

function playTone({
  frequency,
  type = "sine",
  gain = 0.08,
  duration = 0.2,
  startOffset = 0,
  endFrequency = null,
}) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const output = context.createGain();
  const startAt = context.currentTime + startOffset;
  const stopAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, stopAt);
  }

  output.gain.setValueAtTime(0.0001, startAt);
  output.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
  output.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  oscillator.connect(output);
  output.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(stopAt);
}

export function playScratchSound() {
  const now = performance.now();
  if (now - lastScratchAt < 90) {
    return;
  }

  lastScratchAt = now;

  const players = getScratchPlayers();
  const player = players[scratchPlayerIndex];
  scratchPlayerIndex = (scratchPlayerIndex + 1) % players.length;

  player.pause();
  player.currentTime = 0;
  player.playbackRate = 0.92 + Math.random() * 0.18;
  player.play().catch(() => {});
}

export function playWinSound() {
  playTone({ frequency: 392, type: "triangle", gain: 0.06, duration: 0.16 });
  playTone({ frequency: 523.25, type: "triangle", gain: 0.08, duration: 0.22, startOffset: 0.1 });
  playTone({ frequency: 659.25, type: "triangle", gain: 0.09, duration: 0.28, startOffset: 0.2 });
}

export function playJackpotSound() {
  playTone({ frequency: 392, type: "sawtooth", gain: 0.07, duration: 0.16 });
  playTone({ frequency: 523.25, type: "sawtooth", gain: 0.08, duration: 0.18, startOffset: 0.08 });
  playTone({ frequency: 783.99, type: "square", gain: 0.11, duration: 0.32, startOffset: 0.18 });
  playTone({
    frequency: 261.63,
    endFrequency: 1046.5,
    type: "triangle",
    gain: 0.09,
    duration: 0.48,
    startOffset: 0.15,
  });
}

export function playLossSound() {
  playTone({
    frequency: 240,
    endFrequency: 110,
    type: "sine",
    gain: 0.055,
    duration: 0.36,
  });
}
