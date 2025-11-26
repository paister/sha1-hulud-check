import { Glob } from "bun";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const WORKFLOW_FILE_PATTERN = "**/.github/workflows/formatter_123456789.yml";
const WORKFLOW_FILE_NAME = "formatter_123456789.yml";
const REPORT_FILE_PREFIX = "checkGithubWorkflow";

export const checkGithubWorkflows = async (
  directory: string
): Promise<void> => {
  const glob = new Glob(WORKFLOW_FILE_PATTERN);
  const resolvedDir = resolve(directory);
  const foundFiles: string[] = [];

  for await (const file of glob.scan(resolvedDir)) {
    const fullPath = resolve(resolvedDir, file);
    foundFiles.push(fullPath);
  }

  if (foundFiles.length > 0) {
    console.log(
      `\t🚨 ALERT: The suspicious workflow file '${WORKFLOW_FILE_NAME}' was found in ${foundFiles.length} location(s):`
    );
    for (const file of foundFiles) {
      console.log(`\t\t- ${file}`);
    }
  } else {
    console.log(
      `\t🟢 No suspicious workflow file '${WORKFLOW_FILE_NAME}' found.`
    );
  }

  const resultsDir = resolve(process.cwd(), "results");
  await mkdir(resultsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultJson = {
    scanTimestamp: timestamp,
    directory: directory,
    workflowFiles: foundFiles,
    found: foundFiles.length > 0,
    foundCount: foundFiles.length,
    ok: foundFiles.length === 0,
    message:
      foundFiles.length === 0
        ? `No suspicious workflow file '${WORKFLOW_FILE_NAME}' found.`
        : `The suspicious workflow file '${WORKFLOW_FILE_NAME}' was found in ${foundFiles.length} location(s).`,
  };

  const resultFilePath = resolve(
    resultsDir,
    `${REPORT_FILE_PREFIX}-${timestamp}.json`
  );
  await Bun.write(resultFilePath, JSON.stringify(resultJson, null, 2));
};
