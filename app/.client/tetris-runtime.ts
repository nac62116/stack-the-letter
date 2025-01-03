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
        block[rowIndex - position.y][columnIndex - position.x] === 1
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
      const cell = board[rowIndex][columnIndex];
      if (
        // Only do something when we are in the block area
        rowIndex >= position.y &&
        rowIndex < position.y + block.length &&
        columnIndex >= position.x &&
        columnIndex < position.x + block[0].length &&
        // Only do something when the current cell of the block is active
        block[rowIndex - position.y][columnIndex - position.x] === 1
      ) {
        // Board cell already taken by another block set it above the block.
        // As we are building the block from bottom to top,
        // we can be sure that the cell above is empty.
        // We are checking the newBoard instead of the board
        // to ensure the logic works when we got multiple cells above each other .
        if (newBoard[rowIndex][columnIndex] === 1) {
          // Deactivate the current block cell for following render cycles with the same block
          newBlock[rowIndex - position.y][columnIndex - position.x] = 0;
          // if we exceeded the top boundary of the board with this move, we have a game over.
          if (newBoard[rowIndex - 1] === undefined) {
            isGameOver = true;
          } else {
            newBoard[rowIndex - 1][columnIndex] = 1;
          }
        } else {
          // Current block cell is active and the corresponding board cell is empty
          // Set the board cell to active
          newBoard[rowIndex][columnIndex] = 1;
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
        block[rowIndex][columnIndex] === 1 &&
        newBoard[position.y + rowIndex + yDelta][
          position.x + columnIndex + xDelta
        ] === 1
      ) {
        return true;
      }
    }
  }
  return false;
}
