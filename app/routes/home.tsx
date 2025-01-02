import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getTetrisBoard, transformTextToTetrisBlock } from "~/.server/tetris";
import React from "react";
import type { ArrayElement } from "~/shared/type-helper";
import {
  addBlockToBoard,
  hasReachedLeftEdge,
  hasReachedRightEdge,
  removeBlockFromBoard,
} from "~/.client/board";

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

  console.log(tetrisBoard.length, tetrisBoard[0].length);

  return {
    storyHeadline: story.headline,
    streamOfBlocks,
    tetrisBoard,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { streamOfBlocks, tetrisBoard } = loaderData;

  // States to manage board, blocks and automatic down movement
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

  // States and handler for user movement
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

  // Manage Tetris Board via requestAnimationFrame API from window:
  const startGame = () => {
    // Render cycle (Matching the screen refresh rate)
    const step: FrameRequestCallback = (timestamp) => {
      // Moving block to the left anytime in the render cycle
      if (leftRef.current) {
        setLeft(false);
        // Moving block to the left only if it is not at the left edge of the board
        if (hasReachedLeftEdge(positionRef.current) === false) {
          // TODO: Check if most left cells would collide with other board cells
          const boardWithoutCurrentBlock = removeBlockFromBoard({
            board: boardRef.current,
            block: blockRef.current,
            position: positionRef.current,
          });
          const newBoard = addBlockToBoard({
            board: boardWithoutCurrentBlock,
            block: blockRef.current,
            // This determines the movement of the block
            position: {
              x: positionRef.current.x - 1,
              y: positionRef.current.y,
            },
          });
          setBoard(newBoard);
          setPosition({
            x: positionRef.current.x - 1,
            y: positionRef.current.y,
          });
        }
      }
      // Moving block to the right anytime in the render cycle
      if (rightRef.current) {
        setRight(false);
        // Moving block to the right only if it is not at the right edge of the board
        if (
          hasReachedRightEdge({
            board: boardRef.current,
            block: blockRef.current,
            position: positionRef.current,
          }) === false
        ) {
          // TODO: Check if most right cells would collide with other board cells
          const boardWithoutCurrentBlock = removeBlockFromBoard({
            board: boardRef.current,
            block: blockRef.current,
            position: positionRef.current,
          });
          const newBoard = addBlockToBoard({
            board: boardWithoutCurrentBlock,
            block: blockRef.current,
            // This determines the movement of the block
            position: {
              x: positionRef.current.x + 1,
              y: positionRef.current.y,
            },
          });
          setBoard(newBoard);
          setPosition({
            x: positionRef.current.x + 1,
            y: positionRef.current.y,
          });
        }
      }
      // TODO: Check if block collides with other blocks
      // What i want:
      // - Each cell of block should move down if it is able to
      // - If every cell of block cannot move down anymore -> next block
      // Move block down every half second
      if (timestamp - lastDownMoveRef.current >= 200) {
        setLastDownMove(timestamp);
        const blockReachedBottom =
          positionRef.current.y + blockRef.current.length >= tetrisBoard.length;
        if (blockReachedBottom) {
          const nextBlock = streamOfBlocks[blockIndexRef.current + 1];
          if (nextBlock === undefined) {
            setRunning(false);
            return;
          }
          setBlock(nextBlock);
          setBlockIndex(blockIndexRef.current + 1);
          setPosition(initialPosition);
        } else {
          const boardWithoutCurrentBlock = removeBlockFromBoard({
            board: boardRef.current,
            block: blockRef.current,
            position: positionRef.current,
          });
          const newBoard = addBlockToBoard({
            board: boardWithoutCurrentBlock,
            block: blockRef.current,
            // This determines the movement of the block
            position: {
              x: positionRef.current.x,
              y: positionRef.current.y + 1,
            },
          });
          setBoard(newBoard);
          setPosition({
            x: positionRef.current.x,
            y: positionRef.current.y + 1,
          });
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
      <div className="grid grid-cols-45 grid-rows-25 place-items-center gap-1">
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
