import {
  blockAlphabet,
  DEFAULT_BLOCK,
  BLOCK_HEIGHT,
  type TetrisBlock,
} from "./alphabet";

export function transformTextToTetrisBlock(text: string): TetrisBlock {
  const words = text.toLowerCase().split(" ");
  let block: TetrisBlock = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
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
      index < BLOCK_HEIGHT
        ? line[0] !== undefined
          ? [...line, ...blockAlphabet[" "][index]]
          : [...line]
        : undefined
    ) as TetrisBlock;
    for (const letter of letters) {
      if (letter in blockAlphabet) {
        const typedLetter = letter as keyof typeof blockAlphabet;
        const letterAsBlock = [...blockAlphabet[typedLetter]];
        block = block.map((line, index) => {
          // Runtime check to verify below assertion to TetrisBlock type (even if it wont ever happen)
          if (index >= BLOCK_HEIGHT) {
            return undefined;
          }
          if (line.some((letter) => letter === undefined)) {
            return [...letterAsBlock[index]];
          }
          if (index >= BLOCK_HEIGHT) {
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
  if (block.length !== BLOCK_HEIGHT) {
    console.error("Block has wrong line height");
    return DEFAULT_BLOCK;
  }
  if (block.some((line, index) => line.some((value) => value === undefined))) {
    console.error("Block has undefined instead of number inside line");
    return DEFAULT_BLOCK;
  }
  return block;
}

// Tetris board
type TetrisBoard = number[][];
// Should be at least 4 times the line height or the game gets really hard
// The top $BLOCK_HEIGHT rows are not rendered and used to drop in the block without seeing it
const BOARD_HEIGHT = BLOCK_HEIGHT * 6;
const MINIMUM_BOARD_WIDTH = 10;
const BOARD_PADDING = 2;

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

  const boardWidth = widestBlockWidth + BOARD_PADDING;
  const tetrisBoard: TetrisBoard = [
    ...Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: boardWidth }, () => 0)
    ),
  ];

  return tetrisBoard;
}
