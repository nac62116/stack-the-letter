import React from "react";
import {
  cellColors,
  FALLBACK_CELL_COLOR,
} from "~/shared/dynamic-cell-color-map";
import { gridCols, gridRows } from "~/shared/dynamic-grid-map";

const Board = (props: {
  id: string;
  children: React.ReactNode | HTMLCollection;
}) => {
  const { id, children } = props;

  const childrenArray = Array.isArray(children) ? children : [children];

  const initialContainerClassName = "absolute top-0 grid place-items-center";
  const containerClassNameRef = React.useRef<string>(initialContainerClassName);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const initialClassName = "grid place-items-center gap-[2px]";
  const classNameRef = React.useRef<string>(initialClassName);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current !== null && containerRef.current !== null) {
      // Set grid cols and rows based on screen width and height
      const screenWidth = Math.floor(window.innerWidth);
      const screenHeight = Math.floor(window.innerHeight);
      const containerWidth = screenWidth;
      const containerHeight = screenHeight;
      let boardWidth;
      let boardHeight;
      // + 2 because a gap is between the cells, so every cell is 6px wide except one thats 4px
      const columns = Math.floor((screenWidth + 2) / 6);
      const rows = Math.floor((screenHeight + 2) / 6);
      let gridColsClassName = gridCols[columns - 1];
      let gridRowsClassName = gridRows[rows - 1];
      // Tetris board size is currently capped to 1280x720
      // This size already leads to 214 x 120 = 25680 cells
      // At this moment i don't want to make it more performance heavy
      if (gridColsClassName === undefined) {
        gridColsClassName = gridCols[gridCols.length - 1];
        boardWidth = 1280;
      }
      if (gridRowsClassName === undefined) {
        gridRowsClassName = gridRows[gridRows.length - 1];
        boardHeight = 720;
      }
      containerRef.current.className = `w-[${screenWidth}px] h-[${screenHeight}px] ${containerClassNameRef.current}`;
      ref.current.className = `w-[${screenWidth}px] h-[${screenHeight}px] ${classNameRef.current} ${gridColsClassName} ${gridRowsClassName}`;
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
      } w-1 h-1 rounded-sm`}
    />
  );
};

const TetrisBoard = {
  Board,
  Cell,
};

export { TetrisBoard };
