import type { DemoTrackId } from '@/content/media-library';

type Note = [pitch: number | null, beats: number];
type Score = { bpm: number; lead: Note[]; bass: Note[]; leadWave: OscillatorType };

// Original placeholder melodies written for Sushin OS. Pitches are MIDI numbers.
const scores: Record<DemoTrackId, Score> = {
  'aqua-morning': {
    bpm: 112,
    leadWave: 'square',
    lead: [
      [72, 1], [76, 1], [79, 1], [84, 1], [83, 1], [79, 1], [76, 2],
      [74, 1], [77, 1], [81, 1], [79, 1], [77, 1], [74, 1], [72, 2],
      [72, 1], [76, 1], [79, 1], [84, 1], [86, 1], [84, 1], [79, 2],
      [81, 1], [79, 1], [77, 1], [76, 1], [74, 2], [72, 2],
    ],
    bass: [
      [48, 4], [53, 4], [55, 4], [48, 4], [48, 4], [53, 4], [55, 4], [48, 4],
    ],
  },
  'night-shift': {
    bpm: 92,
    leadWave: 'triangle',
    lead: [
      [69, 2], [72, 1], [76, 1], [74, 2], [72, 2],
      [71, 2], [72, 1], [74, 1], [76, 4],
      [77, 2], [76, 1], [74, 1], [72, 2], [71, 2],
      [69, 3], [null, 1], [69, 4],
    ],
    bass: [
      [45, 4], [43, 4], [41, 4], [40, 4], [45, 4], [43, 4], [41, 4], [45, 4],
    ],
  },
  'box-news-theme': {
    bpm: 132,
    leadWave: 'sawtooth',
    lead: [
      [76, 0.5], [76, 0.5], [null, 0.5], [76, 0.5], [null, 0.5], [72, 0.5], [76, 1],
      [79, 2], [67, 2],
      [72, 1.5], [67, 1.5], [64, 1], [69, 1], [71, 1], [70, 0.5], [69, 1.5],
      [67, 0.75], [76, 0.75], [79, 0.5], [81, 1], [77, 0.5], [79, 0.5], [null, 0.5], [76, 1], [72, 0.5], [74, 0.5], [71, 1.5],
    ],
    bass: [
      [48, 2], [43, 2], [48, 2], [43, 2], [48, 2], [43, 2], [41, 2], [43, 2],
      [48, 2], [43, 2], [48, 2], [43, 2],
    ],
  },
};

const midiToHz = (pitch: number) => 440 * 2 ** ((pitch - 69) / 12);

function encodeWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const length = buffer.length * channels * 2;
  const view = new DataView(new ArrayBuffer(44 + length));
  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1)
      view.setUint8(offset + index, value.charCodeAt(index));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  const data = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
  let offset = 44;
  for (let index = 0; index < buffer.length; index += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, data[channel][index]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: 'audio/wav' });
}

const cache = new Map<DemoTrackId, Promise<string>>();

/** Renders a demo score twice through (≈30–40 s) into a WAV object URL. */
export function renderDemoTrack(id: DemoTrackId): Promise<string> {
  const cached = cache.get(id);
  if (cached) return cached;
  const promise = (async () => {
    const score = scores[id];
    const beat = 60 / score.bpm;
    const loopBeats = score.lead.reduce((sum, [, beats]) => sum + beats, 0);
    const seconds = loopBeats * beat * 2 + 1;
    const sampleRate = 22_050;
    const context = new OfflineAudioContext(1, Math.ceil(seconds * sampleRate), sampleRate);
    const master = context.createGain();
    master.gain.value = 0.32;
    master.connect(context.destination);

    const voice = (notes: Note[], wave: OscillatorType, level: number, offsetBeats = 0) => {
      let time = offsetBeats * beat;
      for (let pass = 0; pass < 2; pass += 1) {
        for (const [pitch, beats] of notes) {
          const duration = beats * beat;
          if (pitch !== null && time < seconds) {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.type = wave;
            osc.frequency.value = midiToHz(pitch);
            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.exponentialRampToValueAtTime(level, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.95);
            osc.connect(gain).connect(master);
            osc.start(time);
            osc.stop(time + duration);
          }
          time += duration;
        }
      }
    };

    voice(score.lead, score.leadWave, 0.22);
    voice(score.bass, 'triangle', 0.35);
    const rendered = await context.startRendering();
    return URL.createObjectURL(encodeWav(rendered));
  })();
  cache.set(id, promise);
  return promise;
}
