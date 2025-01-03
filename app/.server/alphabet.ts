// TODO: Double the resolution of the blocks
// Tetris block
// Five rows for each letter
// prettier-ignore
export type TetrisBlock = [
    number[],
    number[],
    number[],
    number[],
    number[]
];
export const LINE_HEIGHT: TetrisBlock["length"] = 5;
export const DEFAULT_BLOCK: TetrisBlock = [
  [1, 1, 1],
  [0, 0, 1],
  [0, 1, 1],
  [0, 0, 0],
  [0, 1, 0],
];
// More generic type of a tetris block to mutate it inside .server/tetris-load.ts
export type GenericTetrisBlock = Array<(number | undefined)[]>;

export const blockAlphabet: {
  [key: string]: TetrisBlock;
} = {
  a: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  b: [
    [2, 2, 2],
    [2, 0, 2],
    [2, 2, 2],
    [2, 0, 2],
    [2, 2, 2],
  ],
  c: [
    [3, 3, 3],
    [3, 0, 0],
    [3, 0, 0],
    [3, 0, 0],
    [3, 3, 3],
  ],
  d: [
    [4, 4, 0],
    [4, 0, 4],
    [4, 0, 4],
    [4, 0, 4],
    [4, 4, 0],
  ],
  e: [
    [5, 5, 5],
    [5, 0, 0],
    [5, 5, 5],
    [5, 0, 0],
    [5, 5, 5],
  ],
  f: [
    [6, 6, 6],
    [6, 0, 0],
    [6, 6, 6],
    [6, 0, 0],
    [6, 0, 0],
  ],
  g: [
    [7, 7, 7],
    [7, 0, 0],
    [7, 0, 7],
    [7, 0, 7],
    [7, 7, 7],
  ],
  h: [
    [8, 0, 8],
    [8, 0, 8],
    [8, 8, 8],
    [8, 0, 8],
    [8, 0, 8],
  ],
  // prettier-ignore
  i: [
    [9],
    [9],
    [9],
    [9],
    [9]
  ],
  j: [
    [0, 0, 1],
    [0, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  k: [
    [2, 0, 2],
    [2, 0, 2],
    [2, 2, 0],
    [2, 0, 2],
    [2, 0, 2],
  ],
  l: [
    [3, 0, 0],
    [3, 0, 0],
    [3, 0, 0],
    [3, 0, 0],
    [3, 3, 3],
  ],
  m: [
    [4, 0, 4],
    [4, 4, 4],
    [4, 0, 4],
    [4, 0, 4],
    [4, 0, 4],
  ],
  n: [
    [5, 5, 5],
    [5, 0, 5],
    [5, 0, 5],
    [5, 0, 5],
    [5, 0, 5],
  ],
  o: [
    [6, 6, 6],
    [6, 0, 6],
    [6, 0, 6],
    [6, 0, 6],
    [6, 6, 6],
  ],
  p: [
    [7, 7, 7],
    [7, 0, 7],
    [7, 7, 7],
    [7, 0, 0],
    [7, 0, 0],
  ],
  q: [
    [8, 8, 8],
    [8, 0, 8],
    [8, 0, 8],
    [8, 8, 8],
    [0, 0, 8],
  ],
  r: [
    [9, 9, 9],
    [9, 0, 9],
    [9, 9, 9],
    [9, 9, 0],
    [9, 0, 9],
  ],
  s: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  t: [
    [2, 2, 2],
    [0, 2, 0],
    [0, 2, 0],
    [0, 2, 0],
    [0, 2, 0],
  ],
  u: [
    [3, 0, 3],
    [3, 0, 3],
    [3, 0, 3],
    [3, 0, 3],
    [3, 3, 3],
  ],
  v: [
    [4, 0, 4],
    [4, 0, 4],
    [4, 0, 4],
    [4, 0, 4],
    [0, 4, 0],
  ],
  w: [
    [5, 0, 5],
    [5, 0, 5],
    [5, 0, 5],
    [5, 5, 5],
    [5, 0, 5],
  ],
  x: [
    [6, 0, 6],
    [6, 0, 6],
    [0, 6, 0],
    [6, 0, 6],
    [6, 0, 6],
  ],
  y: [
    [7, 0, 7],
    [7, 0, 7],
    [0, 7, 0],
    [0, 7, 0],
    [0, 7, 0],
  ],
  z: [
    [8, 8, 8],
    [0, 0, 8],
    [0, 8, 0],
    [8, 0, 0],
    [8, 8, 8],
  ],
  0: [
    [9, 9, 9],
    [9, 0, 9],
    [9, 0, 9],
    [9, 0, 9],
    [9, 9, 9],
  ],
  1: [
    [0, 1],
    [1, 1],
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  2: [
    [2, 2, 2],
    [0, 0, 2],
    [2, 2, 2],
    [2, 0, 0],
    [2, 2, 2],
  ],
  3: [
    [3, 3, 3],
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 3],
    [3, 3, 3],
  ],
  4: [
    [4, 0, 4],
    [4, 0, 4],
    [4, 4, 4],
    [0, 0, 4],
    [0, 0, 4],
  ],
  5: [
    [5, 5, 5],
    [5, 0, 0],
    [5, 5, 5],
    [0, 0, 5],
    [5, 5, 5],
  ],
  6: [
    [6, 6, 6],
    [6, 0, 0],
    [6, 6, 6],
    [6, 0, 6],
    [6, 6, 6],
  ],
  7: [
    [7, 7, 7],
    [0, 0, 7],
    [0, 0, 7],
    [0, 0, 7],
    [0, 0, 7],
  ],
  8: [
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8],
  ],
  9: [
    [9, 9, 9],
    [9, 0, 9],
    [9, 9, 9],
    [0, 0, 9],
    [9, 9, 9],
  ],
  ä: [
    [1, 0, 1],
    [0, 0, 0],
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  ö: [
    [2, 0, 2],
    [0, 0, 0],
    [2, 2, 2],
    [2, 0, 2],
    [2, 2, 2],
  ],
  ü: [
    [3, 0, 3],
    [0, 0, 0],
    [3, 0, 3],
    [3, 0, 3],
    [3, 3, 3],
  ],
  ß: [
    [4, 4, 4, 0, 4, 4, 4],
    [4, 0, 0, 0, 4, 0, 0],
    [4, 4, 4, 0, 4, 4, 4],
    [0, 0, 4, 0, 0, 0, 4],
    [4, 4, 4, 0, 4, 4, 4],
  ],
  // prettier-ignore
  ".": [
    [0],
    [0],
    [0],
    [0],
    [5],
  ],
  ",": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 6],
    [6, 0],
  ],
  // prettier-ignore
  "!": [
    [7],
    [7],
    [7],
    [0],
    [7],
  ],
  "?": [
    [8, 8, 8],
    [0, 0, 8],
    [0, 8, 8],
    [0, 0, 0],
    [0, 8, 0],
  ],
  // prettier-ignore
  ":": [
    [0],
    [0],
    [9],
    [0],
    [9],
  ],
  ";": [
    [0, 0],
    [0, 1],
    [0, 0],
    [0, 1],
    [1, 0],
  ],
  // prettier-ignore
  " ": [
    [0],
    [0],
    [0],
    [0],
    [0]
],
  "  ": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
};
