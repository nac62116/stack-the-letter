import type { loader } from "~/routes/home";
import {
  cellColors,
  FALLBACK_CELL_COLOR,
} from "~/shared/dynamic-cell-color-map";

type MovementDirection = "left" | "right" | "down";
type TetrisBoard = Awaited<ReturnType<typeof loader>>["tetrisBoard"];
type TetrisBlock = Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
export type Position = { x: number; y: number };
export type GameStatus =
  | "idle"
  | "running"
  | "nextBlockPlease"
  | "youWon"
  | "gameOver";
// Side movement is allowed every $SIDE_MOVEMENT_SPEED ms
export const SIDE_MOVEMENT_SPEED = 40 as const;
// Down movement is allowed every $DOWN_MOVEMENT_SPEED ms
export const DOWN_MOVEMENT_SPEED = 200 as const;
// Accelerated down movement is allowed every $ACCELERATED_DOWN_MOVEMENT_SPEED ms
export const ACCELERATED_DOWN_MOVEMENT_SPEED = 40 as const;

export function moveBlock(
  direction: MovementDirection,
  options: {
    board: NonNullable<TetrisBoard>;
    block: TetrisBlock;
    position: Position;
    gameStatus: GameStatus;
  }
) {
  const { board, block, position, gameStatus } = options;
  if (gameStatus !== "running") {
    return { board, block, position, gameStatus };
  }
  let newBoard = board.map((row) => row.slice());
  // Here the explicit type gets lost due to map and slice function -> TetrisBlock is now number[][]
  // These types are mostly the same except:
  // - TetrisBlock has a length of $BLOCK_HEIGHT (see .server/alphabet.ts)
  // -> (f.e. with BLOCK_HEIGHT = 5 -> [number[], number[], number[], number[], number[]])
  // - number[][] can have any length
  let newBlock = block.map((row) => row.slice());
  let isBlockEmpty = true;

  // Preparing the iteration over the board cells where the current block is on
  // If direction is down iterate from bottom to top
  // Else iterate from top to bottom
  const startRowIndex =
    direction === "down" ? position.y + block.length - 1 : position.y;
  const endRowIndex =
    direction === "down" ? position.y : position.y + block.length - 1;
  const rowCondition = (
    rowIndex: number,
    direction: MovementDirection,
    endRowIndex: number
  ) =>
    direction === "down" ? rowIndex >= endRowIndex : rowIndex <= endRowIndex;
  const iterateRowIndex = (rowIndex: number, direction: MovementDirection) =>
    direction === "down" ? rowIndex - 1 : rowIndex + 1;
  // If direction is right iterate from right to left
  // Else iterate from left to right
  const startColumnIndex =
    direction === "right" ? position.x + block[0].length - 1 : position.x;
  const endColumnIndex =
    direction === "right" ? position.x : position.x + block[0].length - 1;
  const columnCondition = (
    columnIndex: number,
    direction: MovementDirection,
    endColumnIndex: number
  ) =>
    direction === "right"
      ? columnIndex >= endColumnIndex
      : columnIndex <= endColumnIndex;
  const iterateColumnIndex = (
    columnIndex: number,
    direction: MovementDirection
  ) => (direction === "right" ? columnIndex - 1 : columnIndex + 1);

  if (direction === "left" || direction === "right") {
    // When any cell of block that has a neighbor inside the block
    // That is either inactive (0) or out of bounds (undefined)
    // Has a neighbor on newBoard that is not inactive (0)
    // Then the block can't move left|right
    // -> return gameState "running", the original board, the original block and the original position
    const canMoveSidewards = newBlock.every((row, rowIndex) =>
      row.every((_cell, columnIndex) => {
        const blockNeighbor =
          newBlock[rowIndex] !== undefined
            ? newBlock[rowIndex][
                direction === "left" ? columnIndex - 1 : columnIndex + 1
              ]
            : undefined;
        const boardNeighbor =
          newBoard[rowIndex + position.y] !== undefined
            ? newBoard[rowIndex + position.y][
                direction === "left"
                  ? columnIndex + position.x - 1
                  : columnIndex + position.x + 1
              ]
            : undefined;
        // There is a block neighbor
        if (blockNeighbor !== undefined && blockNeighbor !== 0) {
          return true;
        }
        // There is no block neighbor
        if (boardNeighbor === 0) {
          return true;
        } else {
          return false;
        }
      })
    );
    if (canMoveSidewards === false) {
      return {
        board,
        block,
        position,
        gameStatus: castToGameStatus("running"),
      };
    }
  }

  // Iterating over the board cells where the current block is on
  for (
    let rowIndex = startRowIndex;
    rowCondition(rowIndex, direction, endRowIndex);
    rowIndex = iterateRowIndex(rowIndex, direction)
  ) {
    for (
      let columnIndex = startColumnIndex;
      columnCondition(columnIndex, direction, endColumnIndex);
      columnIndex = iterateColumnIndex(columnIndex, direction)
    ) {
      const boardCellValue =
        newBoard[rowIndex] !== undefined
          ? newBoard[rowIndex][columnIndex]
          : undefined;
      const blockCellValue =
        block[rowIndex - position.y][columnIndex - position.x];
      // Only if you are a active cell of the block you're involved in movement
      if (blockCellValue !== 0) {
        isBlockEmpty = false;
        // Drop the cell on the board if needed
        if (boardCellValue !== blockCellValue) {
          newBoard[rowIndex][columnIndex] = blockCellValue;
          changeCellOnHTMLBoard({
            rowIndex,
            columnIndex,
            newCellValue: blockCellValue,
          });
        }
        if (direction === "left" || direction === "right") {
          // you can move sidewards here because of early return before the for loops
          changeCellOnHTMLBoard({
            rowIndex,
            columnIndex,
            newCellValue: 0,
          });
          newBoard[rowIndex][columnIndex] = 0;
          changeCellOnHTMLBoard({
            rowIndex,
            columnIndex:
              direction === "left" ? columnIndex - 1 : columnIndex + 1,
            newCellValue: blockCellValue,
          });
          newBoard[rowIndex][
            direction === "left" ? columnIndex - 1 : columnIndex + 1
          ] = blockCellValue;
        } else if (direction === "down") {
          // - if your below neighbor is not inactive (0)
          // - then your neighbor is either active or out of bounds
          // - and therefore you can't move down
          // -> just remove yourself from the current block by setting newBlock cell to 0
          // -> You'll stay on the board where you are and are not a part of your block anymore
          // -> Also check if you are out of top bounds of the board which means youre on row $block.length - 1
          // -> if so return gameState "gameOver", the original board and the original block
          // -> else do nothing
          const neighborValue =
            newBoard[rowIndex + 1] !== undefined
              ? newBoard[rowIndex + 1][columnIndex]
              : undefined;
          if (neighborValue !== 0) {
            newBlock[rowIndex - position.y][columnIndex - position.x] = 0;
            if (rowIndex <= block.length - 1) {
              return {
                board,
                block,
                position,
                gameStatus: castToGameStatus("gameOver"),
              };
            }
          } else {
            // - else you are allowed to move down -> do that by:
            // -> setting your corresponding newBoard cell value to 0
            // -> setting the newBoard cell below you to your value
            changeCellOnHTMLBoard({
              rowIndex,
              columnIndex,
              newCellValue: 0,
            });
            newBoard[rowIndex][columnIndex] = 0;
            changeCellOnHTMLBoard({
              rowIndex: rowIndex + 1,
              columnIndex,
              newCellValue: blockCellValue,
            });
            newBoard[rowIndex + 1][columnIndex] = blockCellValue;
          }
        } else {
          console.error(
            "Unknown direction in moveBlock functiion. The block was not moved."
          );
        }
      }
    }
  }
  const tetrisBlock = castToTetrisBlock(newBlock, block);
  return {
    board: newBoard,
    block: tetrisBlock,
    position: {
      x:
        direction === "left"
          ? position.x - 1
          : direction === "right"
          ? position.x + 1
          : position.x,
      y: direction === "down" ? position.y + 1 : position.y,
    },
    gameStatus: isBlockEmpty
      ? castToGameStatus("nextBlockPlease")
      : castToGameStatus(gameStatus),
  };
}

function castToTetrisBlock(block: number[][], originalBlock: TetrisBlock) {
  // This is the runtime check to verify the assertion to TetrisBlock type
  let newBlock = block;
  if (block.length !== originalBlock.length) {
    console.error(
      "Modified block does not have the same length then original block. Setting original block."
    );
    newBlock = originalBlock;
  }
  return newBlock as TetrisBlock;
}

function castToGameStatus(gameStatus: GameStatus) {
  return gameStatus;
}

function changeCellOnHTMLBoard(options: {
  rowIndex: number;
  columnIndex: number;
  newCellValue: number;
}) {
  const { rowIndex, columnIndex, newCellValue } = options;
  const cellElement = document.querySelector(
    `#row${rowIndex}column${columnIndex}`
  );
  if (cellElement !== null) {
    cellElement.className = `${
      cellColors[newCellValue] || FALLBACK_CELL_COLOR
    } w-1 h-1 rounded-sm`;
  }
}
