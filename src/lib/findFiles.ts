import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively searches for files matching a pattern, starting from a directory
 * @param startDir - The directory to start searching from
 * @param pattern - The file name or pattern to search for (supports glob patterns via includes/match)
 * @param options - Optional configuration
 * @returns Array of full paths to matching files
 */
export async function findFiles(
  startDir: string,
  pattern: string | RegExp,
  options: {
    caseSensitive?: boolean;
    matchFullPath?: boolean;
  } = {}
): Promise<string[]> {
  const { caseSensitive = false, matchFullPath = false } = options;
  const results: string[] = [];

  async function searchDir(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);

        try {
          const stats = await stat(fullPath);

          if (stats.isDirectory()) {
            await searchDir(fullPath);
          } else if (stats.isFile()) {
            const toMatch = matchFullPath ? fullPath : entry;

            if (typeof pattern === "string") {
              const matchString = caseSensitive
                ? toMatch
                : toMatch.toLowerCase();
              const patternString = caseSensitive
                ? pattern
                : pattern.toLowerCase();
              if (matchString.includes(patternString)) {
                results.push(fullPath);
              }
            } else {
              if (pattern.test(toMatch)) {
                results.push(fullPath);
              }
            }
          }
        } catch (err) {
          // Skip files/dirs we can't access
          continue;
        }
      }
    } catch (err) {
      // Skip directories we can't read
      return;
    }
  }

  await searchDir(startDir);
  return results;
}
