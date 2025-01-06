import type { Route } from "./+types/home";
import {
  getTetrisBoard,
  transformWordToTetrisBlock,
} from "~/.server/tetris-load";
import React from "react";
import type { ArrayElement } from "~/shared/type-helper";
import {
  ACCELERATED_DOWN_MOVEMENT_SPEED,
  DOWN_MOVEMENT_SPEED,
  type GameStatus,
  moveBlock,
  type Position,
  SIDE_MOVEMENT_SPEED,
} from "~/.client/tetris-runtime";
import { invariantResponse } from "~/.server/error-helper";
import { gridCols, gridRows } from "~/shared/dynamic-grid-map";
import { BLOCK_HEIGHT } from "~/.server/alphabet";
import { TetrisBoard } from "~/components/TetrisBoard";

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
  const customHeading = "Love you 🥰";
  const story = {
    // TODO: Scale the max word size and the board height
    // to produce a grid that fits perfectly on a 1920x1080 screen
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
    customHeading,
    story,
    streamOfBlocks,
    tetrisBoard,
  } as const;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { author, customHeading, story, streamOfBlocks, tetrisBoard } =
    loaderData;

  const initialState: {
    gameStatus: GameStatus;
    board: typeof tetrisBoard;
    block: ArrayElement<typeof streamOfBlocks>;
    blockIndex: number;
    position: Position;
    lastDownMove: number;
    lastSideMove: number;
    left: boolean;
    right: boolean;
    accelerate: boolean;
    showHowToPlay: boolean;
  } = {
    gameStatus: "idle",
    board: tetrisBoard,
    block: streamOfBlocks[0],
    blockIndex: 0,
    position: { x: 1, y: 0 },
    lastDownMove: 0,
    lastSideMove: 0,
    left: false,
    right: false,
    accelerate: false,
    showHowToPlay: true,
  };

  // References to the game for usage in key handlers and game loop

  // Game state refs
  const [gameStatus, _setGameStatus] = React.useState(initialState.gameStatus);
  const gameStatusRef = React.useRef(initialState.gameStatus);
  const setGameStatus = (newGameStatus: typeof initialState.gameStatus) => {
    gameStatusRef.current = newGameStatus;
    _setGameStatus(newGameStatus);
  };
  const board = React.useRef(initialState.board);
  const setBoard = (newBoard: typeof initialState.board) => {
    board.current = newBoard;
  };
  const block = React.useRef(initialState.block);
  const setBlock = (newBlock: typeof initialState.block) => {
    block.current = newBlock;
  };
  const blockIndex = React.useRef(initialState.blockIndex);
  const setBlockIndex = (newBlockIndex: typeof initialState.blockIndex) => {
    blockIndex.current = newBlockIndex;
  };
  const position = React.useRef(initialState.position);
  const setPosition = (newPosition: typeof initialState.position) => {
    position.current = newPosition;
  };
  // Timing refs
  const lastDownMove = React.useRef(initialState.lastDownMove);
  const setLastDownMove = (
    newLastDownMove: typeof initialState.lastDownMove
  ) => {
    lastDownMove.current = newLastDownMove;
  };
  const lastSideMove = React.useRef(initialState.lastSideMove);
  const setLastSideMove = (
    newLastSideMove: typeof initialState.lastSideMove
  ) => {
    lastSideMove.current = newLastSideMove;
  };
  // User movement refs
  const left = React.useRef(initialState.left);
  const setLeft = (newLeft: typeof initialState.left) => {
    left.current = newLeft;
  };
  const right = React.useRef(initialState.right);
  const setRight = (newRight: typeof initialState.right) => {
    right.current = newRight;
  };
  const accelerate = React.useRef(initialState.accelerate);
  const setAccelerate = (newAcceleration: typeof initialState.accelerate) => {
    accelerate.current = newAcceleration;
  };
  // General UI refs
  const [showHowToPlay, setShowHowToPlay] = React.useState(
    initialState.showHowToPlay
  );

  // Handler for user input
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (gameStatusRef.current !== "running") {
          setGameStatus("running");
          if (showHowToPlay === true) {
            setShowHowToPlay(false);
          }
          setBoard(initialState.board);
          setBlock(initialState.block);
          setBlockIndex(initialState.blockIndex);
          setPosition(initialState.position);
          startGame();
        }
      }
      if (event.key === "Escape") {
        if (gameStatusRef.current !== "idle") {
          setGameStatus("idle");
        }
      }
      if (event.key === "ArrowLeft") {
        if (left.current === false) {
          setLeft(true);
        }
      }
      if (event.key === "ArrowRight") {
        if (right.current === false) {
          setRight(true);
        }
      }
      if (event.key === "ArrowDown") {
        if (accelerate.current === false) {
          setAccelerate(true);
        }
      }
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (left.current === true) {
          setLeft(false);
        }
      }
      if (event.key === "ArrowRight") {
        if (right.current === true) {
          setRight(false);
        }
      }
      if (event.key === "ArrowDown") {
        if (accelerate.current === true) {
          setAccelerate(false);
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
      const speed =
        accelerate.current === true
          ? ACCELERATED_DOWN_MOVEMENT_SPEED
          : DOWN_MOVEMENT_SPEED;
      const isTimeToMoveDown = timestamp - lastDownMove.current >= speed;
      const isTimeToMoveSidewards =
        timestamp - lastSideMove.current >= SIDE_MOVEMENT_SPEED;
      // Early return to save resources if no movement is happening
      if (
        isTimeToMoveDown === false &&
        left.current === false &&
        right.current === false
      ) {
        window.requestAnimationFrame(step);
        return;
      }
      let newState;
      const currentState = {
        board: board.current,
        block: block.current,
        position: position.current,
        gameStatus: gameStatusRef.current,
      } as const;

      // Moving current block down with the frequency defined in isTimeToMoveDown variable
      if (isTimeToMoveDown) {
        setLastDownMove(timestamp);
        newState = moveBlock("down", currentState);
      }
      // Not moving when both left and right are pressed
      if (
        isTimeToMoveSidewards &&
        (left.current === true && right.current === true) === false
      ) {
        // Moving current block to the left at any frame in the render cycle
        if (left.current === true) {
          setLastSideMove(timestamp);
          newState = moveBlock("left", newState || currentState);
        }
        // Moving current block to the right at any frame in the render cycle
        if (right.current === true) {
          setLastSideMove(timestamp);
          newState = moveBlock("right", newState || currentState);
        }
      }
      // Checking if any movement did happen in this frame of the render cycle
      if (newState !== undefined) {
        // Update the tetris board state to trigger a rerender
        setBoard(newState.board);
        /** Now check how game state has changed and accordingly update following states if needed:
         * - block
         * - blockIndex
         * - position
         * - gameState
         * And request the next frame if needed
         */
        if (newState.gameStatus === "running") {
          setGameStatus("running");
          setBlock(newState.block);
          setPosition(newState.position);
          window.requestAnimationFrame(step);
        } else if (newState.gameStatus === "nextBlockPlease") {
          // TODO: Multiple ideas for clearing the board
          // 1. Check if there are fully active rows except the last row
          // -> If so, remove them and move all rows above down
          // 2. Check if there are at least $X (f.e 10) cells with the same color in one place
          // Meaning all are neighbors of each other and share the same color
          // -> If so, remove them and move all rows above down
          const currentBlockIndex = blockIndex.current;
          const nextBlock = streamOfBlocks[currentBlockIndex + 1];
          if (nextBlock === undefined) {
            setGameStatus("youWon");
          } else {
            setGameStatus("running");
            setBlock(nextBlock);
            setBlockIndex(currentBlockIndex + 1);
            setPosition(initialState.position);
            window.requestAnimationFrame(step);
          }
        } else if (newState.gameStatus === "gameOver") {
          setGameStatus("gameOver");
        } else if (newState.gameStatus === "idle") {
          setGameStatus("idle");
        } else {
          console.error("Unknown game state", newState.gameStatus);
        }
      } else {
        // No movement in this frame of the render cycle so no need to update states
        // Just request the next frame
        window.requestAnimationFrame(step);
      }
    };
    if (gameStatusRef.current === "running") {
      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 justify-center text-center gap-4">
      {/* TODO: Styling */}
      <header className="w-full h-8 pb-1 grid grid-cols-3 justify-center items-center gap-4 px-4 bg-gradient-to-r from-emerald-950 from-1% via-gray-950 via-50% to-emerald-950 to-99%">
        <h1 className="justify-self-start">Story Tetris</h1>
        <p>{customHeading}</p>
        <nav className="w-full flex justify-end">
          <div className="relative flex items-center transition-all group">
            <label
              htmlFor="how-to-play"
              className="group-has-[:checked]:w-72 w-fit flex gap-1 justify-between items-center cursor-pointer"
            >
              <div className="">How to play?</div>
              <div className="group-has-[:checked]:-rotate-90 rotate-90">
                &#x27BA;
              </div>
            </label>
            <div className="absolute top-8 left-0 group-has-[:checked]:block hidden group-has-[:checked]:W-72">
              <ul className="text-left">
                <li>Press Enter to start the game.</li>
                <li>Press Escape to stop the game.</li>
                <li>Arrow keys to move the tetris blocks.</li>
                <li>📜 Find out {author}s' story.</li>
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
        </nav>
      </header>
      <div className="w-full grid grid-cols-1 justify-center text-center gap-4">
        {gameStatus === "idle" ? (
          <>
            <p>
              {author} wants to tell you a story named "{story.headline}"
            </p>
            <p>But the story is scrambled into tetris blocks...</p>
            <p>Press Enter to take a look at it.</p>
          </>
        ) : gameStatus === "youWon" ? (
          <>
            <h1>You got it!</h1>
            <p>Here is the full story from {author}</p>
            <h2>{story.headline}</h2>
            <p>{story.message}</p>
            <p>{story.regards}</p>
            <p>Press Enter to try again.</p>
          </>
        ) : gameStatus === "gameOver" ? (
          <>
            <h1>Cliff hanger</h1>
            <p>Your blocks are stacked to the top.</p>
            <p>But your story wasn't finished yet.</p>
            <p>Press Enter to try again.</p>
          </>
        ) : (
          <TetrisBoard.Board
            id="tetris-board"
            boardHeight={initialState.board.length}
            boardWidth={initialState.board[0].length}
            blockHeight={initialState.block.length}
          >
            {tetrisBoard.map((row, rowIndex) =>
              row.map((cellValue, columnIndex) =>
                // The top $BLOCK_HEIGHT cells are not rendered
                // and used to drop in the block from above.
                rowIndex >= initialState.block.length ? (
                  <TetrisBoard.Cell
                    id={`row${rowIndex}column${columnIndex}`}
                    key={`row${rowIndex}column${columnIndex}`}
                    cellValue={cellValue}
                  />
                ) : null
              )
            )}
          </TetrisBoard.Board>
        )}
      </div>
    </div>
  );
}
