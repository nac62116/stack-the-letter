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
  for (const row of block) {
    let columnIndex = 0;
    for (const cell of row) {
      if (cell === 1) {
        const element = document.getElementById(
          `${position.y + rowIndex}-${position.x + columnIndex}`
        );
        if (element !== null) {
          if (remove) {
            element.classList.remove("bg-green-700");
          } else {
            element.classList.add("bg-green-700");
          }
        }
      }
      columnIndex++;
    }
    rowIndex++;
  }
}
