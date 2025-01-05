import type { Route } from "./+types/home";
import {
  getTetrisBoard,
  transformWordToTetrisBlock,
} from "~/.server/tetris-load";
import React from "react";
import type { ArrayElement } from "~/shared/type-helper";
import { type GameState, moveBlock } from "~/.client/tetris-runtime";
import { invariantResponse } from "~/.server/error-helper";
import { gridCols, gridRows } from "~/shared/dynamic-grid-map";
import { BLOCK_HEIGHT } from "~/.server/alphabet";
import {
  cellColors,
  FALLBACK_CELL_COLOR,
} from "~/shared/dynamic-cell-color-map";

export function meta({
  data: {
    story: { headline },
  },
}: Route.MetaArgs) {
  return [
    { title: "Story Tetris" },
    { name: "description", content: headline },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const author = "Colin";
  const story = {
    // Current maximum word size is ABCDEFGHIJKL with 12 characters
    headline: "ABCDEFGHIJKL MNO PQR STU VWX YZ",
    message: "Ä Ö Ü ß ? ! , . - ; :",
    regards: "012 345 6789",
  } as const;

  const streamOfBlocks = [
    ...story.headline
      .split(" ")
      .map((word) => transformWordToTetrisBlock(word.toLowerCase())),
    ...story.message
      .split(" ")
      .map((word) => transformWordToTetrisBlock(word.toLowerCase())),
    ...story.regards
      .split(" ")
      .map((word) => transformWordToTetrisBlock(word.toLowerCase())),
  ];

  const tetrisBoard = getTetrisBoard(streamOfBlocks);

  // The rendered tetris board is smaller than the actual tetris board
  // because we got $LINE_HEIGHT extra rows on the top to drop in the blocks
  // which are not rendered.
  const renderedTetrisBoardWidth = tetrisBoard[0].length;
  const renderedTetrisBoardHeight = tetrisBoard.length - BLOCK_HEIGHT;
  // I have to limit the tetris board width and height
  // because of limited grid-rows and grid-cols className definitions
  // inside shared/dynamic-grid-map.ts
  // and the limited gridTemplateRows and gridTemplateColumns definitions
  // inside the tailwind.config.ts
  const tooWide = renderedTetrisBoardWidth > Object.keys(gridCols).length;
  const tooHigh = renderedTetrisBoardHeight > Object.keys(gridRows).length;
  if (tooWide) {
    console.error(
      "Tetris board is too wide. Either use shorter headline, regards or words in your story or define more grid-cols in shared/dynamic-grid-map.ts and more gridTemplateColumns in tailwind.config.ts"
    );
    invariantResponse(
      renderedTetrisBoardWidth <= Object.keys(gridCols).length,
      "Bad request",
      { status: 400 }
    );
  }
  if (tooHigh) {
    console.error(
      "Tetris board is too high. Either use shorter block height inside alphabet.ts or shorter board height in tetris-load.ts or define more grid-rows in shared/dynamic-grid-map.ts and more gridTemplateRows in tailwind.config.ts"
    );
    invariantResponse(
      renderedTetrisBoardHeight - BLOCK_HEIGHT <= Object.keys(gridRows).length,
      "Bad request",
      { status: 400 }
    );
  }

  return {
    author,
    story,
    streamOfBlocks,
    tetrisBoard,
  } as const;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { author, story, streamOfBlocks, tetrisBoard } = loaderData;

  // States to manage board, current block and automatic down movement
  const initialBoard = tetrisBoard;
  const [board, _setBoard] = React.useState(initialBoard);
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
  const initialPosition = { x: 1, y: 0 };
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

  // Game state
  const [gameState, _setGameState] = React.useState<GameState>("idle");
  const gameStateRef = React.useRef(gameState);
  const setGameState = (state: GameState) => {
    gameStateRef.current = state;
    _setGameState(state);
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
  const [acceleration, _setAcceleration] = React.useState(false);
  const accelerationRef = React.useRef(acceleration);
  const setAcceleration = (acceleration: boolean) => {
    accelerationRef.current = acceleration;
    _setAcceleration(acceleration);
  };

  // State to hide the how-to-play instructions
  const [showHowToPlay, setShowHowToPlay] = React.useState(true);

  // Handler for user input
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (gameStateRef.current !== "running") {
          setShowHowToPlay(false);
          setGameState("running");
          setBoard(initialBoard);
          setBlock(initialBlock);
          setBlockIndex(0);
          setPosition(initialPosition);
          startGame();
        }
      }
      if (event.key === "Escape") {
        if (gameStateRef.current !== "idle") {
          setGameState("idle");
        }
      }
      if (event.key === "ArrowLeft") {
        if (leftRef.current === false) {
          setLeft(true);
        }
      }
      if (event.key === "ArrowRight") {
        if (rightRef.current === false) {
          setRight(true);
        }
      }
      if (event.key === "ArrowDown") {
        if (accelerationRef.current === false) {
          setAcceleration(true);
        }
      }
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (leftRef.current === true) {
          setLeft(false);
        }
      }
      if (event.key === "ArrowRight") {
        if (rightRef.current === true) {
          setRight(false);
        }
      }
      if (event.key === "ArrowDown") {
        if (accelerationRef.current === true) {
          setAcceleration(false);
        }
      }
    };
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    };
  }, []);

  // Game Loop via window.requestAnimationFrame API
  // -> see https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
  const startGame = () => {
    // Render cycle
    // -> Cycle frequency is Matching the screen refresh rate
    const step: FrameRequestCallback = (timestamp) => {
      const speed = accelerationRef.current === true ? 50 : 200;
      const isTimeToMoveDown = timestamp - lastDownMoveRef.current >= speed;
      // Early return to save resources if no movement is happening
      if (
        isTimeToMoveDown === false &&
        leftRef.current === false &&
        rightRef.current === false
      ) {
        window.requestAnimationFrame(step);
        return;
      }
      const currentBoardState = {
        board: boardRef.current,
        block: blockRef.current,
        position: positionRef.current,
        gameState: gameStateRef.current,
      } as const;
      let newBoardState;

      // Moving current block down with the frequency defined in isTimeToMoveDown variable
      if (isTimeToMoveDown) {
        setLastDownMove(timestamp);
        newBoardState = moveBlock("down", currentBoardState);
      }
      // Not moving when both left and right are pressed
      if ((leftRef.current && rightRef.current) === false) {
        // Moving current block to the left at any frame in the render cycle
        if (leftRef.current) {
          newBoardState = moveBlock("left", newBoardState || currentBoardState);
        }
        // Moving current block to the right at any frame in the render cycle
        if (rightRef.current) {
          newBoardState = moveBlock(
            "right",
            newBoardState || currentBoardState
          );
        }
      }
      // Checking if any movement did happen in this frame of the render cycle
      if (newBoardState !== undefined) {
        // Update the tetris board state to trigger a rerender
        setBoard(newBoardState.board);
        /** Now check how game state has changed and accordingly update following states if needed:
         * - block
         * - blockIndex
         * - position
         * - gameState
         * And request the next frame if needed
         */
        if (newBoardState.gameState === "running") {
          setGameState("running");
          setBlock(newBoardState.block);
          setPosition(newBoardState.position);
          window.requestAnimationFrame(step);
        } else if (newBoardState.gameState === "nextBlockPlease") {
          // TODO: Check if there are fully active rows except the last row
          // Do that check after the block has fully been moved down
          // Which means when the gameState is "nextBlockPlease"
          // -> If so, remove them and move all rows above down
          const currentBlockIndex = blockIndexRef.current;
          const nextBlock = streamOfBlocks[currentBlockIndex + 1];
          if (nextBlock === undefined) {
            setGameState("youWon");
          } else {
            setGameState("running");
            setBlock(nextBlock);
            setBlockIndex(currentBlockIndex + 1);
            setPosition(initialPosition);
            window.requestAnimationFrame(step);
          }
        } else if (newBoardState.gameState === "gameOver") {
          setGameState("gameOver");
        } else if (newBoardState.gameState === "idle") {
          setGameState("idle");
        } else {
          console.error("Unknown game state", newBoardState.gameState);
        }
      } else {
        // No movement in this frame of the render cycle so no need to update states
        // Just request the next frame
        window.requestAnimationFrame(step);
      }
    };
    const currentGameState = gameStateRef.current;
    if (currentGameState === "running") {
      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="w-full grid justify-center text-center gap-4 p-4">
      {/* TODO: Styling */}
      <h1>Story Tetris</h1>
      <div>
        {gameStateRef.current === "idle" ? (
          <>
            <p>
              {author} wants to tell you a story named "{story.headline}"
            </p>
            <p>But the story is scrambled into tetris blocks...</p>
            <p>Press Enter to take a look at it.</p>
          </>
        ) : gameStateRef.current === "youWon" ? (
          <>
            <h1>You got it!</h1>
            <p>Here is the full story from {author}</p>
            <h2>{story.headline}</h2>
            <p>{story.message}</p>
            <p>{story.regards}</p>
            <p>Press Enter to try again.</p>
          </>
        ) : gameStateRef.current === "gameOver" ? (
          <>
            <h1>Cliff hanger</h1>
            <p>Your blocks are stacked to the top.</p>
            <p>But your story wasn't finished yet.</p>
            <p>Press Enter to try again.</p>
          </>
        ) : (
          <div
            // The top $BLOCK_HEIGHT cells are not rendered
            // and used to drop in the block from above.
            className={`grid ${
              gridRows[initialBoard.length - initialBlock.length - 1]
            } ${
              gridCols[initialBoard[0].length - 1]
            } grid-cols-180 place-items-center gap-[2px] border border-gray-600`}
          >
            {boardRef.current.map((row, rowIndex) =>
              row.map((cell, columnIndex) =>
                // The top $BLOCK_HEIGHT cells are not rendered
                // and used to drop in the block from above.
                rowIndex >= initialBlock.length ? (
                  <div
                    key={`${rowIndex}-${columnIndex}-${cell}`}
                    className={`${
                      cellColors[cell] || FALLBACK_CELL_COLOR
                    } w-1 h-1 rounded-sm`}
                  />
                ) : null
              )
            )}
          </div>
        )}
      </div>
      <div className="group">
        <label
          htmlFor="how-to-play"
          className="flex justify-center items-center gap-2 cursor-pointer"
        >
          <div className="group-has-[:checked]:-rotate-90 rotate-90">
            &#x27BA;
          </div>
          <div>How to play?</div>
          <div className="group-has-[:checked]:-rotate-90 rotate-90">
            &#x27BA;
          </div>
        </label>
        <ul className="group-has-[:checked]:block hidden">
          <li>Press Enter to start the game.</li>
          <li>Press Escape to stop the game.</li>
          <li>Use arrow keys to move the tetris blocks.</li>
          <li>Try to find out what {author} wants to tell you.</li>
        </ul>
        <input
          type="checkbox"
          id="how-to-play"
          className="absolute w-0 h-0 opacity-0"
          checked={showHowToPlay}
          onChange={(event) => setShowHowToPlay(event.target.checked)}
        />
      </div>
    </div>
  );
}
