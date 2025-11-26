import type { Dependency } from "../types";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export async function getCompromisedPackages(): Promise<Dependency[]> {
  let compromisedPackages: Dependency[] = [];
  compromisedPackages = [...(await loadKoiList())];
  return compromisedPackages;
}

const loadKoiList = async (): Promise<Dependency[]> => {
  const csvPath = join(process.cwd(), "assets", "Public Sha1-Hulud - Koi.csv");
  const csvContent = await readFile(csvPath, "utf-8");

  const lines = csvContent.split("\n");
  const dependencies: Dependency[] = [];

  // Skip header row and process each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (line) {
      const [name, version] = line.split(",");
      if (name && version) {
        dependencies.push({
          name: name.trim(),
          version: version.trim(),
        });
      }
    }
  }

  return dependencies;
};
