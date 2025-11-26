import { findFiles } from "./lib/findFiles";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const checkPackageFile = async (packageFile: string): Promise<boolean> => {
  const packageJson = await Bun.file(packageFile).json();
  const containsPreinstall =
    packageJson &&
    packageJson.scripts &&
    typeof packageJson.scripts.preinstall === "string" &&
    packageJson.scripts.preinstall.trim() === "node setup_bun.js";

  return containsPreinstall;
};

export const checkPackageFiles = async (directory: string): Promise<void> => {
  const packageFiles = await findFiles(directory, "**/package.json");
  const flagged: string[] = [];

  for (const packageFile of packageFiles) {
    try {
      const containsPreinstall = await checkPackageFile(packageFile);
      if (containsPreinstall) {
        flagged.push(packageFile);
      }
    } catch (error) {
      continue;
    }
  }

  const resultsDir = resolve(process.cwd(), "results");
  await mkdir(resultsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultJson = {
    scanTimestamp: timestamp,
    totalPackageFiles: packageFiles.length,
    flaggedFiles: flagged,
    flaggedCount: flagged.length,
    ok: flagged.length === 0,
    message:
      flagged.length === 0
        ? "No package.json files with 'preinstall: node setup_bun.js' found."
        : "The following package.json files contain 'preinstall: node setup_bun.js' in scripts.",
  };

  const resultFilePath = resolve(
    resultsDir,
    `checkPackageFiles-${timestamp}.json`
  );
  await Bun.write(resultFilePath, JSON.stringify(resultJson, null, 2));
};
