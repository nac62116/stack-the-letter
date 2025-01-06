import React from "react";
import {
  cellColors,
  FALLBACK_CELL_COLOR,
} from "~/shared/dynamic-cell-color-map";
import { gridCols, gridRows } from "~/shared/dynamic-grid-map";

const Board = (props: {
  id: string;
  boardHeight: number;
  boardWidth: number;
  blockHeight: number;
  children: React.ReactNode | HTMLCollection;
}) => {
  const { id, boardHeight, boardWidth, blockHeight, children } = props;

  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div
      id={id}
      // The top $BLOCK_HEIGHT cells are not rendered
      // and used to drop in the block from above.
      className={`grid ${gridRows[boardHeight - blockHeight - 1]} ${
        gridCols[boardWidth - 1]
      } place-items-center gap-[2px] border border-gray-600`}
    >
      {childrenArray.map((child) => child)}
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
