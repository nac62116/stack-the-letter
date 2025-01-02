import { blockAlphabet } from "./alphabet";

// Tetris block
// Five rows for each letter
type Matrix = Array<(number | undefined)[]>;
// prettier-ignore
type TetrisBlock = [
    number[],
    number[],
    number[],
    number[],
    number[]
];
const LINE_HEIGHT = 5;
const DEFAULT_BLOCK = [
  [...blockAlphabet["?"][0]],
  [...blockAlphabet["?"][1]],
  [...blockAlphabet["?"][2]],
  [...blockAlphabet["?"][3]],
  [...blockAlphabet["?"][4]],
];

export function transformTextToTetrisBlock(text: string): TetrisBlock {
  const words = text.split(" ");
  // prettier-ignore
  let block: Matrix = [
    [], 
    [], 
    [], 
    [], 
    [],
  ];
  for (const word of words) {
    const letters = word.split("");
    // seperator between words
    block = block.map((line, index) => [...line, ...blockAlphabet[" "][index]]);
    for (const letter of letters) {
      if (letter.toLowerCase() in blockAlphabet) {
        const typedLetter = letter.toLowerCase() as keyof typeof blockAlphabet;
        const letterAsBlock = [...blockAlphabet[typedLetter]];
        block = block.map((line, index) => {
          if (line.some((letter) => letter === undefined)) {
            return [...letterAsBlock[index]];
          }
          if (index >= LINE_HEIGHT) {
            console.error(
              `Block has wrong line height. Beginning a new block with current letter '${typedLetter}'. Block with wrong line height: ${[
                ...block,
              ]}`
            );
            return [...letterAsBlock[index]];
          }
          return [
            ...line,
            // Seperator between letters
            ...blockAlphabet[" "][index],
            // Next letter
            ...letterAsBlock[index],
          ];
        });
      } else {
        console.error(
          `Letter ${letter} not found in alphabet and was left out.`
        );
      }
    }
  }
  if (block.length !== LINE_HEIGHT) {
    console.error("Block has wrong line height");
    return DEFAULT_BLOCK as TetrisBlock;
  }
  if (block.some((line, index) => line[index] === undefined)) {
    console.error("Block has undefined characters inside line");
    return DEFAULT_BLOCK as TetrisBlock;
  }
  return block as TetrisBlock;
}

// Tetris board
type TetrisBoard = number[][];
const BOARD_HEIGHT = LINE_HEIGHT * 5;
const MINIMUM_BOARD_WIDTH = 10;

export function getTetrisBoard(blocks: TetrisBlock[]): TetrisBoard {
  let widestBlockWidth = 0;
  for (const block of blocks) {
    const blockWidth = block[0].length;
    if (blockWidth > widestBlockWidth) {
      widestBlockWidth = blockWidth;
    }
  }
  if (widestBlockWidth < MINIMUM_BOARD_WIDTH) {
    widestBlockWidth = MINIMUM_BOARD_WIDTH;
  }

  const boardWidth = widestBlockWidth + 2;
  const tetrisBoard: TetrisBoard = [
    ...Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: boardWidth }, () => 0)
    ),
  ];

  return tetrisBoard;
}
