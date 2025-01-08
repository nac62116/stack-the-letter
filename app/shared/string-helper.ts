export function splitStringAtIndex(string: string, index: number) {
  const firstPart = string.substring(0, index);
  const secondPart = string.substring(index);
  return [firstPart, secondPart];
}
