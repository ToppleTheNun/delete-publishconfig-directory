import { constants } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

import { version } from "../package.json";

interface CommonOptions {
  /**
   * Should an error be thrown if no publishConfig directory exists? Defaults to `false`.
   */
  errorOnNoPublishConfigDirectory?: boolean;
  /**
   * Should log additional information?
   */
  verbose?: boolean;
}

const verboseLog = (
  isVerbose: boolean,
  ...data: Parameters<typeof console.log>
) => {
  if (!isVerbose) {
    return;
  }
  console.log(...data);
};

interface GetPublishConfigDirectoryParams extends CommonOptions {
  /**
   * Working directory to read package.json from. Defaults to `process.cwd()`.
   */
  cwd?: string;
}

/**
 * Gets the directory specified in "publishConfig" of the package.json in the given working directory.
 */
export const getPublishConfigDirectory = async ({
  cwd = process.cwd(),
  errorOnNoPublishConfigDirectory = false,
  verbose = false,
}: GetPublishConfigDirectoryParams = {}): Promise<string | undefined> => {
  const pathToPkg = join(cwd, "package.json");
  verboseLog(verbose, `Attempting to read from ${pathToPkg}`);

  const canAccess = access(pathToPkg, constants.F_OK);
  if (!canAccess) {
    throw new Error(`Unable to read ${pathToPkg}`);
  }

  const pkgContents = await readFile(pathToPkg, { encoding: "utf-8" });
  verboseLog(verbose, `Read contents from ${pathToPkg}`);
  const pkg = JSON.parse(pkgContents);
  const { publishConfig } = pkg;
  if (!publishConfig || !publishConfig.directory) {
    if (errorOnNoPublishConfigDirectory) {
      throw new Error(
        `No "publishConfig.directory" value present in ${pathToPkg}`
      );
    }
    verboseLog(
      verbose,
      `No "publishConfig.directory" value present in ${pathToPkg}`
    );
    return undefined;
  }
  return join(process.cwd(), publishConfig.directory);
};

interface DeletePublishConfigDirectoryParams extends CommonOptions {
  /**
   * Working directory to read package.json from. Defaults to `process.cwd()`.
   */
  publishConfigDirectory: string;
}
export const deletePublishConfigDirectory = async ({
  errorOnNoPublishConfigDirectory = false,
  publishConfigDirectory,
  verbose = false,
}: DeletePublishConfigDirectoryParams): Promise<void> => {
  const pathToPkg = join(publishConfigDirectory, "package.json");
  verboseLog(
    verbose,
    `Attempting to delete publishConfig.directory from ${pathToPkg}`
  );

  const canAccess = access(pathToPkg, constants.F_OK);
  if (!canAccess) {
    if (errorOnNoPublishConfigDirectory) {
      throw new Error("Unable to find package.json in publishConfig directory");
    }
    return;
  }

  const pkgContents = await readFile(pathToPkg, { encoding: "utf-8" });
  verboseLog(verbose, `Read contents from ${pathToPkg}`);
  const pkg = JSON.parse(pkgContents);
  const { publishConfig } = pkg;
  if (publishConfig) {
    delete publishConfig["directory"];
    verboseLog(verbose, `Deleted publishConfig.directory from ${pathToPkg}`);
  }
  pkg.publishConfig = publishConfig;
  await writeFile(pathToPkg, JSON.stringify(pkg, null, 2), {
    encoding: "utf-8",
  });
  verboseLog(verbose, `Saved file to ${pathToPkg}`);
};

const HELP =
  "delete-publishconfig-directory\n" +
  "\n" +
  "Available options:\n" +
  "  --version  Displays version information\n" +
  "  --help     Displays this help text\n" +
  "  --verbose  Outputs additional logs\n" +
  "  --strict   Throws an error if unable to delete";
const printHelp = () => {
  process.stdout.write(`${HELP}\n`);
};

type Options = CommonOptions;
export const run = async (args: string[]) => {
  const options: Options = {};
  const argv = args.slice(2);
  if (argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  if (argv.includes("--version")) {
    process.stdout.write(`${version}\n`);
    process.exit(0);
  }
  if (argv.includes("--strict")) {
    options.errorOnNoPublishConfigDirectory = true;
  }
  if (argv.includes("--verbose")) {
    options.verbose = true;
  }

  const publishConfigDirectory = await getPublishConfigDirectory({
    ...options,
    cwd: process.cwd(),
  });
  if (!publishConfigDirectory) {
    return;
  }

  await deletePublishConfigDirectory({ ...options, publishConfigDirectory });
};
