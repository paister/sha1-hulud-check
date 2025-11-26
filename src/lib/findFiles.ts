import { Glob } from "bun";
import { resolve } from "node:path";

/**
 * Recursively searches for files matching a glob pattern, starting from a directory
 * @param startDir - The directory to start searching from
 * @param pattern - Glob pattern string
 * @returns Array of full paths to matching files
 */
export async function findFiles(
  startDir: string,
  pattern: string
): Promise<string[]> {
  const results: string[] = [];
  const glob = new Glob(pattern);
  const resolvedStartDir = resolve(startDir);

  for await (const file of glob.scan(resolvedStartDir)) {
    const fullPath = resolve(resolvedStartDir, file);
    results.push(fullPath);
  }

  return results;
}
