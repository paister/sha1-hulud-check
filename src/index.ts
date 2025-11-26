import { scanIOCs } from "./scanIOCs";

if (import.meta.main) {
  const directory = Bun.argv[2];
  if (!directory) {
    console.error("Please provide a directory to scan as an argument.");
    console.error("Usage: bun run check <directory>");
    process.exit(1);
  }
  await scanIOCs(directory);
}
