import {
  blockAlphabet,
  DEFAULT_BLOCK,
  BLOCK_HEIGHT,
  type Block,
  EMPTY_BLOCK,
} from "./alphabet";
import {
  activeCellColorNumbers,
  type ActiveCellColorNumber,
} from "./dynamic-cell-color-map";

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
const COLUMN_PADDING_X_RELATIVE_TO_SCREEN_WIDTH_FACTOR = 0.02;

export function getBoard(columns: number, rows: number): Board {
  const board: Board = [
    ...Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => 0)
    ),
  ];
  return board;
}

export function getReadableBlocks(options: {
  letter: {
    salutation: string;
    message: string;
    regards: string;
  };
  columns: number;
  screenWidth: number;
}) {
  const { letter, columns, screenWidth } = options;
  const streamOfBlocks: Block[] = [];
  const paddingX = Math.floor(
    screenWidth * COLUMN_PADDING_X_RELATIVE_TO_SCREEN_WIDTH_FACTOR
  );

  for (const letterPart in letter) {
    const typedLetterPart = letterPart as keyof typeof letter;
    let letterPartToProcess = letter[typedLetterPart].toLowerCase().trim();
    while (letterPartToProcess.length > 0) {
      let cutIndex = 1;
      let nextLine = letterPartToProcess.substring(0, cutIndex).trim();
      let block = transformTextToBlock(nextLine);
      while (
        block[0].length <= columns - 2 * paddingX &&
        cutIndex - 1 < letterPartToProcess.length
      ) {
        if (nextLine.search(/[.,:;?!] /) !== -1) {
          nextLine = letterPartToProcess.substring(0, cutIndex - 2);
          block = transformTextToBlock(nextLine);
          break;
        }
        nextLine = letterPartToProcess.substring(0, cutIndex);
        const tmpBlock = transformTextToBlock(nextLine);
        if (tmpBlock[0].length > columns - 2 * paddingX) {
          nextLine = letterPartToProcess.substring(0, cutIndex);
          if (nextLine.lastIndexOf(" ") !== -1) {
            nextLine = nextLine.substring(0, nextLine.lastIndexOf(" "));
            block = transformTextToBlock(nextLine);
          } else {
            let hyphenatedLine;
            const letterAfterCut = letterPartToProcess.at(cutIndex);
            if (
              letterAfterCut !== undefined &&
              letterAfterCut.search(/[ .,:;?!]/) === -1
            ) {
              // FEATURE: Split on syllables
              hyphenatedLine = `${nextLine}-`;
            } else {
              if (
                letterAfterCut !== undefined &&
                letterAfterCut.search(/[.,:;?!]/) !== -1
              ) {
                hyphenatedLine = `${nextLine}${letterAfterCut}`;
                nextLine = hyphenatedLine;
              } else {
                hyphenatedLine = nextLine;
              }
            }
            block = transformTextToBlock(hyphenatedLine);
          }
          break;
        }
        cutIndex++;
        block = tmpBlock;
      }
      streamOfBlocks.push(block);
      letterPartToProcess = letterPartToProcess
        .substring(nextLine.length)
        .trim();
    }
  }

  return streamOfBlocks;
}

export function transformTextToBlock(text: string): Block {
  let block = EMPTY_BLOCK;
  const characters = text.split("");
  const randomCellColorNumber =
    Math.floor(Math.random() * activeCellColorNumbers.length) + 1;
  let currentColor: ActiveCellColorNumber = activeCellColorNumbers.includes(
    randomCellColorNumber as ActiveCellColorNumber
  )
    ? (randomCellColorNumber as ActiveCellColorNumber)
    : activeCellColorNumbers[0];
  let characterIndex = 0;
  for (const character of characters) {
    if (character in blockAlphabet) {
      const typedCharacter = character as keyof typeof blockAlphabet;
      // Switch to a random color after each space
      if (typedCharacter === " ") {
        const randomCellColorNumber =
          Math.floor(Math.random() * activeCellColorNumbers.length) + 1;
        currentColor = activeCellColorNumbers.includes(
          randomCellColorNumber as ActiveCellColorNumber
        )
          ? (randomCellColorNumber as ActiveCellColorNumber)
          : activeCellColorNumbers[0];
      }
      const characterAsBlock = blockAlphabet[typedCharacter].map((row) => {
        return row.map((cell) => {
          if (cell !== 0) {
            return currentColor;
          }
          return cell;
        });
      }) as Block;
      const seperator = blockAlphabet[" "];
      block = block.map((row, rowIndex) => {
        if (characterIndex === characters.length - 1) {
          // seperator between words but not for the last word
          return row.concat(characterAsBlock[rowIndex]);
        }
        return row
          .concat(characterAsBlock[rowIndex])
          .concat(seperator[rowIndex]);
      }) as Block;
    } else {
      console.error(
        `Letter ${character} not found in alphabet and was left out.`
      );
    }
  }
  // Runtime check for above assertions (as Block)
  if (block.length !== BLOCK_HEIGHT) {
    console.error("Block has wrong line height");
    return DEFAULT_BLOCK;
  }
  return block;
}
