import {
  CELL_BASE_CLASS_NAME,
  CELL_HEIGHT_CLASS_NAME,
  CELL_WIDTH_CLASS_NAME,
} from "~/components/Board";
import { type Block } from "~/shared/alphabet";
import {
  cellColors,
  FALLBACK_CELL_COLOR,
} from "~/shared/dynamic-cell-color-map";
import type { Board } from "./stack-the-letter-builder";

type MovementDirection = "left" | "right" | "down";
export type BoardCellElements = (Element | null)[][];
export type Position = { x: number; y: number };
export type GameStatus =
  | "idle"
  | "running"
  | "nextBlockPlease"
  | "youWon"
  | "gameOver";
export type CellsToUpdate = {
  element: Element | null;
  className: string;
}[];
// Side movement is allowed every $SIDE_MOVEMENT_SPEED ms
export const SIDE_MOVEMENT_SPEED = 30 as const;
// Down movement is allowed every $DOWN_MOVEMENT_SPEED ms
export const DOWN_MOVEMENT_SPEED = 200 as const;
// Accelerated down movement is allowed every $ACCELERATED_DOWN_MOVEMENT_SPEED ms
export const ACCELERATED_DOWN_MOVEMENT_SPEED = 30 as const;

export function moveBlock(
  direction: MovementDirection,
  options: {
    board: Board;
    boardCellElements: BoardCellElements;
    cellsToUpdate: CellsToUpdate;
    block: Block;
    position: Position;
    gameStatus: GameStatus;
  }
) {
  const {
    board,
    boardCellElements,
    cellsToUpdate,
    block,
    position,
    gameStatus,
  } = options;
  // Early return when game is not running
  if (gameStatus !== "running") {
    return {
      board,
      block,
      position,
      gameStatus,
      cellsToUpdate: [] as CellsToUpdate,
    };
  }

  const currentPosition = {
    x: position.x,
    y: position.y,
  };
  console.time("Init currentBoard: ");
  const currentBoard = board.map((row) => row.slice());
  console.timeEnd("Init currentBoard: ");
  console.time("Init newBlock: ");
  let cellBelowLastActiveCellOfColumn: number | undefined;
  const newBlock = block.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      if (rowIndex === 0) {
        // TODO: Calculate real last active cell of column
        let lastActiveCell;
        const rowAtLastActiveCellOfColumnIndex = block.findIndex(
          (tempRow) => tempRow[columnIndex] === 0
        );
        let rowBelowLastActiveCellOfColumnIndex;
        if (rowAtLastActiveCellOfColumnIndex === -1) {
          rowBelowLastActiveCellOfColumnIndex = position.y + block.length;
        } else {
          rowBelowLastActiveCellOfColumnIndex =
            position.y + rowAtLastActiveCellOfColumnIndex + 1;
        }
        cellBelowLastActiveCellOfColumn =
          currentBoard[rowBelowLastActiveCellOfColumnIndex] !== undefined &&
          currentBoard[rowBelowLastActiveCellOfColumnIndex][columnIndex] !==
            undefined
            ? currentBoard[rowBelowLastActiveCellOfColumnIndex][columnIndex]
            : undefined;
      }

      // const cellBelowLastActiveCellOfColumn =
      //   currentBoard[currentPosition.y + block.length][columnIndex];
      if (cellBelowLastActiveCellOfColumn !== 0) {
        // Current column reached bottom boundary or other block
        // -> return 0 to remove the current cell from the block
        return 0;
      }
      // Current column can move downwards without collision and can therefore stay in the block
      return cell;
    })
  );
  console.timeEnd("Init newBlock: ");
  console.time("Check if block is empty: ");
  // Early return when block is empty
  const isBlockEmpty = newBlock.every((row) =>
    row.every((cell) => {
      return cell === 0;
    })
  );
  console.timeEnd("Check if block is empty: ");
  if (isBlockEmpty === true) {
    if (currentPosition.y < newBlock.length) {
      // Block is above the board -> game over
      return {
        board,
        cellsToUpdate: [] as CellsToUpdate,
        block,
        position,
        gameStatus: castToGameStatus("gameOver"),
      };
    } else {
      return {
        board,
        cellsToUpdate: [] as CellsToUpdate,
        block,
        position,
        gameStatus: castToGameStatus("nextBlockPlease"),
      };
    }
  }
  // Early return when lateral movement is requested but not possible
  if (direction === "left" || direction === "right") {
    // When any cell of block that has a neighbor inside the block
    // That is either inactive (0) or out of bounds (undefined)
    // Has a neighbor on newBoard that is not inactive (0)
    // Then the block can't move left|right
    // -> return gameState "running", the original board, the original block and the original position
    console.time("Check if block can move sideways: ");
    const canMoveSidewards = newBlock.every((row, rowIndex) =>
      row.every((_cell, columnIndex) => {
        const blockNeighbor =
          newBlock[rowIndex] !== undefined
            ? newBlock[rowIndex][
                direction === "left" ? columnIndex - 1 : columnIndex + 1
              ]
            : undefined;
        const boardNeighbor =
          currentBoard[rowIndex + currentPosition.y] !== undefined
            ? currentBoard[rowIndex + currentPosition.y][
                direction === "left"
                  ? columnIndex + currentPosition.x - 1
                  : columnIndex + currentPosition.x + 1
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
    console.timeEnd("Check if block can move sideways: ");
    if (canMoveSidewards === false) {
      return {
        board,
        cellsToUpdate: [] as CellsToUpdate,
        block,
        position,
        gameStatus: castToGameStatus("running"),
      };
    }
  }

  // At this point we can guarantee
  // that the block can move in every direction without collision.
  // (see above early returns);
  // Therefore we can calculate the new board cells

  // TODO:
  // Downwards: if we are on the first active cell of a block column -> return 0
  // if we are one below the last active cell of a block column
  // -> return value of last active cell of this block column
  // Left: If we are on the last active cell of a block row -> return 0
  // If we are onne cell left to the first active cell of a block row
  // -> return value of first active cell of this block row
  // Right: If we are on the first active cell of a block row -> return 0
  // If we are one cell right to the last active cell of a block row
  // -> return value of last active cell of this block row

  console.time("Calculate new board cells: ");

  const newBoard = currentBoard.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      const correspondingBlockCell =
        newBlock[rowIndex - currentPosition.y] !== undefined &&
        newBlock[rowIndex - currentPosition.y][
          columnIndex - currentPosition.x
        ] !== undefined
          ? newBlock[rowIndex - currentPosition.y][
              columnIndex - currentPosition.x
            ]
          : undefined;
      const yDelta = direction === "down" ? -1 : 0;
      const xDelta = direction === "left" ? 1 : direction === "right" ? -1 : 0;
      const correspondingBlockCellNeighbor =
        newBlock[rowIndex - currentPosition.y + yDelta] !== undefined &&
        newBlock[rowIndex - currentPosition.y + yDelta][
          columnIndex - currentPosition.x + xDelta
        ] !== undefined
          ? newBlock[rowIndex - currentPosition.y + yDelta][
              columnIndex - currentPosition.x + xDelta
            ]
          : undefined;

      if (correspondingBlockCell === undefined) {
        // We are anywhere outside the block
        // If right neighbor (on left move) is on the block
        // -> return the value of right neighbor
        // Else we are on a cell that is not involved in movement
        // -> return the value of the cell
        if (correspondingBlockCellNeighbor !== undefined) {
          return correspondingBlockCellNeighbor;
        } else {
          return cell;
        }
      } else {
        // We are inside the block
        // If right neighbor (on left move) is on the block
        // -> return the value of right neighbor
        // Else we are on a cell where the currentBlock was before and now has moved away
        // -> return 0
        if (correspondingBlockCellNeighbor !== undefined) {
          return correspondingBlockCellNeighbor;
        } else {
          return 0;
        }
      }
    })
  );

  // const newBoard = currentBoard.map((row, rowIndex) =>
  //   row.map((cell, columnIndex) => {
  //     const yDelta = direction === "down" ? -1 : 0;
  //     const xDelta = direction === "left" ? 1 : direction === "right" ? -1 : 0;
  //     const neighborBoardCellOnBlock =
  //       newBlock[rowIndex - currentPosition.y + yDelta] !== undefined &&
  //       newBlock[rowIndex - currentPosition.y + yDelta][
  //         columnIndex - currentPosition.x + xDelta
  //       ] !== undefined
  //         ? newBlock[rowIndex - currentPosition.y + yDelta][
  //             columnIndex - currentPosition.x + xDelta
  //           ]
  //         : undefined;
  //     if (neighborBoardCellOnBlock !== undefined) {
  //       return neighborBoardCellOnBlock;
  //     }
  //     const currentBoardCellOnBlock =
  //       newBlock[rowIndex] !== undefined &&
  //       newBlock[rowIndex][columnIndex] !== undefined
  //         ? newBlock[rowIndex][columnIndex]
  //         : undefined;
  //     if (currentBoardCellOnBlock !== undefined) {
  //       return 0;
  //     }
  //     return cell;
  //   })
  // );
  console.timeEnd("Calculate new board cells: ");
  console.time("Gather cell elements to update: ");
  // Check which cells changed and need therefore to be updated
  const currentBoardCellElements = boardCellElements.map((row) => row.slice());
  const newCellsToUpdate = newBoard
    .map((row, rowIndex) =>
      row.map((cell, columnIndex) => {
        // if we are above the rendered board
        if (rowIndex < newBlock.length) {
          return {
            element: null,
            className: "",
          };
        }
        // if newBoard cell is the same as the currentBoard cell value
        if (cell === currentBoard[rowIndex][columnIndex]) {
          return {
            element: null,
            className: "",
          };
        }
        // Add new board cell to cellsToUpdate
        return {
          element: currentBoardCellElements[rowIndex][columnIndex],
          className: `${
            cellColors[cell] || FALLBACK_CELL_COLOR
          } ${CELL_WIDTH_CLASS_NAME} ${CELL_HEIGHT_CLASS_NAME} ${CELL_BASE_CLASS_NAME}`,
        };
      })
    )
    .flat();
  console.timeEnd("Gather cell elements to update: ");

  const typedBlock = castToBlock(newBlock, block);
  return {
    board: newBoard,
    cellsToUpdate: cellsToUpdate.concat(newCellsToUpdate),
    block: typedBlock,
    position: {
      x:
        direction === "left"
          ? currentPosition.x - 1
          : direction === "right"
          ? currentPosition.x + 1
          : currentPosition.x,
      y: direction === "down" ? currentPosition.y + 1 : currentPosition.y,
    },
    gameStatus: castToGameStatus(gameStatus),
  };
}

function castToBlock(block: number[][], originalBlock: Block) {
  // This is the runtime check to verify the assertion to Block type
  let newBlock = block;
  if (block.length !== originalBlock.length) {
    console.error(
      "Modified block does not have the same length then original block. Setting original block."
    );
    newBlock = originalBlock;
  }
  return newBlock as Block;
}

export function castToGameStatus(gameStatus: GameStatus) {
  return gameStatus;
}
