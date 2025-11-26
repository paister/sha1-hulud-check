import { checkDependencies } from "./checkDependencies";
import { checkPackageFiles } from "./checkPackageFiles";
import { scanIOCs } from "./scanIOCs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

async function main(directory: string) {
  const startTime = performance.now();

  console.log("🔒 Security Scanner");
  console.log("==================");
  console.log("Scanning for compromised packages and indicators of compromise");
  console.log("");

  console.log(`📂 Scanning directory: ${directory}`);
  await scanIOCs(directory);

  console.log(`📦 Checking dependencies in ${directory}`);
  await checkDependencies(directory);

  console.log(`📦 Checking package files in ${directory}`);
  await checkPackageFiles(directory);

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log("");
  console.log(`⏱️ Scan completed in ${duration} seconds`);
}

if (import.meta.main) {
  const directory = Bun.argv[2];
  if (!directory) {
    console.error("Please provide a directory to scan as an argument.");
    console.error("Usage: bun run check <directory>");
    process.exit(1);
  }

  const dir = resolve(directory);

  try {
    await access(dir);
  } catch (error) {
    console.error(
      `Error: Directory '${dir}' does not exist or is not accessible.`
    );
    process.exit(1);
  }

  await main(dir);
}
