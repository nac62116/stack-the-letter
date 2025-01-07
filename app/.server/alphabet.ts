// Tetris block
// Ten rows for each letter

import type { CellColorNumber } from "~/shared/dynamic-cell-color-map";

// prettier-ignore
export type TetrisBlock = [
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
    CellColorNumber[],
];
export const BLOCK_HEIGHT: TetrisBlock["length"] = 10;

export const blockAlphabet: {
  [key: string]: TetrisBlock;
} = {
  a: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
  ],
  b: [
    [2, 2, 2, 2, 2, 0],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 0, 2, 0],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 0],
  ],
  c: [
    [0, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 3],
  ],
  d: [
    [4, 4, 4, 4, 4, 0],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 0],
  ],
  e: [
    [5, 5, 5, 5, 5, 5],
    [5, 5, 5, 5, 5, 5],
    [5, 5, 0, 0, 0, 0],
    [5, 5, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 0],
    [5, 5, 5, 5, 5, 0],
    [5, 5, 0, 0, 0, 0],
    [5, 5, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5],
    [5, 5, 5, 5, 5, 5],
  ],
  f: [
    [6, 6, 6, 6, 6, 6],
    [6, 6, 6, 6, 6, 6],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 6, 6, 6, 0],
    [6, 6, 6, 6, 6, 0],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 0, 0, 0, 0],
  ],
  g: [
    [0, 7, 7, 7, 7, 7],
    [7, 7, 7, 7, 7, 7],
    [7, 7, 0, 0, 0, 0],
    [7, 7, 0, 0, 0, 0],
    [7, 7, 0, 7, 7, 7],
    [7, 7, 0, 7, 7, 7],
    [7, 7, 0, 0, 7, 7],
    [7, 7, 0, 0, 7, 7],
    [7, 7, 7, 7, 7, 7],
    [0, 7, 7, 7, 7, 0],
  ],
  h: [
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 8, 8, 8, 8],
    [8, 8, 8, 8, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
  ],
  i: [
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
    [9, 9],
  ],
  j: [
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
  ],
  k: [
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 2, 2, 0],
    [2, 2, 2, 2, 0, 0],
    [2, 2, 2, 0, 0, 0],
    [2, 2, 2, 0, 0, 0],
    [2, 2, 2, 0, 0, 0],
    [2, 2, 2, 2, 0, 0],
    [2, 2, 0, 2, 2, 0],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 0, 2, 2],
  ],
  l: [
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3],
  ],
  m: [
    [4, 0, 0, 0, 0, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
  ],
  n: [
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 5, 0, 5, 5],
    [5, 5, 5, 0, 5, 5],
    [5, 5, 5, 5, 5, 5],
    [5, 5, 0, 5, 5, 5],
    [5, 5, 0, 5, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
  ],
  o: [
    [0, 6, 6, 6, 6, 0],
    [6, 6, 6, 6, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 6, 6, 6, 6],
    [0, 6, 6, 6, 6, 0],
  ],
  p: [
    [7, 7, 7, 7, 7, 0],
    [7, 7, 7, 7, 7, 7],
    [7, 7, 0, 0, 7, 7],
    [7, 7, 0, 0, 7, 7],
    [7, 7, 7, 7, 7, 7],
    [7, 7, 7, 7, 7, 0],
    [7, 7, 0, 0, 0, 0],
    [7, 7, 0, 0, 0, 0],
    [7, 7, 0, 0, 0, 0],
    [7, 7, 0, 0, 0, 0],
  ],
  q: [
    [0, 8, 8, 8, 8, 0],
    [8, 8, 8, 8, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 8, 8, 8],
    [8, 8, 8, 8, 8, 0],
    [0, 8, 8, 8, 0, 8],
  ],
  r: [
    [9, 9, 9, 9, 9, 0],
    [9, 9, 9, 9, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 9, 9, 9, 0],
    [9, 9, 9, 9, 9, 0],
    [9, 9, 0, 9, 9, 0],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 0, 0, 9, 9],
  ],
  s: [
    [0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0],
  ],
  t: [
    [2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 0, 2, 2, 0, 0],
  ],
  u: [
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 0],
  ],
  v: [
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [0, 4, 0, 0, 4, 0],
    [0, 4, 4, 4, 4, 0],
    [0, 0, 4, 4, 0, 0],
    [0, 0, 4, 4, 0, 0],
  ],
  w: [
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 5, 5, 5, 5, 5],
    [5, 5, 5, 5, 5, 5],
    [5, 5, 0, 0, 5, 5],
    [5, 0, 0, 0, 0, 5],
  ],
  x: [
    [6, 0, 0, 0, 0, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 6, 6, 6, 6],
    [0, 6, 6, 6, 6, 0],
    [0, 0, 6, 6, 0, 0],
    [0, 0, 6, 6, 0, 0],
    [0, 6, 6, 6, 6, 0],
    [6, 6, 6, 6, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 0, 0, 0, 0, 6],
  ],
  y: [
    [7, 0, 0, 0, 0, 7],
    [7, 7, 0, 0, 7, 7],
    [7, 7, 7, 7, 7, 7],
    [0, 7, 7, 7, 7, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 0, 7, 7, 0, 0],
  ],
  z: [
    [8, 8, 8, 8, 8, 8],
    [8, 8, 8, 8, 8, 8],
    [0, 0, 0, 0, 8, 8],
    [0, 0, 0, 8, 8, 8],
    [0, 0, 8, 8, 8, 0],
    [0, 8, 8, 8, 0, 0],
    [8, 8, 8, 0, 0, 0],
    [8, 8, 0, 0, 0, 0],
    [8, 8, 8, 8, 8, 8],
    [8, 8, 8, 8, 8, 8],
  ],
  0: [
    [0, 9, 9, 9, 9, 0],
    [9, 9, 9, 9, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 0, 9, 9, 9],
    [9, 9, 9, 9, 9, 9],
    [9, 9, 9, 9, 9, 9],
    [9, 9, 9, 0, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 9, 9, 9, 9],
    [0, 9, 9, 9, 9, 0],
  ],
  1: [
    [0, 0, 1, 1],
    [0, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
  ],
  2: [
    [0, 2, 2, 2, 2, 0],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [0, 0, 0, 0, 2, 2],
    [0, 0, 0, 2, 2, 0],
    [0, 0, 2, 2, 0, 0],
    [0, 2, 2, 0, 0, 0],
    [2, 2, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2],
  ],
  3: [
    [0, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 3, 3],
    [0, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 0],
    [0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 3, 3],
    [3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 0],
  ],
  4: [
    [0, 0, 0, 4, 4, 0],
    [0, 0, 4, 4, 4, 0],
    [0, 4, 4, 4, 4, 0],
    [4, 4, 0, 4, 4, 0],
    [4, 4, 0, 4, 4, 0],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4],
    [0, 0, 0, 4, 4, 0],
    [0, 0, 0, 4, 4, 0],
    [0, 0, 0, 4, 4, 0],
  ],
  5: [
    [5, 5, 5, 5, 5, 5],
    [5, 5, 5, 5, 5, 5],
    [5, 5, 0, 0, 0, 0],
    [5, 5, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 0],
    [5, 5, 5, 5, 5, 5],
    [0, 0, 0, 0, 5, 5],
    [0, 0, 0, 0, 5, 5],
    [5, 5, 5, 5, 5, 5],
    [0, 5, 5, 5, 5, 0],
  ],
  6: [
    [0, 6, 6, 6, 6, 0],
    [6, 6, 6, 6, 6, 6],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 0, 0, 0, 0],
    [6, 6, 6, 6, 6, 0],
    [6, 6, 6, 6, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 0, 0, 6, 6],
    [6, 6, 6, 6, 6, 6],
    [0, 6, 6, 6, 6, 0],
  ],
  7: [
    [7, 7, 7, 7, 7, 7],
    [7, 7, 7, 7, 7, 7],
    [0, 0, 0, 7, 7, 7],
    [0, 0, 0, 7, 7, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 0, 7, 7, 0, 0],
    [0, 7, 7, 0, 0, 0],
    [0, 7, 7, 0, 0, 0],
    [7, 7, 0, 0, 0, 0],
    [7, 7, 0, 0, 0, 0],
  ],
  8: [
    [0, 8, 8, 8, 8, 0],
    [8, 8, 8, 8, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [0, 8, 8, 8, 8, 0],
    [0, 8, 8, 8, 8, 0],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [8, 8, 8, 8, 8, 8],
    [0, 8, 8, 8, 8, 0],
  ],
  9: [
    [0, 9, 9, 9, 9, 0],
    [9, 9, 9, 9, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 0, 0, 9, 9],
    [9, 9, 9, 9, 9, 9],
    [0, 9, 9, 9, 9, 9],
    [0, 0, 0, 0, 9, 9],
    [0, 0, 0, 0, 9, 9],
    [9, 9, 9, 9, 9, 9],
    [0, 9, 9, 9, 9, 0],
  ],
  ä: [
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1],
  ],
  ö: [
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 2, 0],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 0, 0, 2, 2],
    [2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 0],
  ],
  ü: [
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 0, 0, 3, 3],
    [3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 0],
  ],
  ß: [
    [0, 4, 4, 4, 4, 0],
    [4, 4, 4, 4, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 4, 4, 0],
    [4, 4, 0, 4, 4, 0],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 0, 4, 4],
    [4, 4, 0, 4, 4, 4],
    [4, 4, 0, 4, 4, 0],
  ],
  ".": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [5, 5],
    [5, 5],
  ],
  ",": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [6, 6],
    [6, 6],
    [6, 0],
  ],
  "!": [
    [7, 7],
    [7, 7],
    [7, 7],
    [7, 7],
    [7, 7],
    [7, 7],
    [7, 7],
    [0, 0],
    [7, 7],
    [7, 7],
  ],
  "?": [
    [0, 8, 8, 8, 8, 0],
    [8, 8, 8, 8, 8, 8],
    [8, 8, 0, 0, 8, 8],
    [0, 0, 0, 0, 8, 8],
    [0, 0, 0, 8, 8, 0],
    [0, 0, 8, 8, 0, 0],
    [0, 0, 8, 8, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 8, 8, 0, 0],
    [0, 0, 8, 8, 0, 0],
  ],
  // prettier-ignore
  ":": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [9, 9],
    [9, 9],
    [0, 0],
    [0, 0],
    [9, 9],
    [9, 9],
  ],
  ";": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [1, 1],
    [1, 1],
    [0, 0],
    [1, 1],
    [1, 1],
    [1, 0],
  ],
  "-": [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ],
  // prettier-ignore
  " ": [
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
],
  "  ": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
};

export const DEFAULT_BLOCK = blockAlphabet["?"];
