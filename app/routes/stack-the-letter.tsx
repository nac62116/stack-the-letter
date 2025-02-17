import type { Route } from "./+types/stack-the-letter";
import {
  getBoard,
  getReadableBlocks,
  type Board,
} from "~/shared/stack-the-letter-builder";
import React from "react";
import {
  ACCELERATED_DOWN_MOVEMENT_SPEED,
  type BoardCellElements,
  castToGameStatus,
  type CellsToUpdate,
  DOWN_MOVEMENT_SPEED,
  type GameStatus,
  moveBlock,
  NUMBER_OF_GROUPED_CELLS_TO_REMOVE,
  type Position,
  removeCellsOfSameColor,
  SIDE_MOVEMENT_SPEED,
} from "~/shared/stack-the-letter-runtime";
import {
  CELL_BASE_CLASS_NAME,
  CELL_HEIGHT_CLASS_NAME,
  CELL_WIDTH_CLASS_NAME,
  Board as BoardComponent,
  Cell,
} from "~/components/Board";
import { BLOCK_HEIGHT, type Block } from "~/shared/alphabet";
import {
  CELL_GAP,
  CELL_HEIGHT,
  CELL_WIDTH,
  MAX_BOARD_COLUMNS,
  MAX_BOARD_ROWS,
  MIN_BOARD_COLUMNS,
  MIN_BOARD_ROWS,
} from "~/shared/stack-the-letter-builder";
import { cellColorClassNames } from "~/shared/dynamic-cell-color-map";
import { Letter } from "~/components/Letter";
import { ronjasLetter } from "letters/ronja";
import { GitHubLogo } from "~/components/logos/GitHubLogo";
import { Link } from "react-router";
import { petersLetter } from "letters/peter";
import { mintvernetztTeamLetter } from "letters/mintvernetzt-team";

