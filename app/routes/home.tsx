import type { Route } from "./+types/home";
import {
  getTetrisBoard,
  transformTextToTetrisBlock,
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
import {
  CELL_GAP,
  CELL_HEIGHT,
  CELL_WIDTH,
  TetrisBoard as TetrisBoardComponent,
} from "~/components/TetrisBoard";
import { useFetcher } from "react-router";
import type { TetrisBlock } from "~/.server/alphabet";
import { invariantResponse } from "~/.server/error-helper";

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

export async function loader({ request }: Route.LoaderArgs) {
  // FEATURE: Let users produce their own story
  const author = "Colin";
  const customHeading = "🥰 Love you very very very very much 🥰";
  const story = {
    headline: "ABCDEF GHIJKL MNO PQR STU VWX YZ",
    message: "Ä Ö Ü ß ? ! , . - ; :",
    regards: "012 345 6789",
  } as const;
  // FEATURE: New setting: Split headline and regards into separate blocks to support more devices
  // Hint user, that this setting leads to more supported smaller devices for the story
  const splitHeadlineAndRegards = true; // Default: false
  // FEATURE: New setting: Show supported device width dynamically on creation (async validation onChange)
  // FEATURE: New setting: Let user choose their own color palette

  const streamOfBlocks = [
    ...(splitHeadlineAndRegards
      ? story.headline
          .split(" ")
          .map((word) => transformTextToTetrisBlock(word.toLowerCase()))
      : [transformTextToTetrisBlock(story.headline.toLowerCase())]),
    ...story.message
      .split(" ")
      .map((word) => transformTextToTetrisBlock(word.toLowerCase())),
    ...(splitHeadlineAndRegards
      ? story.regards
          .split(" ")
          .map((word) => transformTextToTetrisBlock(word.toLowerCase()))
      : [transformTextToTetrisBlock(story.regards.toLowerCase())]),
  ];

  const url = new URL(request.url);
  const columns = url.searchParams.get("columns");
  const rows = url.searchParams.get("rows");
  let tetrisBoard;
  if (
    columns !== null &&
    rows !== null &&
    isFinite(Number(columns)) &&
    isFinite(Number(rows))
  ) {
    let widestBlock: TetrisBlock = streamOfBlocks[0];
    let widestBlockIndex = 0;
    let index = 0;
    for (const block of streamOfBlocks) {
      if (block[0].length > widestBlock[0].length) {
        widestBlock = block;
        widestBlockIndex = index;
      }
      index++;
    }
    invariantResponse(
      widestBlock[0].length <= Number(columns),
      `${
        widestBlockIndex === 0
          ? "Story headline is too long to fit on the board"
          : widestBlockIndex === streamOfBlocks.length - 1
          ? "Story regards are too long to fit on the board"
          : `Word ${story.message
              .split(" ")
              .at(
                widestBlockIndex + 1
              )} in story is too long to fit on the board`
      }`,
      { status: 400 }
    );
    tetrisBoard = getTetrisBoard(Number(columns), Number(rows));
  }

  return {
    author,
    customHeading,
    story,
    tetrisBoard,
    streamOfBlocks,
  } as const;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { author, customHeading, story, tetrisBoard, streamOfBlocks } =
    loaderData;

  // If tetrisBoard is undefined submit a new request with the screen width and height
  const fetcher = useFetcher<typeof loader>();
  React.useEffect(() => {
    if (tetrisBoard === undefined) {
      // + 2 because a gap is between the cells, so every cell is 6px wide except one thats 4px
      const columns = Math.floor(
        (window.innerWidth + CELL_GAP) / (CELL_WIDTH + CELL_GAP)
      );
      const rows = Math.floor(
        (window.innerHeight + CELL_GAP) / (CELL_HEIGHT + CELL_GAP)
      );
      fetcher.submit(
        {
          columns,
          // Adding Rows for dropping in the blocks from above (They are not rendered)
          rows: rows + streamOfBlocks[0].length,
        },
        { method: "GET" }
      );
    }
  }, []);

  const initialSetup: {
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
  } = {
    gameStatus: "idle",
    board: tetrisBoard,
    block: streamOfBlocks[0],
    blockIndex: 0,
    position: { x: 0, y: 0 },
    lastDownMove: 0,
    lastSideMove: 0,
    left: false,
    right: false,
    accelerate: false,
  };
  const setup = React.useRef(initialSetup);
  const setSetup = (newSetup: typeof initialSetup) => {
    setup.current = newSetup;
  };

  // References to the game for usage in key handlers and game loop
  // Game state refs
  const [gameStatus, _setGameStatus] = React.useState(initialSetup.gameStatus);
  const gameStatusRef = React.useRef(initialSetup.gameStatus);
  const setGameStatus = (newGameStatus: typeof initialSetup.gameStatus) => {
    gameStatusRef.current = newGameStatus;
    _setGameStatus(newGameStatus);
  };
  const board = React.useRef(initialSetup.board);
  const setBoard = (newBoard: typeof initialSetup.board) => {
    board.current = newBoard;
  };
  if (fetcher.data !== undefined && fetcher.data.tetrisBoard !== undefined) {
    const tetrisBoard = fetcher.data.tetrisBoard;
    setSetup({
      ...setup.current,
      board: tetrisBoard,
    });
    setBoard(tetrisBoard);
  }
  const block = React.useRef(initialSetup.block);
  const setBlock = (newBlock: typeof initialSetup.block) => {
    block.current = newBlock;
  };
  const blockIndex = React.useRef(initialSetup.blockIndex);
  const setBlockIndex = (newBlockIndex: typeof initialSetup.blockIndex) => {
    blockIndex.current = newBlockIndex;
  };
  const position = React.useRef(initialSetup.position);
  const setPosition = (newPosition: typeof initialSetup.position) => {
    position.current = newPosition;
  };
  if (fetcher.data !== undefined && fetcher.data.tetrisBoard !== undefined) {
    const position = {
      x:
        Math.floor(fetcher.data.tetrisBoard[0].length / 2) -
        Math.floor(streamOfBlocks[0][0].length / 2),
      y: 0,
    };
    setSetup({
      ...setup.current,
      position,
    });
    setPosition(position);
  }
  // Timing refs
  const lastDownMove = React.useRef(initialSetup.lastDownMove);
  const setLastDownMove = (
    newLastDownMove: typeof initialSetup.lastDownMove
  ) => {
    lastDownMove.current = newLastDownMove;
  };
  const lastSideMove = React.useRef(initialSetup.lastSideMove);
  const setLastSideMove = (
    newLastSideMove: typeof initialSetup.lastSideMove
  ) => {
    lastSideMove.current = newLastSideMove;
  };
  // User movement refs
  const left = React.useRef(initialSetup.left);
  const setLeft = (newLeft: typeof initialSetup.left) => {
    left.current = newLeft;
  };
  const right = React.useRef(initialSetup.right);
  const setRight = (newRight: typeof initialSetup.right) => {
    right.current = newRight;
  };
  const accelerate = React.useRef(initialSetup.accelerate);
  const setAccelerate = (newAcceleration: typeof initialSetup.accelerate) => {
    accelerate.current = newAcceleration;
  };

  // Handler for user input
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (gameStatusRef.current !== "running") {
          setGameStatus("running");
          setBoard(setup.current.board);
          setBlock(setup.current.block);
          setBlockIndex(setup.current.blockIndex);
          setPosition(setup.current.position);
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
      // Early return if game status is not running
      if (gameStatusRef.current !== "running") {
        return;
      }
      // Early return if tetris board is not yet defined
      if (board.current === undefined) {
        return;
      }
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
          // TODO: Clearing the board
          // Check if there are at least $X (f.e 10) cells with the same color in one place
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
            setPosition({
              x:
                Math.floor(newState.board[0].length / 2) -
                Math.floor(nextBlock[0].length / 2),
              y: 0,
            });
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
    <div className="relative w-full grid grid-cols-1 justify-center text-center gap-4 select-none">
      {/* TODO: Styling */}
      <div id="header-placeholder" className="w-full h-8" />
      <div className="grid grid-cols-1 justify-center text-center gap-4">
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
        ) : fetcher.data !== undefined &&
          fetcher.data.tetrisBoard !== undefined ? (
          <TetrisBoardComponent.Board id="tetris-board">
            {fetcher.data.tetrisBoard.map((row, rowIndex) =>
              row.map((cellValue, columnIndex) =>
                // The top $BLOCK_HEIGHT cells are not rendered
                // and used to drop in the block from above.
                rowIndex >= setup.current.block.length ? (
                  <TetrisBoardComponent.Cell
                    id={`row${rowIndex}column${columnIndex}`}
                    key={`row${rowIndex}column${columnIndex}`}
                    cellValue={cellValue}
                  />
                ) : null
              )
            )}
          </TetrisBoardComponent.Board>
        ) : null}
      </div>
      <header className="absolute top-0 w-full h-8 pb-1 grid grid-cols-3 justify-center items-center gap-4 px-4 bg-gradient-to-r from-emerald-950 from-1% via-transparent via-50% to-emerald-950 to-99%">
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
                defaultChecked={false}
              />
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
