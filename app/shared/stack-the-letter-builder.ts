import {
  blockAlphabet,
  DEFAULT_BLOCK,
  BLOCK_HEIGHT,
  type Block,
  EMPTY_BLOCK,
} from "./alphabet";

// Board
export type Board = number[][];
/** Board size is currently capped to 1280x720 pixel resolution.
 * This size leads to ...
 * ... Math.floor((1280 + $CELL_GAP) / ($CELL_WIDTH + $CELL_GAP)) ...
 * ... * Math.floor((720 + $CELL_GAP) / ($CELL_WIDTH + $CELL_GAP)) ...
 * ... Cells.
 * Example:
 * $CELL_WIDTH = 4
 * $CELL_GAP = 2
 * 214 * 120 = 25680 cells
 * At this moment i don't want to make it more performance heavy.
 * This cap is realized by ...
 * ... the dynamic-grid-map.ts file ...
 * ... the tailwind.config.ts file ...
 * ... and the board size initialization in Board.tsx.
 */
export const MAX_BOARD_WIDTH = 1280;
export const MAX_BOARD_HEIGHT = 720;
export const MIN_BOARD_WIDTH = 320;
export const MIN_BOARD_HEIGHT = 178;
export const CELL_WIDTH = 4;
export const CELL_HEIGHT = 4;
export const CELL_GAP = 2;
export const MAX_BOARD_COLUMNS =
  (MAX_BOARD_WIDTH + CELL_GAP) / (CELL_WIDTH + CELL_GAP);
export const MIN_BOARD_COLUMNS =
  (MIN_BOARD_WIDTH + CELL_GAP) / (CELL_WIDTH + CELL_GAP);
export const MAX_BOARD_ROWS =
  (MAX_BOARD_HEIGHT + BLOCK_HEIGHT + CELL_GAP) / (CELL_HEIGHT + CELL_GAP);
export const MIN_BOARD_ROWS = 3 * BLOCK_HEIGHT;
const PADDING_X_BOARD_COLUMNS = 20;

export function getBoard(columns: number, rows: number): Board {
  const board: Board = [
    ...Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => 0)
    ),
  ];
  return board;
}

// TODO: Implement this function
export function getReadableBlocks(options: {
  letter: {
    headline: string;
    message: string;
    regards: string;
  };
  columns: number;
}) {
  const { letter, columns } = options;
  const streamOfBlocks: Block[] = [];
  const letterInWords = {
    headline: letter.headline.toLowerCase().split(" "),
    message: letter.message.toLowerCase().split(" "),
    regards: letter.regards.toLowerCase().split(" "),
  };
  let lastLongestSentence = "";
  let possiblyLongestSentence = "";
  let wordIndex = 0;
  for (const word of letterInWords.headline) {
    if (possiblyLongestSentence === "") {
      possiblyLongestSentence = word;
      continue;
    }
    const lastBlock = transformTextToBlock(lastLongestSentence);
    const block = transformTextToBlock(possiblyLongestSentence);
    if (block[0].length > columns - 2 * PADDING_X_BOARD_COLUMNS) {
      if (lastBlock[0].length > columns - 2 * PADDING_X_BOARD_COLUMNS) {
        // FEATURE: Split on syllables
        const firstPartOfWord = `${lastLongestSentence.substring(
          0,
          Math.floor(lastLongestSentence.length / 2)
        )}-`;
        const secondPartOfWord = lastLongestSentence.substring(
          Math.floor(lastLongestSentence.length / 2)
        );
        const firstBlock = transformTextToBlock(firstPartOfWord);
        const secondBlock = transformTextToBlock(secondPartOfWord);
        if (
          firstBlock[0].length > columns - 2 * PADDING_X_BOARD_COLUMNS ||
          secondBlock[0].length > columns - 2 * PADDING_X_BOARD_COLUMNS
        ) {
          console.error(
            `First part of word '${firstPartOfWord}' is too long for board. The whole word ${lastLongestSentence} will be left out.`
          );
          lastLongestSentence = "";
          possiblyLongestSentence = word;
        } else {
          streamOfBlocks.push(firstBlock);
          streamOfBlocks.push(secondBlock);
          lastLongestSentence = "";
          possiblyLongestSentence = word;
        }
      } else {
        streamOfBlocks.push(lastBlock);
        lastLongestSentence = "";
        possiblyLongestSentence = word;
      }
    } else {
      lastLongestSentence = possiblyLongestSentence;
      if (wordIndex !== 0) {
        possiblyLongestSentence = `${possiblyLongestSentence} ${word}`;
      }
      if (wordIndex === letterInWords.headline.length - 1) {
        const longestPossibleBlock = transformTextToBlock(
          possiblyLongestSentence
        );
        streamOfBlocks.push(longestPossibleBlock);
      }
    }
    wordIndex++;
  }
  // TODO: Same with message and regards
  // maybe add a break into the else statement when there are .,- or other seperators?
  return streamOfBlocks;
}

export function transformTextToBlock(text: string): Block {
  let block = EMPTY_BLOCK;
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
