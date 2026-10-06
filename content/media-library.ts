/**
 * Music for iPod and Winamp, videos for Videos.
 *
 * - `src` points to an owned audio file in `public/media/music/`.
 * - `demo` renders an original chiptune in the browser (lib/demo-tracks.ts);
 *   these are placeholders until real tracks are added.
 * - Videos are YouTube ids shown in a visible player.
 */
export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
} & ({ src: string; demo?: never } | { demo: DemoTrackId; src?: never });

export type DemoTrackId = 'aqua-morning' | 'night-shift' | 'box-news-theme';

export type VideoItem = { id: string; title: string; youtubeId: string };

export const musicTracks: readonly MusicTrack[] = [
  { id: 'aqua-morning', title: 'Aqua Morning', artist: 'Sushin OS', album: 'Demo Tapes', demo: 'aqua-morning' },
  { id: 'night-shift', title: 'Night Shift', artist: 'Sushin OS', album: 'Demo Tapes', demo: 'night-shift' },
  { id: 'box-news-theme', title: 'Box News Theme', artist: 'Sushin OS', album: 'Demo Tapes', demo: 'box-news-theme' },
];

export const videoItems: readonly VideoItem[] = [];
