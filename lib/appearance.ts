export type Wallpaper = 'day' | 'night';

export function wallpaperForLocalHour(hour: number): Wallpaper {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new RangeError('Local hour must be an integer from 0 to 23');
  }
  return hour >= 4 && hour < 17 ? 'day' : 'night';
}
