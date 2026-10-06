export type Cell = {
  mine: boolean;
  adjacent: number;
  open: boolean;
  flagged: boolean;
};

export type Level = 'beginner' | 'intermediate';

export const levels: Record<Level, { rows: number; cols: number; mines: number }> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
};

export type Board = Cell[][];

export function emptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, adjacent: 0, open: false, flagged: false })),
  );
}

export function neighbours(board: Board, row: number, col: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < board.length && c >= 0 && c < board[0].length) result.push([r, c]);
    }
  }
  return result;
}

/**
 * Mines are placed after the first click, never on it or next to it, so the
 * opening move always reveals an area.
 */
export function plantMines(
  board: Board,
  mines: number,
  safeRow: number,
  safeCol: number,
  random: () => number = Math.random,
): Board {
  const next = board.map((row) => row.map((cell) => ({ ...cell, mine: false, adjacent: 0 })));
  const safe = new Set([`${safeRow}:${safeCol}`, ...neighbours(next, safeRow, safeCol).map(([r, c]) => `${r}:${c}`)]);
  const candidates: Array<[number, number]> = [];
  next.forEach((row, r) => row.forEach((_, c) => !safe.has(`${r}:${c}`) && candidates.push([r, c])));
  for (let placed = 0; placed < Math.min(mines, candidates.length); placed += 1) {
    const pick = placed + Math.floor(random() * (candidates.length - placed));
    [candidates[placed], candidates[pick]] = [candidates[pick], candidates[placed]];
    const [r, c] = candidates[placed];
    next[r][c].mine = true;
  }
  next.forEach((row, r) =>
    row.forEach((cell, c) => {
      cell.adjacent = neighbours(next, r, c).filter(([nr, nc]) => next[nr][nc].mine).length;
    }),
  );
  return next;
}

/** Opens a cell and flood-fills empty regions. Returns a new board. */
export function reveal(board: Board, row: number, col: number): Board {
  const next = board.map((line) => line.map((cell) => ({ ...cell })));
  const stack: Array<[number, number]> = [[row, col]];
  while (stack.length) {
    const [r, c] = stack.pop() as [number, number];
    const cell = next[r][c];
    if (cell.open || cell.flagged) continue;
    cell.open = true;
    if (!cell.mine && cell.adjacent === 0) stack.push(...neighbours(next, r, c));
  }
  return next;
}

export function isWon(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.mine || cell.open));
}

export function isLost(board: Board): boolean {
  return board.some((row) => row.some((cell) => cell.mine && cell.open));
}
