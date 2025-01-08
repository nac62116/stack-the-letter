import type { Route } from "./+types/home";
import { getTetrisBoard } from "~/.server/tetris-load";
import React from "react";
import type { ArrayElement } from "~/shared/type-helper";
import {
  ACCELERATED_DOWN_MOVEMENT_SPEED,
  castToGameStatus,
  type CellsToUpdate,
  DOWN_MOVEMENT_SPEED,
  type GameStatus,
  moveBlock,
  type Position,
  SIDE_MOVEMENT_SPEED,
} from "~/.client/tetris-runtime";
import {
  CELL_BASE_CLASS_NAME,
  CELL_GAP,
  CELL_HEIGHT,
  CELL_HEIGHT_CLASS_NAME,
  CELL_WIDTH,
  CELL_WIDTH_CLASS_NAME,
  TetrisBoard as TetrisBoardComponent,
} from "~/components/TetrisBoard";
import { useFetcher } from "react-router";
import {
  BLOCK_HEIGHT,
  getDefaultBlock,
  type TetrisBlock,
} from "~/shared/alphabet";
import {
  MAX_BOARD_HEIGHT,
  MAX_BOARD_WIDTH,
  MIN_BOARD_WIDTH,
} from "~/shared/dynamic-size-map";
import { cellColors } from "~/shared/dynamic-cell-color-map";

