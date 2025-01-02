import type { loader } from "~/routes/home";

export function removeBlockFromBoard(options: {
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
  return newBoard;
}

export function addBlockToBoard(options: {
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
        return 1;
      }
      return cell;
    })
  );
  return newBoard;
}

export function hasReachedRightEdge(options: {
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
  const boardWidth = board[0].length;
  return blockRightEdge >= boardWidth;
}

export function hasReachedLeftEdge(position: { x: number; y: number }) {
  return position.x <= 0;
}
