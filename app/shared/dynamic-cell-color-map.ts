// To change the cell color dynamically,
// we need to explicitly map cell values
// to the corresponding tailwind color classes.

type CellColors = [
  "bg-inherit", // 0 <- inactive cell color
  // Below cells are all active
  "bg-red-500", // 1
  "bg-yellow-500", // 2
  "bg-green-500", // 3
  "bg-blue-500", // 4
  "bg-indigo-500", // 5
  "bg-purple-500", // 6
  "bg-pink-500", // 7
  "bg-gray-500", // 8
  "bg-white" // 9
];
export type CellColorNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const FALLBACK_CELL_COLOR = "bg-ember-500"; // >= $cellColors.length

export const cellColors: CellColors = [
  "bg-inherit",
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-gray-500",
  "bg-white",
];
