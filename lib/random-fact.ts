export function nextFactIndex(
  factCount: number,
  currentIndex: number,
  randomValue: number,
): number {
  if (!Number.isInteger(factCount) || factCount < 2) return currentIndex;
  if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= factCount) {
    throw new RangeError('currentIndex must identify an existing fact');
  }

  const normalizedRandom = Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON);
  const candidate = Math.floor(normalizedRandom * (factCount - 1));
  return candidate >= currentIndex ? candidate + 1 : candidate;
}
