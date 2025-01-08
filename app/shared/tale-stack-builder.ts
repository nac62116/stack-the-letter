import {
  blockAlphabet,
  DEFAULT_BLOCK,
  BLOCK_HEIGHT,
  type Block,
} from "./alphabet";

// Board
export type Board = number[][];

export function getBoard(columns: number, rows: number): Board {
  const board: Board = [
    ...Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => 0)
    ),
  ];
  return board;
}

export function transformTextToBlock(text: string): Block {
  let block: Block = [[], [], [], [], [], [], [], [], [], []];
  const letters = text.split("");
  // seperator between words but not for the first word
  block = block.map((line, index) =>
    // Runtime check to verify below assertion to Block type
    index < BLOCK_HEIGHT
      ? line[0] !== undefined
        ? [...line, ...blockAlphabet[" "][index]]
        : [...line]
      : undefined
  ) as Block;
  for (const letter of letters) {
    if (letter in blockAlphabet) {
      const typedLetter = letter as keyof typeof blockAlphabet;
      const letterAsBlock = [...blockAlphabet[typedLetter]];
      block = block.map((line, index) => {
        // Runtime check to verify below assertion to Block type
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
      }) as Block;
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
