import type { loader } from "~/routes/home";

export function moveBlock(
  direction: "left" | "right" | "up" | "down",
  options: {
    board: Awaited<ReturnType<typeof loader>>["tetrisBoard"];
    block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
    position: {
      x: number;
      y: number;
    };
  }
) {
  const { board, block, position } = options;
  if (isBlockEmpty(block)) {
    return { board, block, state: "nextBlockPlease" as const };
  }
  const xDelta = direction === "left" ? -1 : direction === "right" ? 1 : 0;
  const yDelta = direction === "up" ? -1 : direction === "down" ? 1 : 0;
  const { board: boardWithoutCurrentBlock } = removeBlockFromBoard({
    board,
    block,
    position,
  });
  const {
    board: newBoard,
    block: newBlock,
    isGameOver,
  } = addBlockToBoard({
    board: boardWithoutCurrentBlock,
    block,
    position: {
      x: position.x + xDelta,
      y: position.y + yDelta,
    },
  });
  return {
    board: newBoard,
    block: newBlock,
    state: isGameOver ? ("gameOver" as const) : ("running" as const),
  };
}

function removeBlockFromBoard(options: {
  board: Awaited<ReturnType<typeof loader>>["tetrisBoard"];
  block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
  position: {
    x: number;
    y: number;
  };
}) {
  const { board, block, position } = options;
  const newBoard = board.map((row, rowIndex) =>
    row.map((cell, columnIndex) => {
      if (
        rowIndex >= position.y &&
        rowIndex < position.y + block.length &&
        columnIndex >= position.x &&
        columnIndex < position.x + block[0].length &&
        block[rowIndex - position.y][columnIndex - position.x] !== 0
      ) {
        return 0;
      }
      return cell;
    })
  );
  return { board: newBoard };
}

function addBlockToBoard(options: {
  board: Awaited<ReturnType<typeof loader>>["tetrisBoard"];
  block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
  position: {
    x: number;
    y: number;
  };
}) {
  const { board, block, position } = options;
  let newBoard = board.map((row) => row.slice());
  let newBlock = block.map((row) => row.slice());
  let isGameOver = false;
  for (let rowIndex = board.length - 1; rowIndex >= 0; rowIndex--) {
    for (let columnIndex = 0; columnIndex < board[0].length; columnIndex++) {
      const currentBoardCellIsInBlockArea =
        rowIndex >= position.y &&
        rowIndex < position.y + block.length &&
        columnIndex >= position.x &&
        columnIndex < position.x + block[0].length;
      const currentBlockCellValue =
        block[rowIndex - position.y] !== undefined &&
        block[rowIndex - position.y][columnIndex - position.x] !== undefined
          ? block[rowIndex - position.y][columnIndex - position.x]
          : undefined;
      if (
        // Only do something when we are in the block area
        currentBoardCellIsInBlockArea &&
        // Only do something when the current cell of the block is active
        currentBlockCellValue !== 0 &&
        currentBlockCellValue !== undefined
      ) {
        // Board cell already taken by another block set it above the block.
        // As we are building the block from bottom to top,
        // we can be sure that the cell above is empty.
        // We are checking the newBoard instead of the board
        // to ensure the logic works when we got multiple cells above each other .
        if (newBoard[rowIndex][columnIndex] !== 0) {
          // Deactivate the current block cell for following render cycles with the same block
          newBlock[rowIndex - position.y][columnIndex - position.x] = 0;
          // if we exceeded the top boundary of the rendered board with this move,
          // we have a game over.
          // Note, that we have $BLOCK_HEIGHT non-active cells at the top of the board
          // to simplify the game logic.
          if (rowIndex - 1 < block.length) {
            isGameOver = true;
          } else {
            newBoard[rowIndex - 1][columnIndex] = currentBlockCellValue;
          }
        } else {
          // Current block cell is active and the corresponding board cell is empty
          // Set the board cell to active
          newBoard[rowIndex][columnIndex] = currentBlockCellValue;
        }
      }
    }
  }
  return { board: newBoard, block: newBlock, isGameOver };
}

function isBlockEmpty(
  block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0]
) {
  return block.every((row) => row.every((cell) => cell === 0));
}

export function hasReachedBoardEdge(
  location: "left" | "right",
  options: {
    board: Awaited<ReturnType<typeof loader>>["tetrisBoard"];
    block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
    position: {
      x: number;
      y: number;
    };
  }
) {
  if (location === "left") {
    return hasReachedLeftEdge(options.position);
  }
  return hasReachedRightEdge(options);
}

function hasReachedRightEdge(options: {
  board: Awaited<ReturnType<typeof loader>>["tetrisBoard"];
  block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
  position: {
    x: number;
    y: number;
  };
}) {
  const { board, block, position } = options;
  const blockWidth = block[0].length;
  const blockRightEdge = position.x + blockWidth;
  // The top, left and bottom boundary of the board is filled with active cells
  // and the top boundary is filled with $BLOCK_HEIGHT non-active cells
  // to simplify the game logic.
  // These boundaries are not rendered. Thats why we use board[0].length - 1 here.
  const boardWidth = board[0].length - 1;
  return blockRightEdge >= boardWidth;
}

function hasReachedLeftEdge(position: { x: number; y: number }) {
  // The top, left and bottom boundary of the board is filled with active cells
  // and the top boundary is filled with $BLOCK_HEIGHT non-active cells
  // to simplify the game logic.
  // These boundaries are not rendered. Thats why we use <= 1 instead of <= 0 here.
  return position.x <= 1;
}

export function hasAdjacentBlock(
  location: "toTheLeft" | "toTheRight" | "above" | "below",
  options: {
    board: Awaited<ReturnType<typeof loader>>["tetrisBoard"];
    block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
    position: {
      x: number;
      y: number;
    };
  }
) {
  const { board, block, position } = options;
  const { board: newBoard } = removeBlockFromBoard({ board, block, position });
  const xDelta =
    location === "toTheLeft" ? -1 : location === "toTheRight" ? 1 : 0;
  const yDelta = location === "above" ? -1 : location === "below" ? 1 : 0;
  const blockHeight = block.length;
  const blockWidth = block[0].length;
  for (let rowIndex = 0; rowIndex < blockHeight; rowIndex++) {
    for (let columnIndex = 0; columnIndex < blockWidth; columnIndex++) {
      if (
        block[rowIndex][columnIndex] !== 0 &&
        newBoard[position.y + rowIndex + yDelta][
          position.x + columnIndex + xDelta
        ] !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}
