import type { Route } from "./+types/home";
import {
  getTetrisBoard,
  transformTextToTetrisBlock,
} from "~/.server/tetris-load";
import React from "react";
import type { ArrayElement } from "~/shared/type-helper";
import {
  moveBlock,
  hasAdjacentBlock,
  hasReachedBoardEdge,
} from "~/.client/tetris-runtime";
import { invariantResponse } from "~/.server/error-helper";
import { gridCols, gridRows } from "~/shared/dynamic-grid-map";
import type { TetrisBlock } from "~/.server/alphabet";

export function meta({ data: { storyHeadline } }: Route.MetaArgs) {
  return [
    { title: "Story Tetris" },
    { name: "description", content: storyHeadline },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const story = {
    headline: "Hallo Ronja!",
    message: "Das ist der Story Tetris Prototyp.",
    regards: "Hab dich lieb!",
  } as const;

  const streamOfBlocks = [
    transformTextToTetrisBlock(story.headline),
    ...story.message.split(" ").map((word) => transformTextToTetrisBlock(word)),
    transformTextToTetrisBlock(story.regards),
  ];

  const tetrisBoard = getTetrisBoard(streamOfBlocks);
  // I have to limit the tetris board width and height
  // because of limited grid-rows and grid-cols className definitions
  // inside shared/dynamic-grid-map.ts
  // and the limited gridTemplateRows and gridTemplateColumns definitions
  // inside the tailwind.config.ts
  const tetrisBoardWidth = tetrisBoard[0].length;
  const tetrisBoardHeight = tetrisBoard.length;
  const tooWide = tetrisBoardWidth > Object.keys(gridCols).length;
  const tooHigh = tetrisBoardHeight > Object.keys(gridRows).length;
  if (tooWide) {
    console.error(
      "Tetris board is too wide. Either use shorter headline, regards or words in your story or define more grid-cols in shared/dynamic-grid-map.ts and more gridTemplateColumns in tailwind.config.ts"
    );
    invariantResponse(
      tetrisBoardWidth <= Object.keys(gridCols).length,
      "Bad request",
      { status: 400 }
    );
  }
  if (tooHigh) {
    console.error(
      "Tetris board is too high. Either use shorter line and block height inside tetris or define more grid-rows in shared/dynamic-grid-map.ts and more gridTemplateRows in tailwind.config.ts"
    );
    invariantResponse(
      tetrisBoardHeight <= Object.keys(gridRows).length,
      "Bad request",
      { status: 400 }
    );
  }

  console.log(tetrisBoard.length, tetrisBoard[0].length);

  return {
    storyHeadline: story.headline,
    streamOfBlocks,
    tetrisBoard,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { streamOfBlocks, tetrisBoard } = loaderData;

  // States to manage board, current block and automatic down movement
  const initialBoard = tetrisBoard;
  const [board, _setBoard] = React.useState(tetrisBoard);
  const boardRef = React.useRef(board);
  const setBoard = (board: typeof tetrisBoard) => {
    boardRef.current = board;
    _setBoard(board);
  };
  const initialBlock = streamOfBlocks[0];
  const [block, _setBlock] = React.useState(initialBlock);
  const blockRef = React.useRef(block);
  const setBlock = (block: ArrayElement<typeof streamOfBlocks>) => {
    blockRef.current = block;
    _setBlock(block);
  };
  const [blockIndex, _setBlockIndex] = React.useState(0);
  const blockIndexRef = React.useRef(blockIndex);
  const setBlockIndex = (blockIndex: number) => {
    blockIndexRef.current = blockIndex;
    _setBlockIndex(blockIndex);
  };
  const initialPosition = { x: 0, y: initialBlock.length * -1 };
  const [position, _setPosition] = React.useState(initialPosition);
  const positionRef = React.useRef(position);
  const setPosition = (position: { x: number; y: number }) => {
    positionRef.current = position;
    _setPosition(position);
  };
  const [lastDownMove, _setLastDownMove] = React.useState(0);
  const lastDownMoveRef = React.useRef(lastDownMove);
  const setLastDownMove = (lastDownMove: number) => {
    lastDownMoveRef.current = lastDownMove;
    _setLastDownMove(lastDownMove);
  };

  // State to determine if game is running
  const [running, _setRunning] = React.useState(false);
  const runningRef = React.useRef(running);
  const setRunning = (running: boolean) => {
    runningRef.current = running;
    _setRunning(running);
  };

  // States for user movement
  const [left, _setLeft] = React.useState(false);
  const leftRef = React.useRef(left);
  const setLeft = (left: boolean) => {
    leftRef.current = left;
    _setLeft(left);
  };
  const [right, _setRight] = React.useState(false);
  const rightRef = React.useRef(right);
  const setRight = (right: boolean) => {
    rightRef.current = right;
    _setRight(right);
  };

  // Handler for user input
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (runningRef.current === false) {
          setRunning(true);
          setBoard(initialBoard);
          startGame();
        }
      }
      if (event.key === "Escape") {
        setRunning(false);
        setBlock(initialBlock);
        setBlockIndex(0);
        setPosition(initialPosition);
      }
      if (event.key === "ArrowLeft") {
        setLeft(true);
      }
      if (event.key === "ArrowRight") {
        setRight(true);
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
    };
  }, []);

  // Game Loop via window.requestAnimationFrame API
  // -> see https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
  const startGame = () => {
    // Render cycle
    // -> Cycle frequency is Matching the screen refresh rate
    const step: FrameRequestCallback = (timestamp) => {
      const currentBoardState = {
        board: boardRef.current,
        block: blockRef.current,
        position: positionRef.current,
      };
      const currentMovementState = {
        left: leftRef.current,
        right: rightRef.current,
        // TODO: Set difficulty level here.
        // Either on load if it should not be changable during render cycle
        // -> Loader or .server/tetris-load.ts
        // Or on runtime if it should be changable during render cycle
        // -> States and .client/tetris-runtime.ts
        // Current Setting is down movement every 200ms
        down: timestamp - lastDownMoveRef.current >= 200,
      };
      const currentBlockIndex = blockIndexRef.current;
      // Moving current block to the left anytime in the render cycle
      if (currentMovementState.left) {
        setLeft(false);
        // Moving current block to the left only if ...
        // - ... it is not at the left edge of the board
        // and
        // - ... there is no block to the left of the current block
        if (
          hasReachedBoardEdge("left", currentBoardState) === false &&
          hasAdjacentBlock("toTheLeft", currentBoardState) === false
        ) {
          const { board: newBoard } = moveBlock("left", currentBoardState);
          setBoard(newBoard);
          setPosition({
            x: currentBoardState.position.x - 1,
            y: currentBoardState.position.y,
          });
        }
      }
      // Moving block to the right anytime in the render cycle
      if (currentMovementState.right) {
        setRight(false);
        // Moving block to the right only if ...
        // - ... it is not at the right edge of the board
        // and
        // - ... there is no block to the right of the block
        if (
          hasReachedBoardEdge("right", currentBoardState) === false &&
          hasAdjacentBlock("toTheRight", currentBoardState) === false
        ) {
          const { board: newBoard } = moveBlock("right", currentBoardState);
          setBoard(newBoard);
          setPosition({
            x: currentBoardState.position.x + 1,
            y: currentBoardState.position.y,
          });
        }
      }
      // Moving block down with the frequency defined in currentMovementState
      if (currentMovementState.down) {
        setLastDownMove(timestamp);
        if (hasReachedBoardEdge("bottom", currentBoardState)) {
          const nextBlock = streamOfBlocks[currentBlockIndex + 1];
          if (nextBlock === undefined) {
            // TODO: You won the game
            setRunning(false);
            return;
          }
          setBlock(nextBlock);
          setBlockIndex(currentBlockIndex + 1);
          setPosition(initialPosition);
        } else {
          const {
            board: newBoard,
            // This is the consumed block
            // -> every cell that has arrived at another exisiting cell was cut off
            block: newBlock,
            state,
          } = moveBlock("down", currentBoardState);
          // TODO: Check if there are fully active rows
          // -> If so, remove them and move all rows above down
          setBoard(newBoard);
          setPosition({
            x: currentBoardState.position.x,
            y: currentBoardState.position.y + 1,
          });
          // This state is returned when the block was fully consumed (aka cannot move anymore)
          if (state === "nextBlockPlease") {
            const nextBlock = streamOfBlocks[currentBlockIndex + 1];
            if (nextBlock === undefined) {
              // TODO: You won the game
              setRunning(false);
              return;
            }
            setBlock(nextBlock);
            setBlockIndex(currentBlockIndex + 1);
            setPosition(initialPosition);
          }
          if (state === "gameOver") {
            // TODO: You lost the game
            setRunning(false);
            return;
          }
          // The second check in this condition prooves the type assertion on runtime
          if (
            state === "running" &&
            newBlock.length === currentBoardState.block.length
          ) {
            setBlock(newBlock as TetrisBlock);
          }
        }
      }
      if (runningRef.current) {
        window.requestAnimationFrame(step);
      }
    };
    if (runningRef.current) {
      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="w-full h-screen grid place-items-center gap-4 p-4">
      {/* TODO: grid-cols and -rows depending on board size */}
      <div
        className={`grid ${gridRows[boardRef.current.length - 1]} ${
          gridCols[boardRef.current[0].length - 1]
        } place-items-center gap-1`}
      >
        {boardRef.current.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`${
                cell === 1 ? "bg-green-700" : "bg-inherit"
              } w-4 h-4 border border-gray-600 rounded-sm`}
            />
          ))
        )}
      </div>
    </div>
  );
}