export function meta({
  data: {
    author,
    story: { headline },
  },
}: Route.MetaArgs) {
  return [
    { title: `Story Tetris - ${author}s' Story` },
    { name: "description", content: headline },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const columnsString = url.searchParams.get("columns");
  const rowsString = url.searchParams.get("rows");
  let rows;
  let columns;
  if (rowsString !== null && isFinite(Number(rowsString))) {
    rows = Number(rowsString);
    const maxRows =
      (MAX_BOARD_HEIGHT + BLOCK_HEIGHT + CELL_GAP) / (CELL_HEIGHT + CELL_GAP);
    const minRows = 3 * BLOCK_HEIGHT;
    if (rows > maxRows) {
      rows = maxRows;
    }
    if (rows < minRows) {
      rows = minRows;
    }
  }
  if (columnsString !== null && isFinite(Number(columnsString))) {
    columns = Number(columnsString);
    const maxColumns = (MAX_BOARD_WIDTH + CELL_GAP) / (CELL_WIDTH + CELL_GAP);
    const minColumns = (MIN_BOARD_WIDTH + CELL_GAP) / (CELL_WIDTH + CELL_GAP);
    if (columns > maxColumns) {
      columns = maxColumns;
    }
    if (columns < minColumns) {
      columns = minColumns;
    }
  }

  // FEATURE: Let users produce their own story
  // FEATURE: New setting: Let user choose their own color palette
  const author = "Colin";
  const story = {
    headline: "ABCDEF GHIJKL MNO PQR STU VWX YZ",
    message: "Ä Ö Ü ß ? ! , . - ; :",
    regards: "012 345 6789",
  } as const;

  // TODO: Cut story into nice readable pieces (aka TetrisBlocks)
  // f.e.
  // headline check if its too long instead break into two lines
  // or into single words if still too long
  // sentence until next punctuation mark if too long consume next words to produce a block thats half a board wide by appending word after word and checking if it still fits.
  let streamOfBlocks;
  let tetrisBoard;
  if (columns !== undefined && rows !== undefined) {
    tetrisBoard = getTetrisBoard(columns, rows);
    streamOfBlocks = [getDefaultBlock()];
  }

  return {
    author,
    story,
    tetrisBoard,
    streamOfBlocks,
  } as const;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { author, story, tetrisBoard, streamOfBlocks } = loaderData;

  const initialSetup: {
    gameStatus: GameStatus;
    board: typeof tetrisBoard;
    boardElement: (Element | null)[][] | undefined;
    streamOfBlocks: typeof streamOfBlocks;
    blockIndex: number;
    position: Position | undefined;
    lastDownMove: number;
    lastSideMove: number;
    left: boolean;
    right: boolean;
    accelerate: boolean;
    boardLoaded: boolean;
  } = {
    gameStatus: "idle",
    // Will be set after fetching the tetris board
    board: undefined,
    // Will be set after fetching the tetris board
    boardElement: undefined,
    // Will be set after fetching the tetris board
    streamOfBlocks: undefined,
    blockIndex: 0,
    // Will be set after fetching the tetris board
    position: undefined,
    lastDownMove: 0,
    lastSideMove: 0,
    left: false,
    right: false,
    accelerate: false,
    boardLoaded: false,
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
  const boardElement = React.useRef<(Element | null)[][]>(
    initialSetup.boardElement
  );
  const setBoardElement = (newBoardElement: typeof boardElement.current) => {
    boardElement.current = newBoardElement;
  };
  const block = React.useRef<TetrisBlock | undefined>(undefined);
  const setBlock = (newBlock: TetrisBlock | undefined) => {
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
  // UI states
  const [boardLoaded, _setBoardLoaded] = React.useState(
    initialSetup.boardLoaded
  );
  const boardLoadedRef = React.useRef(boardLoaded);
  const setBoardLoaded = (newBoardLoaded: typeof boardLoaded) => {
    boardLoadedRef.current = newBoardLoaded;
    _setBoardLoaded(newBoardLoaded);
  };

  // If tetrisBoard is undefined submit a new request with the screen width and height
  const fetcher = useFetcher<typeof loader>();
  // If fetcher data received but document is not yet rendered
  // set all states that depend on the tetris board
  if (
    fetcher.data !== undefined &&
    fetcher.data.tetrisBoard !== undefined &&
    fetcher.data.streamOfBlocks !== undefined
  ) {
    const statesToUpdate: (() => void)[] = [];
    const position = {
      x:
        Math.floor(fetcher.data.tetrisBoard[0].length / 2) -
        Math.floor(fetcher.data.streamOfBlocks[0][0].length / 2),
      y: 0,
    };
    statesToUpdate.push(() => {
      if (
        fetcher.data !== undefined &&
        fetcher.data.tetrisBoard !== undefined &&
        fetcher.data.streamOfBlocks !== undefined
      ) {
        setSetup({
          ...setup.current,
          board: fetcher.data.tetrisBoard,
          streamOfBlocks: fetcher.data.streamOfBlocks,
          position,
        });
      }
    });
    statesToUpdate.push(() => {
      if (
        fetcher.data !== undefined &&
        fetcher.data.tetrisBoard !== undefined
      ) {
        setBoard(fetcher.data.tetrisBoard);
      }
    });
    statesToUpdate.push(() => {
      if (
        fetcher.data !== undefined &&
        fetcher.data.streamOfBlocks !== undefined
      ) {
        setBlock(fetcher.data.streamOfBlocks[0]);
      }
    });
    statesToUpdate.push(() => {
      setPosition(position);
    });
    for (const stateUpdate of statesToUpdate) {
      stateUpdate();
    }
  }
  // Fetching tetris board and streamOfBlocks for current screen dimensions
  React.useEffect(() => {
    if (tetrisBoard === undefined) {
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
          rows: rows + BLOCK_HEIGHT,
        },
        { method: "GET" }
      );
    }
  }, []);
  // After document hydrated set the boardCellElements as reference
  // to access them in a performant way inside the game loop
  React.useEffect(() => {
    if (fetcher.data !== undefined && fetcher.data.tetrisBoard !== undefined) {
      const statesToUpdate: (() => void)[] = [];
      const rows = fetcher.data.tetrisBoard.length;
      const columns = fetcher.data.tetrisBoard[0].length;
      const cells: (Element | null)[][] = [];
      // The first $BLOCK_HEIGHT cells are not rendered for dropping in the blocks from above
      for (let rowIndex = BLOCK_HEIGHT; rowIndex < rows; rowIndex++) {
        cells[rowIndex] = [];
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
          cells[rowIndex][columnIndex] = document.querySelector(
            `#row${rowIndex}column${columnIndex}`
          );
          if (cells[rowIndex][columnIndex] === null) {
            console.error(
              `Could not find cell with id #row${rowIndex}column${columnIndex}`
            );
          }
        }
      }
      statesToUpdate.push(() =>
        setSetup({ ...setup.current, boardElement: cells })
      );
      statesToUpdate.push(() => {
        setBoardElement(cells);
      });
      statesToUpdate.push(() => setBoardLoaded(true));
      for (const stateUpdate of statesToUpdate) {
        stateUpdate();
      }
    }
  }, [fetcher.data]);

  // Handler for user input
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        if (gameStatusRef.current !== "running") {
          if (
            boardElement.current !== undefined &&
            boardLoadedRef.current === true
          ) {
            const statesToUpdate: (() => void)[] = [];
            statesToUpdate.push(() => setGameStatus("running"));
            statesToUpdate.push(() => {
              setBoard(setup.current.board);
            });
            statesToUpdate.push(() => {
              if (setup.current.streamOfBlocks !== undefined) {
                setBlock(setup.current.streamOfBlocks[0]);
              }
            });
            statesToUpdate.push(() => setBlockIndex(setup.current.blockIndex));
            statesToUpdate.push(() => setPosition(setup.current.position));
            for (let cell of boardElement.current.flat()) {
              if (cell !== null) {
                cell.className = `${cellColors[0]} ${CELL_WIDTH_CLASS_NAME} ${CELL_HEIGHT_CLASS_NAME} ${CELL_BASE_CLASS_NAME}`;
              }
            }
            for (const stateUpdate of statesToUpdate) {
              stateUpdate();
            }
            startGame();
          } else {
            // TODO: Make this visible to the user -> Toast?
            console.log("Tetris board not yet loaded");
          }
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
      // Early return if tetris board and all refs that depend on it are not yet loaded
      if (
        board.current !== undefined &&
        boardElement.current !== undefined &&
        block.current !== undefined &&
        position.current !== undefined &&
        setup.current.streamOfBlocks !== undefined
      ) {
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
        const currentState: {
          board: typeof board.current;
          boardElement: typeof boardElement.current;
          cellsToUpdate: CellsToUpdate;
          block: typeof block.current;
          position: typeof position.current;
          gameStatus: GameStatus;
        } = {
          board: board.current,
          boardElement: boardElement.current,
          cellsToUpdate: [],
          block: block.current,
          position: position.current,
          gameStatus: castToGameStatus(gameStatusRef.current),
        };
        let newState: typeof currentState | undefined;
        const statesToUpdate: (() => void)[] = [];
        let nextStep = false;

        // Moving current block down with the frequency defined in isTimeToMoveDown variable
        if (isTimeToMoveDown) {
          statesToUpdate.push(() => {
            setLastDownMove(timestamp);
          });
          newState = moveBlock("down", currentState);
        }
        // Not moving when both left and right are pressed
        if (
          isTimeToMoveSidewards &&
          (left.current === true && right.current === true) === false
        ) {
          // Moving current block to the left at any frame in the render cycle
          if (left.current === true) {
            statesToUpdate.push(() => setLastSideMove(timestamp));
            newState = moveBlock("left", newState || currentState);
          }
          // Moving current block to the right at any frame in the render cycle
          if (right.current === true) {
            statesToUpdate.push(() => setLastSideMove(timestamp));
            newState = moveBlock("right", newState || currentState);
          }
        }
        // Checking if any movement did happen in this frame of the render cycle
        if (newState !== undefined) {
          // Update the tetris board state to trigger a rerender
          statesToUpdate.push(() => {
            setBoard(newState.board);
          });
          /** Now check how game state has changed and accordingly update following states if needed:
           * - block
           * - blockIndex
           * - position
           * - gameState
           * And request the next frame if needed
           */
          if (newState.gameStatus === "running") {
            statesToUpdate.push(() => setGameStatus("running"));
            statesToUpdate.push(() => setBlock(newState.block));
            statesToUpdate.push(() => setPosition(newState.position));
            nextStep = true;
          } else if (newState.gameStatus === "nextBlockPlease") {
            // TODO: Clearing the board
            // Check if there are at least $X (f.e 10) cells with the same color in one place
            // Meaning all are neighbors of each other and share the same color
            // -> If so, remove them and move all rows above down
            const currentBlockIndex = blockIndex.current;
            const nextBlock =
              setup.current.streamOfBlocks[currentBlockIndex + 1];
            if (nextBlock === undefined) {
              statesToUpdate.push(() => setGameStatus("youWon"));
            } else {
              statesToUpdate.push(() => setGameStatus("running"));
              statesToUpdate.push(() => setBlock(nextBlock));
              statesToUpdate.push(() => setBlockIndex(currentBlockIndex + 1));
              statesToUpdate.push(() =>
                setPosition({
                  x:
                    Math.floor(newState.board[0].length / 2) -
                    Math.floor(nextBlock[0].length / 2),
                  y: 0,
                })
              );
              nextStep = true;
            }
          } else if (newState.gameStatus === "gameOver") {
            statesToUpdate.push(() => setGameStatus("gameOver"));
          } else if (newState.gameStatus === "idle") {
            statesToUpdate.push(() => setGameStatus("idle"));
          } else {
            console.error("Unknown game state", newState.gameStatus);
            statesToUpdate.push(() => setGameStatus("idle"));
          }
        } else {
          // No movement in this frame of the render cycle so no need to update states
          // But request the next step to keep the game running
          nextStep = true;
        }
        // Batched updates
        for (let stateUpdate of statesToUpdate) {
          stateUpdate();
        }
        if (newState !== undefined) {
          for (let cell of newState.cellsToUpdate) {
            const { element, className } = cell;
            if (element !== null) {
              element.className = className;
            }
          }
        }
        if (nextStep) {
          window.requestAnimationFrame(step);
        }
      } else {
        console.error("Started game loop without loaded tetris board");
      }
    };
    if (gameStatusRef.current === "running") {
      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="relative w-full grid grid-cols-1 justify-center text-center gap-4 select-none">
      {/* TODO: Styling */}
      {/* TODO: Mobile controls */}
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
        ) : null}
        {fetcher.data !== undefined &&
        fetcher.data.tetrisBoard !== undefined ? (
          <div className={`${gameStatus === "running" ? "block" : "hidden"}`}>
            <TetrisBoardComponent.Board id="tetris-board">
              {fetcher.data.tetrisBoard.map((row, rowIndex) =>
                row.map((cellValue, columnIndex) =>
                  // The top $BLOCK_HEIGHT cells are not rendered
                  // and used to drop in the block from above.
                  setup.current.streamOfBlocks !== undefined &&
                  rowIndex >= setup.current.streamOfBlocks[0].length ? (
                    <TetrisBoardComponent.Cell
                      id={`row${rowIndex}column${columnIndex}`}
                      key={`row${rowIndex}column${columnIndex}`}
                      cellValue={cellValue}
                    />
                  ) : null
                )
              )}
            </TetrisBoardComponent.Board>
          </div>
        ) : null}
      </div>
      <header className="absolute top-0 w-full h-8 pb-1 flex justify-between items-center gap-4 px-4 bg-gradient-to-r from-emerald-950 from-1% via-transparent via-50% to-emerald-950 to-99%">
        <h1 className="text-nowrap">
          Story Tetris
          {boardLoaded === false ? " - Tetris board loading..." : ""}
        </h1>
        <nav className="w-full flex justify-end">
          <div className="flex items-center group">
            <div className="absolute h-screen inset-0 bg-emerald-950 bg-opacity-20 group-has-[:checked]:flex hidden justify-center items-center">
              <section className="flex flex-col gap-2 border border-gray-600 bg-black p-4 rounded-xl">
                <h2 className="text-2xl text-start">How to play?</h2>
                <ul className="text-left">
                  <li>Press Enter to start the game.</li>
                  <li>Press Escape to stop the game.</li>
                  <li>Arrow keys to move tetris blocks.</li>
                  <li>📜 Find out {author}s' story.</li>
                </ul>
              </section>
            </div>
            <label
              htmlFor="how-to-play"
              className="relative cursor-pointer group-has-[:checked]:absolute group-has-[:checked]:inset-0 group-has-[:checked]:h-screen group-has-[:checked]:text-end group-has-[:checked]:pr-4 group-has-[:checked]:pt-[2px]"
            >
              How to play?
            </label>
            <input
              type="checkbox"
              id="how-to-play"
              className="absolute w-0 h-0 opacity-0"
              defaultChecked={false}
            />
          </div>
        </nav>
      </header>
    </div>
  );
}
