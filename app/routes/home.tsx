import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { getTetrisBoard, transformTextToTetrisBlock } from "~/.server/tetris";
import React from "react";

export function meta({ data: { storyHeadline } }: Route.MetaArgs) {
  return [
    { title: "Story Tetris" },
    { name: "description", content: storyHeadline },
  ];
}

export function loader({}: Route.LoaderArgs) {
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

export default function Home() {
  const { streamOfBlocks, tetrisBoard } = useLoaderData<typeof loader>();

  const [gameState, setGameState] = React.useState<
    "start" | "playing" | "lost" | "won" | "boundaries" | "next-block"
  >("start");
  const startBlock = {
    data: streamOfBlocks[0],
    index: 0,
    boardPosition: { leftTop: { x: 1, y: -1 - streamOfBlocks[0].length } },
    width: streamOfBlocks[0][0].length,
    height: streamOfBlocks[0].length,
  };
  const [currentBlock, setCurrentBlock] = React.useState(startBlock);
  const [currentTetrisBoard, setCurrentTetrisBoard] =
    React.useState(tetrisBoard);

  type Movements = "down" | "left" | "right"; // TODO: Rotate feature: "rotate-right" | "rotate-left"

  const moveBlock = (options: {
    block: typeof currentBlock;
    state: typeof gameState;
    movement: Movements;
  }) => {
    const { block, state, movement } = options;
    const newBlockPosition = {
      leftTop: {
        x:
          movement === "left"
            ? block.boardPosition.leftTop.x - 1
            : movement === "right"
            ? block.boardPosition.leftTop.x + 1
            : block.boardPosition.leftTop.x,
        y:
          movement === "down"
            ? block.boardPosition.leftTop.y + 1
            : block.boardPosition.leftTop.y,
      },
    };
    let newGameState = state;
    for (let blockColumn = 0; blockColumn < block.width; blockColumn++) {
      for (let blockRow = 0; blockRow < block.height; blockRow++) {
        const currentBlockCellValue = block.data[blockRow][blockColumn];
        const currentBlockCellPosition = {
          x: block.boardPosition.leftTop.x + blockColumn,
          y: block.boardPosition.leftTop.y + blockRow,
        };
        const newBlockRow = movement === "down" ? blockRow + 1 : blockRow;
        // newBlockColumn ...
        const newBlockCellPosition = {
          x: block.boardPosition.leftTop.x + blockColumn,
          y: block.boardPosition.leftTop.y + newBlockRow,
        };
        const boardCellValue =
          tetrisBoard[newBlockCellPosition.y] !== undefined
            ? tetrisBoard[newBlockCellPosition.y][newBlockCellPosition.x]
            : undefined;

        if (boardCellValue !== undefined) {
          // Cell of block would like to move on the board
          if (currentBlockCellValue === 1 && boardCellValue === 1) {
            // Block cell would collide with board cell
            if (newBlockPosition.leftTop.y < 0) {
              // Block cell would collide while not being fully on the board. The game is lost.
              newGameState = "lost";
            } else {
              // New block from above
              newGameState = "next-block";
            }
          } else {
            // No collision, all good
            newGameState = "playing";
          }
        } else {
          // Cell of block would like to move out of bounds
          if (newBlockCellPosition.y < 0 === false) {
            // Block cell wants to move below, to the left or to the right of the board
            if (
              newBlockCellPosition.x < 0 ||
              newBlockCellPosition.x >= tetrisBoard[0].length
            ) {
              // Cell of block wants to move to the left or right of the board, which is not possible.
              newGameState = "boundaries";
            } else {
              // Cell of block wants to move below the board, which is not possible and triggers a new block from above.
              if (streamOfBlocks[block.index + 1] === undefined) {
                // No more blocks available, game is won.
                newGameState = "won";
              } else {
                // Next block from above
                newGameState = "next-block";
              }
            }
          } else {
            // Block cell moves above the board, which is okay if not moving to much to left or right.
            if (
              newBlockCellPosition.x < 0 ||
              newBlockCellPosition.x >= tetrisBoard[0].length
            ) {
              // Cell of block wants to move to the left or right of the board, which is not possible.
              newGameState = "boundaries";
            } else {
              // Cell of block wants to move above the board, which is okay, but no need to repaint the board for this specific cell. We will indeed update the block position (see below).
              newGameState = "playing";
            }
          }
        }
      }
    }
    if (newGameState === "lost" || newGameState === "won") {
      setCurrentBlock({ ...startBlock });
    } else if (newGameState === "boundaries") {
      setCurrentBlock({ ...block });
    } else if (newGameState === "next-block") {
      setCurrentBlock({ ...startBlock });
    } else if (newGameState === "playing") {
      setCurrentBlock((previousBlock) => {
        const newPosition = {
          leftTop: {
            x:
              movement === "left"
                ? previousBlock.boardPosition.leftTop.x - 1
                : movement === "right"
                ? previousBlock.boardPosition.leftTop.x + 1
                : previousBlock.boardPosition.leftTop.x,
            y:
              movement === "down"
                ? previousBlock.boardPosition.leftTop.y + 1
                : previousBlock.boardPosition.leftTop.y,
          },
        };
        console.log("newPosition", newPosition);
        return {
          ...previousBlock,
          boardPosition: newPosition,
        };
      });
    } else {
      // Game state "start"
      console.error("Tried to move block in game state 'start'");
    }
    return newGameState;
  };

  const drawBoard = (options: {
    block: typeof currentBlock;
    tetrisBoard: typeof currentTetrisBoard;
  }) => {
    const { block, tetrisBoard } = options;
    const newTetrisBoard = tetrisBoard.map((row, rowIndex) => {
      return row.map((cell, columnIndex) => {
        const matchingBlockCell =
          block.data[rowIndex - block.boardPosition.leftTop.y] !== undefined &&
          block.data[rowIndex - block.boardPosition.leftTop.y][
            columnIndex - block.boardPosition.leftTop.x
          ] !== undefined
            ? block.data[rowIndex - block.boardPosition.leftTop.y][
                columnIndex - block.boardPosition.leftTop.x
              ]
            : undefined;
        return matchingBlockCell !== undefined ? matchingBlockCell : cell;
      });
    });
    setCurrentTetrisBoard(newTetrisBoard);
  };

  React.useEffect(() => {
    console.log("gameState", gameState);
    if (gameState === "start" || gameState === "won" || gameState === "lost") {
      return;
    }
    const interval = setInterval(() => {
      console.log("interval: ");
      console.log({
        moveOptions: {
          block: currentBlock,
          tetrisBoard: currentTetrisBoard,
          state: gameState,
          movement: "down",
        },
      });
      const newGameState = moveBlock({
        block: currentBlock,
        state: gameState,
        movement: "down",
      });
      console.log("newGameState after moveBlock", newGameState);
      if (newGameState === "playing") {
        drawBoard({
          block: currentBlock,
          tetrisBoard: currentTetrisBoard,
        });
        console.log("After drawBoard");
      }
      setGameState(newGameState);
      console.log("After setGameState");
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="w-full h-screen grid place-items-center gap-4 p-4">
      <div className="grid grid-cols-3 gris-rows-1 gap-2">
        <button
          className="border border-gray-600 rounded-md text-white px-4 py-1"
          onClick={() => setGameState("playing")}
        >
          Start
        </button>
        <button
          className="border border-gray-600 rounded-md text-white px-4 py-1"
          onClick={() => setGameState("won")}
        >
          Win
        </button>
        <button
          className="border border-gray-600 rounded-md text-white px-4 py-1"
          onClick={() => setGameState("lost")}
        >
          Loose
        </button>
      </div>
      {/* TODO: grid-cols and -rows depending on board size */}
      <div className="grid grid-cols-58 grid-rows-25 place-items-center gap-1">
        {currentTetrisBoard.map((row, rowIndex) =>
          row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className={`w-4 h-4 ${
                cell === 1 ? "bg-green-700 shadow-sm shadow-gray-400" : ""
              } border border-gray-600 rounded-sm`}
            />
          ))
        )}
      </div>
    </div>
  );
}
