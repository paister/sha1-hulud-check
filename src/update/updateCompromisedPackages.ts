import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { sha256FromFile } from "../lib/sha256FromFile";

const GOOGLE_SHEETS_URL =
  "https://docs.google.com/spreadsheets/d/16aw6s7mWoGU7vxBciTEZSaR5HaohlBTfVirvI-PypJc/export?format=csv&gid=1289659284";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ASSETS_FILE = resolve(
  __dirname,
  "../../assets/Public Sha1-Hulud - Koi.csv"
);

async function downloadCsv(url: string): Promise<string> {
  console.log(`📥 Downloading CSV from ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download CSV: ${response.status} ${response.statusText}`
    );
  }
  return await response.text();
}

async function compareFiles(
  newContent: string,
  existingPath: string
): Promise<boolean> {
  try {
    const existingHash = await sha256FromFile(existingPath);
    const newHash = createHash("sha256").update(newContent).digest("hex");
    return existingHash === newHash;
  } catch {
    console.log("📄 Assets file does not exist, will create it.");
    return false;
  }
}

async function updateCompromisedPackages() {
  try {
    console.log("🔄 Updating compromised packages list...");
    console.log("");

    // Download the CSV
    const newCsvContent = await downloadCsv(GOOGLE_SHEETS_URL);
    console.log(`✅ Downloaded ${newCsvContent.length} bytes`);

    // Check if file exists and compare
    const isSame = await compareFiles(newCsvContent, ASSETS_FILE);

    if (isSame) {
      console.log("✅ No changes detected. Assets file is up to date.");
      return;
    }

    // Write the new content
    console.log("📝 Writing updated CSV to assets file...");
    await Bun.write(ASSETS_FILE, newCsvContent);
    console.log(`✅ Successfully updated ${ASSETS_FILE}`);
    console.log("");
    console.log("🎉 Update complete!");
  } catch (error) {
    console.error("❌ Error updating compromised packages:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await updateCompromisedPackages();
}
