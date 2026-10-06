import type { LocalizedText } from '@/content/site-content';
import { wallpaperForLocalHour } from './appearance';

export type WallpaperId =
  | 'forest'
  | 'night-peak'
  | 'lake'
  | 'hills'
  | 'wildflowers'
  | 'beach';

export type WallpaperDefinition = {
  id: WallpaperId;
  src: string;
  thumb: string;
  label: LocalizedText;
  alt: string;
};

/**
 * Temporary localhost-only photos from the 21st.dev Morph Gallery demo. Their
 * license is unknown: replace them before publication (see ASSET_PROVENANCE.md).
 */
export const wallpapers: readonly WallpaperDefinition[] = [
  {
    id: 'forest',
    src: '/wallpapers/morph/forest.jpg',
    thumb: '/wallpapers/morph/forest-thumb.jpg',
    label: { ru: 'Лес', en: 'Forest' },
    alt: 'Sun rays through a forest',
  },
  {
    id: 'night-peak',
    src: '/wallpapers/morph/night-peak.jpg',
    thumb: '/wallpapers/morph/night-peak-thumb.jpg',
    label: { ru: 'Ночная вершина', en: 'Night peak' },
    alt: 'Snow-capped mountain peak at night',
  },
  {
    id: 'lake',
    src: '/wallpapers/morph/lake.jpg',
    thumb: '/wallpapers/morph/lake-thumb.jpg',
    label: { ru: 'Озеро', en: 'Lake' },
    alt: 'Mountain reflected in a still lake',
  },
  {
    id: 'hills',
    src: '/wallpapers/morph/hills.jpg',
    thumb: '/wallpapers/morph/hills-thumb.jpg',
    label: { ru: 'Холмы', en: 'Hills' },
    alt: 'Aerial view of green hills',
  },
  {
    id: 'wildflowers',
    src: '/wallpapers/morph/wildflowers.jpg',
    thumb: '/wallpapers/morph/wildflowers-thumb.jpg',
    label: { ru: 'Цветы', en: 'Wildflowers' },
    alt: 'Orange wildflower field',
  },
  {
    id: 'beach',
    src: '/wallpapers/morph/beach.jpg',
    thumb: '/wallpapers/morph/beach-thumb.jpg',
    label: { ru: 'Пляж', en: 'Beach' },
    alt: 'Tropical beach with clear water',
  },
];

export function isWallpaperId(value: unknown): value is WallpaperId {
  return wallpapers.some((wallpaper) => wallpaper.id === value);
}

/** Automatic mode keeps the 04:00/17:00 schedule: a bright scene by day. */
export function automaticWallpaperFor(hour: number): WallpaperId {
  return wallpaperForLocalHour(hour) === 'day' ? 'forest' : 'night-peak';
}

export function wallpaperIndex(id: WallpaperId) {
  return Math.max(
    0,
    wallpapers.findIndex((wallpaper) => wallpaper.id === id),
  );
}
