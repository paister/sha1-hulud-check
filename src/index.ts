import { checkDependencies } from "./checkDependencies";
import { scanIOCs } from "./scanIOCs";

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
  await main(directory);
}
