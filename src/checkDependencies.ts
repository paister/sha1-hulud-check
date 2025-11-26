import { findFiles } from "./lib/findFiles";
import { getCompromisedPackages } from "./lib/getCompromisedPackages";
import { getLockDependencies } from "./lib/getLockDependencies";
import type { CheckDependenciesResult, Dependency } from "./types";
import { join } from "node:path";
import { hash } from "bun";
export async function checkDependencies(directory: string): Promise<void> {
  const compromisedPackages = await getCompromisedPackages();
  console.log(
    `\t🔍 Checking ${compromisedPackages.length} confirmed compromised packages`
  );

  console.log(`\t🔍 Searching for lock files in ${directory}`);
  const lockFiles = await findFiles(directory, /\.lock$/i, {
    matchFullPath: true,
  });
  console.log(`\t🔍 Found ${lockFiles.length} lock files`);

  let totalMatches = 0;

  for (const lockFile of lockFiles) {
    const matches = await checkLockFile(lockFile, compromisedPackages);
    totalMatches += matches.length;
    await saveResults(matches, lockFile);
  }

  if (totalMatches > 0) {
    console.log(`\t🚨 Found ${totalMatches} matches`);
  } else {
    console.log(`\t🟢 No dependencies compromised were found`);
  }
}

const saveResults = async (
  results: CheckDependenciesResult[],
  lockFile: string
): Promise<void> => {
  const lockFileName =
    lockFile.split("/").pop()?.replace(".lock", "") || "unknown";
  const logfilePathHash = hash(lockFile);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultFileName = `dependencies-${lockFileName}-${logfilePathHash}-${timestamp}.json`;
  const resultPath = join(process.cwd(), "results", resultFileName);

  const resultData = {
    lockFilePath: lockFile,
    scanTimestamp: new Date().toISOString(),
    totalMatches: results.length,
    results: results,
  };

  await Bun.write(resultPath, JSON.stringify(resultData, null, 2));
  console.log(`\t💾 Results saved to ${resultPath}`);
};

const checkLockFile = async (
  lockFile: string,
  compromisedPackages: Dependency[]
): Promise<CheckDependenciesResult[]> => {
  const lockDependencies = await getLockDependencies(lockFile);
  console.log(`\t\t🔍 Checking dependencies for ${lockFile}`);

  const matches = findMatches(lockDependencies, compromisedPackages);

  if (matches.length > 0) {
    console.log(`\t🚨 Found ${matches.length} matches`);
    matches.forEach((match) => {
      if (match.type === "version_match") {
        console.log(
          `\t\t🚨 COMPROMISED VERSION: ${match.lockedPackage.name} ${match.lockedPackage.version} - This exact version is known to be compromised!`
        );
      } else {
        console.log(
          `\t\t⚠️  WARNING: ${match.lockedPackage.name} ${match.lockedPackage.version} - Package is compromised but probably not this version`
        );
      }
    });
  } else {
    console.log(`\t\t🟢 No matches found`);
  }
  return matches;
};

const findMatches = (
  lockDependencies: Dependency[],
  compromisedPackages: Dependency[]
): CheckDependenciesResult[] => {
  const matches: CheckDependenciesResult[] = [];
  for (const lockDependency of lockDependencies) {
    for (const compromisedPackage of compromisedPackages) {
      if (lockDependency.name === compromisedPackage.name) {
        if (lockDependency.version === compromisedPackage.version) {
          matches.push({
            lockedPackage: lockDependency,
            compromisedPackage: compromisedPackage,
            type: "version_match",
          });
        } else {
          matches.push({
            lockedPackage: lockDependency,
            compromisedPackage: compromisedPackage,
            type: "name_match",
          });
        }
      }
    }
  }
  return matches;
};
