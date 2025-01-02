import type { loader } from "~/routes/home";

export function removeBlock(options: {
  block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
  position: {
    x: number;
    y: number;
  };
}) {
  renderBlock({ ...options, remove: true });
}

export function renderBlock(options: {
  block: Awaited<ReturnType<typeof loader>>["streamOfBlocks"][0];
  position: {
    x: number;
    y: number;
  };
  remove?: boolean;
}) {
  const { block, position, remove = false } = options;
  let rowIndex = 0;
  for (const blockRow of block) {
    let columnIndex = 0;
    for (const blockCell of blockRow) {
      if (blockCell === 1) {
        const boardCell = document.getElementById(
          `${position.y + rowIndex}-${position.x + columnIndex}`
        );
        if (boardCell !== null) {
          if (remove) {
            boardCell.classList.remove("bg-green-700");
          } else {
            boardCell.classList.add("bg-green-700");
          }
        }
      }
      columnIndex++;
    }
    rowIndex++;
  }
}
