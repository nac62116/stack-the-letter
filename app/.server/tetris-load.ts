import {
  blockAlphabet,
  DEFAULT_BLOCK,
  BLOCK_HEIGHT,
  type TetrisBlock,
} from "./alphabet";
import { splitStringAtIndex } from "./string-helper";

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

export function getBlocksFromTextUntilTheyFit(options: {
  inputBlocks: TetrisBlock[];
  text: string;
  index: number | undefined;
  storyInWords: string[];
  columns: number;
}) {
  const { inputBlocks, text, index, storyInWords, columns } = options;
  if (inputBlocks[0].length <= columns) {
    return inputBlocks;
  }
  // If the text is the headline or regards split it on spaces
  if (index === 1 || index === storyInWords.length - 1) {
    const newTexts = text.split(" ");
    const blocks: TetrisBlock[][] = [];
    for (const newText of newTexts) {
      const newBlocks = getBlocksFromTextUntilTheyFit({
        inputBlocks: [transformTextToTetrisBlock(newText.toLowerCase())],
        text: newText,
        index: undefined,
        storyInWords,
        columns,
      });
      blocks.push(newBlocks);
    }
    return blocks.flat();
  }
  // The text is a word or a part of a word deeper in the recursion
  // Hyphenate the word
  // FEATURE: Hyphenate based on language and syllables
  const hyphenatedText = splitStringAtIndex(text, Math.floor(text.length / 2));
  const firstPart = `${hyphenatedText[0]}-`;
  const secondPart = hyphenatedText[1];
  const firstBlock = transformTextToTetrisBlock(firstPart.toLowerCase());
  const secondBlock = transformTextToTetrisBlock(secondPart.toLowerCase());
  const blocks: TetrisBlock[][] = [];
  const newFirstBlock = getBlocksFromTextUntilTheyFit({
    inputBlocks: [firstBlock],
    text: firstPart,
    index: undefined,
    storyInWords,
    columns,
  });
  const newSecondBlock = getBlocksFromTextUntilTheyFit({
    inputBlocks: [secondBlock],
    text: secondPart,
    index: undefined,
    storyInWords,
    columns,
  });
  blocks.push(newFirstBlock);
  blocks.push(newSecondBlock);

  return blocks.flat();
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
