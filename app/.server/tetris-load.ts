import {
  blockAlphabet,
  DEFAULT_BLOCK,
  BLOCK_HEIGHT,
  type TetrisBlock,
} from "./alphabet";

export function transformTextToTetrisBlock(text: string): TetrisBlock {
  let block: TetrisBlock = [[], [], [], [], [], [], [], [], [], []];
  const letters = text.split("");
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
      console.error(`Letter ${letter} not found in alphabet and was left out.`);
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

export function getTetrisBoard(columns: number, rows: number): TetrisBoard {
  const tetrisBoard: TetrisBoard = [
    ...Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => 0)
    ),
  ];
  return tetrisBoard;
}