export function meta({
  data: {
    author,
    letter: { salutation: headline },
  },
}: Route.MetaArgs) {
  return [
    { title: `Stack the Letter - ${author}s' Letter` },
    { name: "description", content: headline },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // FEATURE: Let users write their own letters
  // FEATURE: New setting: Let user choose their own color palette
  // FEATURE: Mobile controls
  const author = "Colin";

  const defaultLetter = {
    salutation: "Hey there,",
    message:
      "i'm Colin and i made this app. I hope you enjoy it. Soon you will be able to write your own letters and choose your own color palette.",
    regards: "Greetings, Colin",
  } as const;

  let letter:
    | typeof defaultLetter
    | typeof ronjasLetter
    | typeof petersLetter
    | typeof mintvernetztTeamLetter;
  const accessToken = new URL(request.url).searchParams.get("accessToken");
  if (accessToken === process.env.ACCESS_TOKEN_RONJA) {
    letter = ronjasLetter;
  } else if (accessToken === process.env.ACCESS_TOKEN_PETER) {
    letter = petersLetter;
  } else if (accessToken === process.env.ACCESS_TOKEN_MINT_VERNETZT_TEAM) {
    letter = mintvernetztTeamLetter;
  } else if (accessToken === process.env.ACCESS_TOKEN_LUKI_LEON) {
    letter = defaultLetter;
  } else if (accessToken === process.env.ACCESS_TOKEN_JAN) {
    letter = defaultLetter;
  } else {
    letter = defaultLetter;
  }

  return {
    author,
    letter,
  } as const;
}

export default function StackTheLetter({ loaderData }: Route.ComponentProps) {
  const { author, letter } = loaderData;

  const initialSetup: {
    gameStatus: GameStatus;
    board: Board | undefined;
    boardElement: HTMLDivElement | null;
    boardCellElements: BoardCellElements | undefined;
    streamOfBlocks: Block[] | undefined;
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
    // Will be set when document is hydrated as it depends on screen size
    board: undefined,
    // Will be of type HTMLDivElement when document is hydrated
    boardElement: null,
    // Will be set when document is hydrated as it depends on screen size
    boardCellElements: undefined,
    // Will be set when document is hydrated as it depends on screen size
    streamOfBlocks: undefined,
    blockIndex: 0,
    // Will be set when document is hydrated as it depends on screen size
    position: undefined,
    lastDownMove: 0,
    lastSideMove: 0,
    left: false,
    right: false,
    accelerate: false,
    boardLoaded: false,
  };
  // Keep track of the initial setup because it changes when document is hydrated
  const [_setup, _setSetup] = React.useState(initialSetup);
  const setup = React.useRef(initialSetup);
  const setSetup = (newSetup: typeof initialSetup) => {
    setup.current = newSetup;
    _setSetup(newSetup);
  };

  // References to the game for usage in key handlers and game loop
  // Game state refs
  const [_gameStatus, _setGameStatus] = React.useState(initialSetup.gameStatus);
  const gameStatus = React.useRef(initialSetup.gameStatus);
  const setGameStatus = (newGameStatus: typeof initialSetup.gameStatus) => {
    gameStatus.current = newGameStatus;
    _setGameStatus(newGameStatus);
  };
  const board = React.useRef(initialSetup.board);
  const setBoard = (newBoard: typeof initialSetup.board) => {
    board.current = newBoard;
  };
  const boardElement = React.useRef(null);
  const boardCellElements = React.useRef(initialSetup.boardCellElements);
  const setBoardCellElements = (
    newBoardCellElements: typeof initialSetup.boardCellElements
  ) => {
    boardCellElements.current = newBoardCellElements;
  };
  const block = React.useRef<Block | undefined>(undefined);
  const setBlock = (newBlock: Block | undefined) => {
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
  const [_boardLoaded, _setBoardLoaded] = React.useState(
    initialSetup.boardLoaded
  );
  const boardLoaded = React.useRef(initialSetup.boardLoaded);
  const setBoardLoaded = (newBoardLoaded: typeof initialSetup.boardLoaded) => {
    boardLoaded.current = newBoardLoaded;
    _setBoardLoaded(newBoardLoaded);
  };

  // After document hydrated set the board and its dependencies
  React.useEffect(() => {
    const statesToUpdate: (() => void)[] = [];
    let columns = Math.floor(
      (window.innerWidth + CELL_GAP) / (CELL_WIDTH + CELL_GAP)
    );
    const maxColumns = MAX_BOARD_COLUMNS;
    const minColumns = MIN_BOARD_COLUMNS;
    if (columns > maxColumns) {
      columns = maxColumns;
    }
    if (columns < minColumns) {
      columns = minColumns;
    }
    let rows = Math.floor(
      (window.innerHeight + CELL_GAP) / (CELL_HEIGHT + CELL_GAP)
    );
    const maxRows = MAX_BOARD_ROWS;
    const minRows = MIN_BOARD_ROWS;
    if (rows > maxRows) {
      rows = maxRows;
    }
    if (rows < minRows) {
      rows = minRows;
    }
    // Add $BLOCK_HEIGHT cells on top of the board to drop in the blocks from above
    // These will not be rendered (see map in below html)
    const board = getBoard(columns, rows + BLOCK_HEIGHT);
    const streamOfBlocks = getReadableBlocks({
      letter,
      columns,
      screenWidth: window.innerWidth,
    });
    const position = {
      x:
        Math.floor(board[0].length / 2) -
        Math.floor(streamOfBlocks[0][0].length / 2),
      y: 0,
    };
    statesToUpdate.push(() => setBoard(board));
    statesToUpdate.push(() => setBlock(streamOfBlocks[0]));
    statesToUpdate.push(() => setPosition(position));
    statesToUpdate.push(() => setBoardLoaded(true));
    statesToUpdate.push(() =>
      setSetup({
        ...setup.current,
        board,
        streamOfBlocks,
        position,
      })
    );
    for (const stateUpdate of statesToUpdate) {
      stateUpdate();
    }
  }, []);

  // After the board data and its dependencies are set -> aka setup.current has changed
  // we reference the boardCellElements
  // to access them in a performant way inside the game loop
  React.useEffect(() => {
    if (boardElement.current !== null && board.current !== undefined) {
      const statesToUpdate: (() => void)[] = [];
      const boardCellElements: BoardCellElements = [];
      // The first $BLOCK_HEIGHT cells are not rendered for dropping in the blocks from above
      for (
        let rowIndex = BLOCK_HEIGHT;
        rowIndex < board.current.length;
        rowIndex++
      ) {
        boardCellElements[rowIndex] = [];
        for (
          let columnIndex = 0;
          columnIndex < board.current[0].length;
          columnIndex++
        ) {
          boardCellElements[rowIndex][columnIndex] = document.querySelector(
            `#row${rowIndex}column${columnIndex}`
          );
          if (boardCellElements[rowIndex][columnIndex] === null) {
            console.error(
              `Could not find cell with id #row${rowIndex}column${columnIndex}`
            );
          }
        }
      }
      statesToUpdate.push(() => {
        setBoardCellElements(boardCellElements);
      });
      statesToUpdate.push(() =>
        setSetup({
          ...setup.current,
          boardCellElements,
        })
      );
      for (const stateUpdate of statesToUpdate) {
        stateUpdate();
      }
    }
  }, [setup.current.board]);

  // Handler for user input
  React.useEffect(() => {
    if (boardElement.current !== null) {
      const keydown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          if (gameStatus.current !== "running") {
            if (boardCellElements.current !== undefined) {
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
              statesToUpdate.push(() =>
                setBlockIndex(setup.current.blockIndex)
              );
              statesToUpdate.push(() => setPosition(setup.current.position));
              for (let cell of boardCellElements.current.flat()) {
                if (cell !== null) {
                  cell.className = `${cellColorClassNames[0]} ${CELL_WIDTH_CLASS_NAME} ${CELL_HEIGHT_CLASS_NAME} ${CELL_BASE_CLASS_NAME}`;
                }
              }
              for (const stateUpdate of statesToUpdate) {
                stateUpdate();
              }
              startGame();
            } else {
              console.error("Game loop started without loaded board");
            }
          }
        }
        if (event.key === "Escape") {
          if (gameStatus.current !== "idle") {
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
    }
  }, [boardElement.current]);

  // Game Loop via window.requestAnimationFrame API
  // -> see https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
  const startGame = () => {
    // Render cycle
    // -> Cycle frequency is approximately Matching the screen refresh rate
    const step: FrameRequestCallback = (timestamp) => {
      // Early return if game status is not running
      if (gameStatus.current !== "running") {
        return;
      }
      // Early return if board and all refs that depend on it are not yet loaded
      if (
        board.current !== undefined &&
        boardCellElements.current !== undefined &&
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
          timestamp - lastSideMove.current >= SIDE_MOVEMENT_SPEED &&
          // Not moving when both left and right are pressed
          (left.current === true && right.current === true) === false;
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
          boardCellElements: typeof boardCellElements.current;
          cellsToUpdate: CellsToUpdate;
          block: typeof block.current;
          position: typeof position.current;
          gameStatus: GameStatus;
        } = {
          board: board.current,
          boardCellElements: boardCellElements.current,
          cellsToUpdate: [],
          block: block.current,
          position: position.current,
          gameStatus: castToGameStatus(gameStatus.current),
        };
        let movementResult: ReturnType<typeof moveBlock> | undefined;
        const statesToUpdate: (() => void)[] = [];
        let nextStep = false;

        // TODO: Rotating the current block
        if (isTimeToMoveDown) {
          // Moving current block diagonally if it also wants to move left or right
          if (
            isTimeToMoveSidewards &&
            (left.current === true || right.current === true)
          ) {
            if (left.current === true) {
              statesToUpdate.push(() => setLastSideMove(timestamp));
              statesToUpdate.push(() => setLastDownMove(timestamp));
              movementResult = moveBlock("diagonal-left", currentState);
            }
            if (right.current === true) {
              statesToUpdate.push(() => setLastSideMove(timestamp));
              statesToUpdate.push(() => setLastDownMove(timestamp));
              movementResult = moveBlock("diagonal-right", currentState);
            }
          } else {
            // Moving current block down
            statesToUpdate.push(() => setLastDownMove(timestamp));
            movementResult = moveBlock("down", currentState);
          }
        } else {
          if (
            isTimeToMoveSidewards &&
            (left.current === true || right.current === true)
          ) {
            if (left.current === true) {
              // Moving current block to the left
              statesToUpdate.push(() => setLastSideMove(timestamp));
              movementResult = moveBlock("left", currentState);
            }
            // Moving current block to the right
            if (right.current === true) {
              statesToUpdate.push(() => setLastSideMove(timestamp));
              movementResult = moveBlock("right", currentState);
            }
          }
        }
        // Checking if any movement did happen in this frame of the render cycle
        if (movementResult !== undefined) {
          /** Check how game state has changed and accordingly update following states if needed:
           * - board
           * - block
           * - blockIndex
           * - position
           * - gameState
           * And request the next frame if needed
           */
          if (movementResult.gameStatus === "running") {
            statesToUpdate.push(() => {
              if (movementResult !== undefined) {
                setBoard(movementResult.board);
              }
            });
            statesToUpdate.push(() => setGameStatus("running"));
            statesToUpdate.push(() => {
              if (movementResult !== undefined) {
                setBlock(movementResult.block);
              }
            });
            statesToUpdate.push(() => {
              if (movementResult !== undefined) {
                setPosition(movementResult.position);
              }
            });
            nextStep = true;
          } else if (movementResult.gameStatus === "nextBlockPlease") {
            const currentBlockIndex = blockIndex.current;
            const nextBlock =
              setup.current.streamOfBlocks[currentBlockIndex + 1];
            if (nextBlock === undefined) {
              statesToUpdate.push(() => setGameStatus("youWon"));
            } else {
              movementResult = removeCellsOfSameColor({
                ...movementResult,
                boardCellElements: boardCellElements.current,
              });
              statesToUpdate.push(() => {
                if (movementResult !== undefined) {
                  setBoard(movementResult.board);
                }
              });
              statesToUpdate.push(() => setGameStatus("running"));
              statesToUpdate.push(() => setBlock(nextBlock));
              statesToUpdate.push(() => setBlockIndex(currentBlockIndex + 1));
              statesToUpdate.push(() => {
                if (movementResult !== undefined) {
                  setPosition({
                    x:
                      Math.floor(movementResult.board[0].length / 2) -
                      Math.floor(nextBlock[0].length / 2),
                    y: 0,
                  });
                }
              });
              nextStep = true;
            }
          } else if (movementResult.gameStatus === "gameOver") {
            statesToUpdate.push(() => setGameStatus("gameOver"));
          } else if (movementResult.gameStatus === "idle") {
            statesToUpdate.push(() => setGameStatus("idle"));
          } else {
            console.error("Unknown game state", movementResult.gameStatus);
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
        // Batched rerendering of the board
        if (movementResult !== undefined) {
          for (let cell of movementResult.cellsToUpdate) {
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
        console.error("Started game loop without loaded board");
      }
    };
    if (gameStatus.current === "running") {
      window.requestAnimationFrame(step);
    }
  };

  return (
    <div className="relative w-full grid grid-cols-1 justify-center text-center gap-4 select-none">
      <div id="header-placeholder" className="w-full h-8" />
      <div className="grid grid-cols-1 justify-center">
        {gameStatus.current === "idle" ||
        gameStatus.current === "gameOver" ||
        gameStatus.current === "youWon" ? (
          <div className="w-full flex justify-center">
            <div className="py-8 max-w-[376px] flex flex-col gap-2 sm:border sm:border-gray-600 p-4 rounded-xl">
              {gameStatus.current === "idle" ? (
                <>
                  <h2 className="bold text-2xl mb-4">
                    {author} wrote you a letter.
                  </h2>
                  <p>
                    If you want to read it,
                    <br />
                    you have to play a game of "Stack the Letter".
                  </p>
                  {boardLoaded.current === false ? (
                    <p>Please wait until the game finished loading...</p>
                  ) : (
                    <p>Press Enter to take a look at it.</p>
                  )}
                  <noscript>
                    <p>
                      Sorry, you need to enable JavaScript
                      <br />
                      to play this game.
                    </p>
                    <p>But you can still read the letter if you want.</p>
                    <Letter letter={letter} boardLoaded={boardLoaded.current} />
                  </noscript>
                </>
              ) : gameStatus.current === "youWon" ? (
                <>
                  <h2 className="bold text-2xl mb-4">You got it!</h2>
                  <p>Here is the full letter from {author}.</p>
                  <Letter letter={letter} boardLoaded={boardLoaded.current} />
                </>
              ) : (
                <>
                  <h2 className="bold text-2xl mb-4">Cliff hanger</h2>
                  <p>Your blocks are stacked to the top.</p>
                  <p>But the letter wasn't finished yet.</p>
                  <p>Press Enter to try again.</p>
                </>
              )}
            </div>
          </div>
        ) : null}

        {setup.current.board !== undefined ? (
          <div
            ref={boardElement}
            className={`${
              gameStatus.current === "running" ? "block" : "hidden"
            }`}
          >
            <BoardComponent id="board">
              {setup.current.board.map((row, rowIndex) =>
                row.map((cellValue, columnIndex) =>
                  // The top $BLOCK_HEIGHT cells are not rendered
                  // and used to drop in the block from above.
                  setup.current.streamOfBlocks !== undefined &&
                  rowIndex >= setup.current.streamOfBlocks[0].length ? (
                    <Cell
                      id={`row${rowIndex}column${columnIndex}`}
                      key={`row${rowIndex}column${columnIndex}`}
                      cellValue={cellValue}
                    />
                  ) : null
                )
              )}
            </BoardComponent>
          </div>
        ) : null}
      </div>
      {/* TODO: Test this on a real touch device. Browser simulator fires the touchEnd event right after touchStart even if i hold the simulated touch. */}
      <div
        className="fixed top-0 w-full h-dvh flex flex-col justify-end bg-gray-800 transition-opacity opacity-0"
        onTouchStart={(event) => {
          event.currentTarget.classList.remove("opacity-0");
          if (event.currentTarget.classList.contains("opacity-50") === false) {
            event.currentTarget.classList.add("opacity-50");
          }
        }}
        onTouchEnd={(event) => {
          event.currentTarget.classList.remove("opacity-50");
          if (event.currentTarget.classList.contains("opacity-0") === false) {
            event.currentTarget.classList.add("opacity-0");
          }
        }}
      >
        <div className="grid grid-cols-3 w-full">
          <button
            className="w-full h-16 flex justify-center items-center border border-gray-300 bg-gray-500 focus:bg-gray-300"
            title="Move left"
            onTouchStart={() => {
              if (left.current === false) {
                setLeft(true);
              }
            }}
            onTouchEnd={() => {
              if (left.current === true) {
                setLeft(false);
              }
            }}
          >
            <span className="rotate-90">▼</span>
          </button>
          <button
            className="w-full h-16 flex justify-center items-center border border-gray-300 bg-gray-500 focus:bg-gray-300"
            title="Move Down"
            onTouchStart={() => {
              if (accelerate.current === false) {
                setAccelerate(true);
              }
            }}
            onTouchEnd={() => {
              if (accelerate.current === true) {
                setAccelerate(false);
              }
            }}
          >
            <span>▼</span>
          </button>
          <button
            className="w-full h-16 flex justify-center items-center border border-gray-300 bg-gray-500 focus:bg-gray-300"
            title="Move Right"
            onTouchStart={() => {
              if (right.current === false) {
                setRight(true);
              }
            }}
            onTouchEnd={() => {
              if (right.current === true) {
                setRight(false);
              }
            }}
          >
            <span className="-rotate-90">▼</span>
          </button>
        </div>
      </div>
      <header className="absolute top-0 w-full h-8 pb-1 flex justify-between items-center gap-4 px-4 bg-linear-to-r from-blue-950 from-1% via-transparent via-50% to-blue-950 to-99%">
        <h1 className="text-nowrap">
          Stack The Letter
          {boardLoaded.current === false ? " - Loading..." : ""}
        </h1>
        <nav className="w-full flex justify-end">
          <div className="flex items-center group">
            <div className="absolute h-dvh inset-0 bg-blue-950/90 group-has-checked:flex hidden justify-center items-center">
              <section className="flex flex-col gap-2 border border-gray-600 bg-black p-4 rounded-xl">
                <h2 className="text-2xl text-start">How to play?</h2>
                <ul className="text-left">
                  <li className="flex">
                    <div className="w-8">💌</div>Press Enter to start the game.
                  </li>
                  <li className="flex">
                    <div className="w-8">🏃</div>Press Escape to stop the game.
                  </li>
                  <li className="flex">
                    <div className="w-8">⌨️</div>Arrow keys to move blocks.
                  </li>
                  <li className="flex">
                    <div className="w-8 flex pl-1 items-center">
                      <BoardComponent
                        id="how-to-play-board"
                        fixedSize={{
                          width: 12,
                          height: 8,
                          showBorderX: false,
                          showBorderY: false,
                        }}
                        position="relative"
                      >
                        {[
                          [0, 1, 2],
                          [3, 4, 5],
                        ].map((row, rowIndex) =>
                          row.map((cellValue, columnIndex) => (
                            <Cell
                              id={`how-to-play-board-row${rowIndex}column${columnIndex}`}
                              key={`how-to-play-board-row${rowIndex}column${columnIndex}`}
                              cellValue={cellValue}
                            />
                          ))
                        )}
                      </BoardComponent>
                    </div>
                    {NUMBER_OF_GROUPED_CELLS_TO_REMOVE} cells in a group will be
                    removed.
                  </li>
                  <li className="flex">
                    <div className="w-8">📜</div>Find out what {author} wrote
                    you.
                  </li>
                </ul>
              </section>
            </div>
            <label
              htmlFor="how-to-play"
              className="relative cursor-pointer group-has-checked:absolute group-has-checked:inset-0 group-has-checked:h-dvh group-has-checked:text-end group-has-checked:pr-4 group-has-checked:pt-[2px]"
            >
              How to play?
            </label>
            <input
              type="checkbox"
              id="how-to-play"
              className="absolute w-0 h-0 opacity-0"
              defaultChecked={false}
            />
            <div className="absolute h-dvh inset-0 pointer-events-none">
              <div className="relative w-full h-full pointer-events-none">
                <footer className="hidden group-has-checked:flex absolute bottom-4 right-4 gap-2 pointer-events-auto">
                  <span>Made with ❤️ by Colin</span>
                  <span>-</span>
                  <Link
                    to="https://github.com/nac62116/stack-the-letter"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Repository - Stack The Letter"
                    className="flex items-end justify-center"
                  >
                    <GitHubLogo />
                  </Link>
                </footer>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
