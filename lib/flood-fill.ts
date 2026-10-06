type Pixels = { data: Uint8ClampedArray; width: number; height: number };

function hexToRgba(hex: string): [number, number, number, number] {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value;
  const number = Number.parseInt(full.slice(0, 6), 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255, 255];
}

/** Scanline-free 4-way fill with a small tolerance for anti-aliased edges. */
export function floodFill(image: Pixels, x: number, y: number, hex: string, tolerance = 32) {
  const { data, width, height } = image;
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const start = (y * width + x) * 4;
  const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
  const fill = hexToRgba(hex);
  if (target.every((channel, index) => Math.abs(channel - fill[index]) <= 2)) return;

  const matches = (offset: number) =>
    Math.abs(data[offset] - target[0]) <= tolerance &&
    Math.abs(data[offset + 1] - target[1]) <= tolerance &&
    Math.abs(data[offset + 2] - target[2]) <= tolerance &&
    Math.abs(data[offset + 3] - target[3]) <= tolerance;

  const seen = new Uint8Array(width * height);
  const stack = [y * width + x];
  while (stack.length) {
    const index = stack.pop() as number;
    if (seen[index]) continue;
    seen[index] = 1;
    const offset = index * 4;
    if (!matches(offset)) continue;
    data[offset] = fill[0];
    data[offset + 1] = fill[1];
    data[offset + 2] = fill[2];
    data[offset + 3] = fill[3];
    const px = index % width;
    if (px > 0) stack.push(index - 1);
    if (px < width - 1) stack.push(index + 1);
    if (index >= width) stack.push(index - width);
    if (index < width * (height - 1)) stack.push(index + width);
  }
}
