import {
  blockAlphabet,
  DEFAULT_BLOCK,
  LINE_HEIGHT,
  type GenericTetrisBlock,
  type TetrisBlock,
} from "./alphabet";

export function transformTextToTetrisBlock(text: string): TetrisBlock {
  const words = text.split(" ");
  // prettier-ignore
  let block: TetrisBlock = [
    [], 
    [], 
    [], 
    [], 
    [],
  ];
  for (const word of words) {
    const letters = word.split("");
    // seperator between words but not for the first word
    block = block.map((line, index) =>
      // Runtime check to verify below assertion to TetrisBlock type (even if it wont ever happen)
      index < LINE_HEIGHT
        ? line[0] !== undefined
          ? [...line, ...blockAlphabet[" "][index]]
          : [...line]
        : undefined
    ) as TetrisBlock;
    for (const letter of letters) {
      if (letter.toLowerCase() in blockAlphabet) {
        const typedLetter = letter.toLowerCase() as keyof typeof blockAlphabet;
        const letterAsBlock = [...blockAlphabet[typedLetter]];
        block = block.map((line, index) => {
          // Runtime check to verify below assertion to TetrisBlock type (even if it wont ever happen)
          if (index >= LINE_HEIGHT) {
            return undefined;
          }
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
          // No seperator if its the first letter
          if (line[0] === undefined) {
            return [...letterAsBlock[index]];
          }
          return [
            ...line,
            // Seperator between letters
            ...blockAlphabet[" "][index],
            // Next letter
            ...letterAsBlock[index],
          ];
        }) as TetrisBlock;
      } else {
        console.error(
          `Letter ${letter} not found in alphabet and was left out.`
        );
      }
    }
  }
  if (block.length !== LINE_HEIGHT) {
    console.error("Block has wrong line height");
    return DEFAULT_BLOCK;
  }
  if (block.some((line, index) => line[index] === undefined)) {
    console.error("Block has undefined characters inside line");
    return DEFAULT_BLOCK;
  }
  return block;
}

// Tetris board
type TetrisBoard = number[][];
// Should be at least 3 times the line height or the game gets really hard
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
