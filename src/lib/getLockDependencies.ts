import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { Dependency } from "../types";

/**
 * Reads a bun.lock file and extracts all installed dependencies
 * @param lockFilePath - Path to the bun.lock file
 * @returns Array of dependencies with name and version
 */
async function getBunLockDependencies(
  lockFilePath: string
): Promise<Dependency[]> {
  try {
    const lockContent = await readFile(lockFilePath, "utf-8");
    // Remove trailing commas to make it valid JSON (bun.lock allows trailing commas)
    const cleanedContent = lockContent.replace(/,(\s*[}\]])/g, "$1");
    const lockData = JSON.parse(cleanedContent);

    const dependencies: Dependency[] = [];

    // Extract dependencies from packages section
    if (lockData.packages) {
      for (const [packageKey, packageInfo] of Object.entries(
        lockData.packages
      )) {
        if (Array.isArray(packageInfo) && packageInfo.length > 0) {
          // Parse package name and version from the first element
          const packageString = packageInfo[0] as string;
          const match = packageString.match(/^(.+)@(.+)$/);

          if (match && match[1] && match[2]) {
            const name = match[1];
            const version = match[2];
            // Extract hash from the 4th element if it exists
            const hash =
              packageInfo.length > 3 ? (packageInfo[3] as string) : undefined;
            dependencies.push({ name, version, hash });
          }
        }
      }
    }

    // Also extract from workspaces dependencies if present
    if (lockData.workspaces) {
      for (const workspace of Object.values(lockData.workspaces)) {
        const workspaceData = workspace as any;

        // Add regular dependencies
        if (workspaceData.dependencies) {
          for (const [name, version] of Object.entries(
            workspaceData.dependencies
          )) {
            dependencies.push({ name, version: version as string });
          }
        }

        // Add dev dependencies
        if (workspaceData.devDependencies) {
          for (const [name, version] of Object.entries(
            workspaceData.devDependencies
          )) {
            dependencies.push({ name, version: version as string });
          }
        }

        // Add peer dependencies
        if (workspaceData.peerDependencies) {
          for (const [name, version] of Object.entries(
            workspaceData.peerDependencies
          )) {
            dependencies.push({ name, version: version as string });
          }
        }
      }
    }

    // Remove duplicates based on name
    const uniqueDependencies = dependencies.filter(
      (dep, index, self) => index === self.findIndex((d) => d.name === dep.name)
    );

    return uniqueDependencies;
  } catch (error) {
    throw new Error(`Failed to read or parse bun.lock file: ${error}`);
  }
}

/**
 * Reads a lock file and extracts all installed dependencies
 * @param lockFilePath - Path to the lock file
 * @returns Array of dependencies with name and version
 */
export async function getLockDependencies(
  lockFilePath: string
): Promise<Dependency[]> {
  const fileName = basename(lockFilePath);
  console.log(`\t\t📦 Processing lock file: ${fileName} at ${lockFilePath}`);

  if (fileName === "bun.lock") {
    return getBunLockDependencies(lockFilePath);
  }

  console.log(`\t\t🚨 Unsupported lock file type: ${fileName}`);
  return [];
}
