import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getTetrisBoard, transformTextToTetrisBlock } from "~/.server/tetris";
import React from "react";
import { removeBlock, renderBlock } from "~/.client/renderBlock";

export function meta({ data: { storyHeadline } }: Route.MetaArgs) {
  return [
    { title: "Story Tetris" },
    { name: "description", content: storyHeadline },
    { name: "description", content: "" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const story = {
    headline: "Wie ich dich Liebe",
    message: "To be written...",
    regards: "Hab dich lieb!",
  } as const;

  const streamOfBlocks = [
    transformTextToTetrisBlock(story.headline),
    ...story.message.split(" ").map((word) => transformTextToTetrisBlock(word)),
    transformTextToTetrisBlock(story.regards),
  ];

  const tetrisBoard = getTetrisBoard(streamOfBlocks);

  return {
    storyHeadline: story.headline,
    streamOfBlocks,
    tetrisBoard,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { streamOfBlocks, tetrisBoard } = loaderData;

  // Initial block and position
  let currentBlock = streamOfBlocks[0];
  let currentPosition = { x: 0, y: currentBlock.length * -1 };

  // States for input elements
  const [start, _setStart] = React.useState(false);
  const startRef = React.useRef(start);
  const setStart = (start: boolean) => {
    startRef.current = start;
    _setStart(start);
  };
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
        if (startRef.current === false) {
          setStart(true);
          startGame();
        }
      }
      if (event.key === "Escape") {
        setStart(false);
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
    let start: number | undefined;
    let last = 0;
    const step: FrameRequestCallback = (timestamp) => {
      // Render cycle (Matching the screen refresh rate)
      if (start === undefined) {
        start = timestamp;
      }
      // Moving block to the left anytime in the render cycle
      if (leftRef.current) {
        removeBlock({
          block: currentBlock,
          position: { x: currentPosition.x, y: currentPosition.y },
        });
        currentPosition.x -= 1;
        renderBlock({
          block: currentBlock,
          position: { x: currentPosition.x, y: currentPosition.y },
        });
        setLeft(false);
      }
      // Moving block to the right anytime in the render cycle
      if (rightRef.current) {
        removeBlock({
          block: currentBlock,
          position: { x: currentPosition.x, y: currentPosition.y },
        });
        currentPosition.x += 1;
        renderBlock({
          block: currentBlock,
          position: { x: currentPosition.x, y: currentPosition.y },
        });
        setRight(false);
      }
      // Move block down every second
      if (!last || timestamp - last >= 1000) {
        last = timestamp;
        removeBlock({
          block: currentBlock,
          position: { x: currentPosition.x, y: currentPosition.y },
        });
        currentPosition.y += 1;
        renderBlock({
          block: currentBlock,
          position: { x: currentPosition.x, y: currentPosition.y },
        });
      }
      if (startRef.current) {
        requestAnimationFrame(step);
      }
    };
    if (startRef.current) {
      requestAnimationFrame(step);
    }
  };

  return (
    <div className="w-full h-screen grid place-items-center gap-4 p-4">
      {/* TODO: grid-cols and -rows depending on board size */}
      <div className="grid grid-cols-58 grid-rows-25 place-items-center gap-1">
        {tetrisBoard.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              id={`${rowIndex}-${columnIndex}`}
              key={`${rowIndex}-${columnIndex}`}
              className={`board-cell w-4 h-4 border border-gray-600 rounded-sm`}
            />
          ))
        )}
      </div>
    </div>
  );
}
