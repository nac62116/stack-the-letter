import React from "react";
import {
  cellColors,
  FALLBACK_CELL_COLOR,
} from "~/shared/dynamic-cell-color-map";
import { gridCols, gridRows } from "~/shared/dynamic-grid-map";
import {
  height,
  MAX_BOARD_HEIGHT,
  MAX_BOARD_WIDTH,
  width,
} from "~/shared/dynamic-size-map";

/** Tetris board size is currently capped to 1280x720 pixel resolution.
 * This size leads to ...
 * ... Math.floor((1280 + $CELL_GAP) / ($CELL_WIDTH + $CELL_GAP)) ...
 * ... * Math.floor((720 + $CELL_GAP) / ($CELL_WIDTH + $CELL_GAP)) ...
 * ... Cells.
 * Example:
 * $CELL_WIDTH = 4
 * $CELL_GAP = 2
 * 214 * 120 = 25680 cells
 * At this moment i don't want to make it more performance heavy.
 * This cap is realized by ...
 * ... the dynamic-grid-map.ts file ...
 * ... the tailwind.config.ts file ...
 * ... and the board size initialization in TetrisBoard.tsx.
 * Keep that in mind if you want to change the cell or board size.
 */

export const CELL_BASE_CLASS_NAME = "rounded-sm";
export const CELL_WIDTH = 4;
export const CELL_WIDTH_CLASS_NAME = "w-1";
export const CELL_HEIGHT = 4;
export const CELL_HEIGHT_CLASS_NAME = "h-1";
export const CELL_GAP = 2;
const CELL_GAP_CLASS_NAME = "gap-[2px]";

const Board = (props: {
  id: string;
  children: React.ReactNode | HTMLCollection;
}) => {
  const { id, children } = props;

  const childrenArray = Array.isArray(children) ? children : [children];

  const initialContainerClassName = "absolute top-0 grid place-items-center";
  const containerClassNameRef = React.useRef<string>(initialContainerClassName);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const initialClassName = `grid place-items-center ${CELL_GAP_CLASS_NAME}`;
  const classNameRef = React.useRef<string>(initialClassName);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current !== null && containerRef.current !== null) {
      // Set grid cols and rows based on screen width and height
      const screenWidth = Math.floor(window.innerWidth);
      const screenHeight = Math.floor(window.innerHeight);
      const containerWidth = screenWidth;
      const containerHeight = screenHeight;
      const boardWidth =
        screenWidth <= MAX_BOARD_WIDTH ? screenWidth : MAX_BOARD_WIDTH;
      const boardHeight =
        screenHeight <= MAX_BOARD_HEIGHT ? screenHeight : MAX_BOARD_HEIGHT;
      const showBorderX = screenWidth > MAX_BOARD_WIDTH;
      const showBorderY = screenHeight > MAX_BOARD_HEIGHT;
      const columns = Math.floor(
        (screenWidth + CELL_GAP) / (CELL_WIDTH + CELL_GAP)
      );
      const rows = Math.floor(
        (screenHeight + CELL_GAP) / (CELL_HEIGHT + CELL_GAP)
      );
      let gridColsClassName = gridCols[columns - 1];
      let gridRowsClassName = gridRows[rows - 1];
      if (gridColsClassName === undefined) {
        // The last gridCols class is currently optimized for $MAX_BOARD_WIDTH
        gridColsClassName = gridCols[gridCols.length - 1];
      }
      if (gridRowsClassName === undefined) {
        // The last gridRows class is currently optimized for $MAX_BOARD_HEIGHT
        gridRowsClassName = gridRows[gridRows.length - 1];
      }
      containerRef.current.className = `${width[containerWidth]} ${height[containerHeight]} ${containerClassNameRef.current}`;
      ref.current.className = `${width[boardWidth]} ${height[boardHeight]} ${
        classNameRef.current
      } ${gridColsClassName} ${gridRowsClassName} ${
        showBorderX ? "border-x border-x-gray-600" : "border-none"
      } ${showBorderY ? "border-y border-y-gray-600" : "border-none"}`;
    }
  }, []);

  return (
    <div ref={containerRef} className={containerClassNameRef.current}>
      <div id={id} ref={ref} className={classNameRef.current}>
        {childrenArray.map((child) => child)}
      </div>
    </div>
  );
};

const Cell = (props: { id: string; cellValue: number }) => {
  const { id, cellValue } = props;

  return (
    <div
      id={id}
      className={`${
        cellColors[cellValue] || FALLBACK_CELL_COLOR
      } ${CELL_WIDTH_CLASS_NAME} ${CELL_HEIGHT_CLASS_NAME} ${CELL_BASE_CLASS_NAME}`}
    />
  );
};

const TetrisBoard = {
  Board,
  Cell,
};

export { TetrisBoard };
