// To change the cell color dynamically,
// we need to explicitly map cell values
// to the corresponding tailwind color classes.

import type { ArrayElement } from "./type-helper";

type CellColorClassNames = [
  "bg-inherit", // 0 <- inactive cell color
  // Below cells are all active
  "bg-orange-500/80", // 1
  "bg-yellow-500/75", // 2
  "bg-blue-500/80", // 3
  "bg-red-500/75" // 4
];
export const cellColorNumbers = [0, 1, 2, 3, 4] as const;
export type CellColorNumber = ArrayElement<typeof cellColorNumbers>;
export const activeCellColorNumbers = [1, 2, 3, 4] as const;
export type ActiveCellColorNumber = ArrayElement<typeof activeCellColorNumbers>;

export const FALLBACK_CELL_COLOR = "bg-ember-500/85"; // >= $cellColors.length

export const cellColorClassNames: CellColorClassNames = [
  "bg-inherit",
  "bg-orange-500/80",
  "bg-yellow-500/75",
  "bg-blue-500/80",
  "bg-red-500/75",
];
