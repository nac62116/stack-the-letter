export function transposeMatrix(matrix: any[][]) {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}
