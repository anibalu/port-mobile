/**
 * Converts a 36-character folder ID into one of the predefined colors.
 *
 * This utility function takes a folder ID string of 36 characters
 * and returns a consistent color from a predefined set of colors.
 * The same folder ID will always return the same color.
 *
 * @param folderId - A string representing the folder ID (36 characters).
 * @returns A string representing the selected color's hex code.
 */
export function folderIdToHex(folderId: string, colors: any): string {
  const colorKeys = Object.keys(colors) as Array<keyof typeof colors>;

  // Compute a more varied hash to distribute folder IDs more evenly across colors
  let hash = 0;
  for (let i = 0; i < folderId.length; i++) {
    hash = (hash * 31 + folderId.charCodeAt(i)) % 1000000007; // A large prime number
  }

  const colorIndex = hash % colorKeys.length;
  return colors[colorKeys[colorIndex]];
}
