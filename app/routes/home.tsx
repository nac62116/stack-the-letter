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
import { LINE_HEIGHT, type TetrisBlock } from "~/.server/alphabet";
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

  // The rendered tetris board is smaller than the actual tetris board
  // because the actual tetris board has active cells at the left, right and bottom boundaries
  // and $LINE_HEIGHT non-acitve rows on the top to drop in the blocks
  const renderedTetrisBoardWidth = tetrisBoard[0].length - 2;
  const renderedTetrisBoardHeight = tetrisBoard.length - LINE_HEIGHT - 1;
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
      "Tetris board is too high. Either use shorter line and block height inside tetris or define more grid-rows in shared/dynamic-grid-map.ts and more gridTemplateRows in tailwind.config.ts"
    );
    invariantResponse(
      renderedTetrisBoardHeight - LINE_HEIGHT <= Object.keys(gridRows).length,
      "Bad request",
      { status: 400 }
    );
  }

  return {
    author,
    story,
    streamOfBlocks,
    tetrisBoard,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { author, story, streamOfBlocks, tetrisBoard } = loaderData;

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
  // The top, left and bottom boundary of the board is filled with active cells
  // and the top boundary is filled with $BLOCK_HEIGHT non-active cells
  // to simplify the game logic.
  // These boundaries are not rendered. Thats why we use x: 1 here.
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
  type GameState = "idle" | "running" | "won" | "lost";
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
        setGameState("idle");
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
        // Or on runtime if it should be changable during render cycle (f.e. by the down arrow key)
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
        const {
          board: newBoard,
          // This is the consumed block
          // -> every cell that has arrived at another exisiting cell was cut off
          block: newBlock,
          state,
        } = moveBlock("down", currentBoardState);
        // TODO: Check if there are fully active rows except the last row
        // -> If so, remove them and move all rows above down
        // -> Add follwoing comment to this function the get the functionality of the last active row
        /**
         * The last row is filled with active cells to simplify the game logic.
         * This row is not rendered. Thats why we dont remove it here.
         */
        setBoard(newBoard);
        setPosition({
          x: currentBoardState.position.x,
          y: currentBoardState.position.y + 1,
        });
        // This state is returned when the block was fully consumed (aka cannot move anymore)
        if (state === "nextBlockPlease") {
          const nextBlock = streamOfBlocks[currentBlockIndex + 1];
          if (nextBlock === undefined) {
            setGameState("won");
          }
          setBlock(nextBlock);
          setBlockIndex(currentBlockIndex + 1);
          setPosition(initialPosition);
        }
        if (state === "gameOver") {
          setGameState("lost");
        }
        // The second check in this condition prooves the type assertion on runtime
        if (
          state === "running" &&
          newBlock.length === currentBoardState.block.length
        ) {
          setBlock(newBlock as TetrisBlock);
        }
      }
      if (gameStateRef.current === "running") {
        window.requestAnimationFrame(step);
      }
    };
    if (gameStateRef.current === "running") {
      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="w-full grid justify-center text-center gap-4 p-4">
      {/* TODO: Styling */}
      <h1>Story Tetris</h1>
      <div>
        {gameState === "idle" ? (
          <>
            <p>
              {author} wants to tell you a story named "{story.headline}"
            </p>
            <p>But the story is scrambled into tetris blocks...</p>
            <p>Press Enter to take a look at it.</p>
          </>
        ) : gameState === "won" ? (
          <>
            <h1>You got it!</h1>
            <p>Here is the full story from {author}</p>
            <h2>{story.headline}</h2>
            <p>{story.message}</p>
            <p>{story.regards}</p>
            <p>Press Enter to try again.</p>
          </>
        ) : gameState === "lost" ? (
          <>
            <h1>Cliff hanger</h1>
            <p>Your blocks are stacked to the top.</p>
            <p>But your story wasn't finished yed.</p>
            <p>Press Enter to try again.</p>
          </>
        ) : (
          <div
            // The top, left and bottom boundary of the board is filled with active cells
            // and the top boundary is filled with $BLOCK_HEIGHT non-active cells
            // to simplify the game logic.
            // These boundaries are not rendered.
            // Thats why we use gridRows[boardRef.current.length - 2 - initialBlock.length]
            // and gridCols[boardRef.current[0].length - 3] here.
            className={`grid ${
              gridRows[boardRef.current.length - 2 - initialBlock.length]
            } ${
              gridCols[boardRef.current[0].length - 3]
            } place-items-center gap-1`}
          >
            {boardRef.current.map((row, rowIndex) =>
              row.map((cell, columnIndex) =>
                // The top, left and bottom boundary of the board is filled with active cells
                // and the top boundary is filled with $BLOCK_HEIGHT non-active cells
                // to simplify the game logic.
                // These boundaries are not rendered. Thats why we return null here.
                rowIndex >= initialBlock.length &&
                rowIndex !== boardRef.current.length - 1 &&
                columnIndex !== 0 &&
                columnIndex !== boardRef.current[0].length - 1 ? (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={`${
                      cellColors[cell] || FALLBACK_CELL_COLOR
                    } w-4 h-4 border border-gray-600 rounded-sm`}
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
