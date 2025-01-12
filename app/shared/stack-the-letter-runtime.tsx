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

type MovementDirection =
  | "left"
  | "right"
  | "down"
  | "diagonal-right"
  | "diagonal-left";
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
  const currentBoard = board.map((row) => row.slice());
  let isGameOver = false;
  const currentBlock = block.map((row, rowIndex) => {
    if (isGameOver === true) {
      return row.slice();
    }
    return row.map((cell, columnIndex) => {
      const lastActiveCellRowIndex = block.findLastIndex(
        (tmpRow) => tmpRow[columnIndex] !== 0
      );
      // When cell below the last active cell on current board is not 0 current column is colliding
      const boardCellBelowLastActiveBlockCell =
        currentBoard[position.y + lastActiveCellRowIndex + 1] !== undefined &&
        currentBoard[position.y + lastActiveCellRowIndex + 1][
          position.x + columnIndex
        ] !== undefined
          ? currentBoard[position.y + lastActiveCellRowIndex + 1][
              position.x + columnIndex
            ]
          : undefined;
      const isColliding = boardCellBelowLastActiveBlockCell !== 0;
      if (isColliding === false) {
        // Column of current cell is not colliding, just return the original cell
        return cell;
      }
      if (lastActiveCellRowIndex === -1) {
        // No more active cells in column, just return the current block cell which will be 0
        return cell;
      }
      // Check if first active cell is above the board
      // If so, game over
      const firstActiveCellRowIndex = block.findIndex(
        (tmpRow) => tmpRow[columnIndex] !== 0
      );
      if (firstActiveCellRowIndex === -1) {
        // No active cells in column, just return the current block cell which will be 0
        return cell;
      }
      if (position.y + firstActiveCellRowIndex < block.length) {
        isGameOver = true;
        return cell;
      }

      const lastInactiveCellBeforeActiveCellRowIndex = block.findLastIndex(
        (tmpRow, tmpRowIndex) =>
          lastActiveCellRowIndex !== undefined &&
          tmpRowIndex < lastActiveCellRowIndex &&
          tmpRow[columnIndex] === 0
      );
      if (lastInactiveCellBeforeActiveCellRowIndex === -1) {
        // There is an active cell in the column, but all cells above are active as well
        // Which means the current cell we are looking on is also active
        // Because we are colliding (isColliding === true) we need to remove the current cell
        return 0;
      }
      // There is an active cell in the column and there is at least one inactive cell above
      // If you are below this inactive cell you are colliding and need to be removed
      if (rowIndex > lastInactiveCellBeforeActiveCellRowIndex) {
        return 0;
      }
      // Else return your current value
      return cell;
    });
  });
  if ((isGameOver as boolean) === true) {
    return {
      board,
      cellsToUpdate: [] as CellsToUpdate,
      block,
      position,
      gameStatus: castToGameStatus("gameOver"),
    };
  }
  // Early return when block is empty
  const isBlockEmpty = currentBlock.every((row) =>
    row.every((cell) => {
      return cell === 0;
    })
  );
  if (isBlockEmpty === true) {
    return {
      board,
      cellsToUpdate: [] as CellsToUpdate,
      block,
      position,
      gameStatus: castToGameStatus("nextBlockPlease"),
    };
  }

  // Early return or change of direction when lateral movement is requested but not possible
  let newDirection = direction;
  if (
    newDirection === "left" ||
    newDirection === "right" ||
    newDirection === "diagonal-left" ||
    newDirection === "diagonal-right"
  ) {
    // When any cell of block that has a neighbor inside the block
    // That is either inactive (0) or out of bounds (undefined)
    // Has a neighbor on newBoard that is not inactive (0)
    // Then the block can't move left|right
    // -> return gameState "running", the original board, the original block and the original position
    const canMoveSidewards = currentBlock.every((row, rowIndex) =>
      row.every((_cell, columnIndex) => {
        const blockNeighbor =
          currentBlock[
            newDirection === "diagonal-left" ||
            newDirection === "diagonal-right"
              ? rowIndex + 1
              : rowIndex
          ] !== undefined
            ? currentBlock[
                newDirection === "diagonal-left" ||
                newDirection === "diagonal-right"
                  ? rowIndex + 1
                  : rowIndex
              ][
                newDirection === "left" || newDirection === "diagonal-left"
                  ? columnIndex - 1
                  : columnIndex + 1
              ]
            : undefined;
        const boardNeighbor =
          currentBoard[
            newDirection === "diagonal-left" ||
            newDirection === "diagonal-right"
              ? currentPosition.y + rowIndex + 1
              : currentPosition.y + rowIndex
          ] !== undefined
            ? currentBoard[
                newDirection === "diagonal-left" ||
                newDirection === "diagonal-right"
                  ? currentPosition.y + rowIndex + 1
                  : currentPosition.y + rowIndex
              ][
                newDirection === "left" || newDirection === "diagonal-left"
                  ? currentPosition.x + columnIndex - 1
                  : currentPosition.x + columnIndex + 1
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
      if (
        newDirection !== "diagonal-left" &&
        newDirection !== "diagonal-right"
      ) {
        return {
          board,
          cellsToUpdate: [] as CellsToUpdate,
          block,
          position,
          gameStatus: castToGameStatus("running"),
        };
      } else {
        newDirection = "down";
      }
    }
  }

  // At this point we can guarantee
  // that the block can move in every direction without collision.
  // (see above early returns and block cell removal due to collision);
  // Therefore we can calculate the new board cells
  const newPosition = {
    x:
      newDirection === "left" || newDirection === "diagonal-left"
        ? currentPosition.x - 1
        : newDirection === "right" || newDirection === "diagonal-right"
        ? currentPosition.x + 1
        : currentPosition.x,
    y:
      newDirection === "down" ||
      newDirection === "diagonal-left" ||
      newDirection === "diagonal-right"
        ? currentPosition.y + 1
        : currentPosition.y,
  };
  const boardWithoutBlock = currentBoard.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      if (
        rowIndex >= currentPosition.y &&
        rowIndex < currentPosition.y + currentBlock.length &&
        columnIndex >= currentPosition.x &&
        columnIndex < currentPosition.x + currentBlock[0].length
      ) {
        const currentCell =
          currentBlock[rowIndex - currentPosition.y] !== undefined &&
          currentBlock[rowIndex - currentPosition.y][
            columnIndex - currentPosition.x
          ] !== undefined
            ? currentBlock[rowIndex - currentPosition.y][
                columnIndex - currentPosition.x
              ]
            : undefined;
        if (currentCell !== 0 && currentCell !== undefined) {
          return 0;
        }
      }
      return cell;
    })
  );
  const newBoard = boardWithoutBlock.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      if (
        rowIndex >= newPosition.y &&
        rowIndex < newPosition.y + currentBlock.length &&
        columnIndex >= newPosition.x &&
        columnIndex < newPosition.x + currentBlock[0].length
      ) {
        const currentCell =
          currentBlock[rowIndex - newPosition.y] !== undefined &&
          currentBlock[rowIndex - newPosition.y][
            columnIndex - newPosition.x
          ] !== undefined
            ? currentBlock[rowIndex - newPosition.y][
                columnIndex - newPosition.x
              ]
            : undefined;
        if (currentCell !== 0 && currentCell !== undefined) {
          return currentBlock[rowIndex - newPosition.y][
            columnIndex - newPosition.x
          ];
        }
      }
      return cell;
    })
  );
  const newCellsToUpdate = boardCellElements
    .map((row, rowIndex) =>
      row.map((cellElement, columnIndex) => {
        // The top $BLOCK_HEIGHT rows are not rendered and just used for dropping the block
        // Their corresponding elements on boardCellElements are null
        if (cellElement === null) {
          return {
            element: null,
            className: "",
          };
        }
        // if newBoard cell is the same as the currentBoard cell value -> no need to update
        if (
          newBoard[rowIndex][columnIndex] ===
          currentBoard[rowIndex][columnIndex]
        ) {
          return {
            element: null,
            className: "",
          };
        }
        // Add new board cell to cellsToUpdate
        return {
          element: cellElement,
          className: `${
            cellColors[newBoard[rowIndex][columnIndex]] || FALLBACK_CELL_COLOR
          } ${CELL_WIDTH_CLASS_NAME} ${CELL_HEIGHT_CLASS_NAME} ${CELL_BASE_CLASS_NAME}`,
        };
      })
    )
    .flat();

  const typedBlock = castToBlock(currentBlock, block);
  return {
    board: newBoard,
    cellsToUpdate: cellsToUpdate.concat(newCellsToUpdate),
    block: typedBlock,
    position: newPosition,
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
