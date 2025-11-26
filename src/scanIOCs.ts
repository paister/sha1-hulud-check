import { findFiles } from "./lib/findFiles";
import { IOCS } from "./IOC";
import { sha256FromFile } from "./lib/sha256FromFile";

export async function scanIOCs(directory: string): Promise<void> {
  console.log(`Scanning ${directory} for IOCs...`);
  const foundFiles: { file: string; ioc: string; hash: string }[] = [];

  for (const ioc of IOCS) {
    const files = await findFiles(directory, ioc.name);

    for (const file of files) {
      try {
        const fileHash = await sha256FromFile(file);

        if (ioc.sha256.includes(fileHash)) {
          foundFiles.push({
            file,
            ioc: ioc.name,
            hash: fileHash,
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }

  if (foundFiles.length > 0) {
    console.log(`Found ${foundFiles.length} IOC matches:`);
    foundFiles.forEach(({ file, ioc, hash }) => {
      console.log(`  ${ioc}: ${file} (${hash})`);
    });
  } else {
    console.log("No IOC matches found.");
  }
}
