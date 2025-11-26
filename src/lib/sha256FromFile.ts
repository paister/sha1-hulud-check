import { createHash } from "node:crypto";

/**
 * Generates a SHA256 hash from a file
 * @param filePath - The path to the file to hash
 * @returns Promise that resolves to the SHA256 hash as a hexadecimal string
 */
export async function sha256FromFile(filePath: string): Promise<string> {
  try {
    const fileBuffer = await Bun.file(filePath).bytes();
    const hash = createHash("sha256");
    hash.update(fileBuffer);
    return hash.digest("hex");
  } catch (error) {
    throw new Error(
      `Failed to generate SHA256 hash for file ${filePath}: ${error}`
    );
  }
}
