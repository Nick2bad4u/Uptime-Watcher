#!/usr/bin/env node

/**
 * Run actionlint for workflow files, excluding Build.yml by default to avoid
 * hangs. Pass --include-build to lint all workflows (including Build.yml).
 *
 * Defaults:
 *
 * - Disable shellcheck/pyflakes integrations unless explicitly provided.
 * - Enable color output unless -no-color is provided.
 * - Use .github/actionlint.yaml unless -config-file is provided.
 */

import { readdirSync } from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const excludedFiles = new Set(["build.yml", "build.yaml"]);
/** @type {Set<string>} */
const flagsWithValues = new Set([
    "-config-file",
    "-format",
    "-ignore",
    "-pyflakes",
    "-shellcheck",
    "-stdin-filename",
]);

/**
 * @param {string[]} userArgs - Parsed actionlint arguments.
 * @param {string} flag - Flag to find.
 *
 * @returns {boolean} `true` when the flag is present.
 */
function hasFlag(userArgs, flag) {
    return userArgs.includes(flag);
}

/**
 * @param {string[]} userArgs - Parsed actionlint arguments.
 * @param {string[]} flags - Flags to find.
 *
 * @returns {boolean} `true` when any flag is present.
 */
function hasAnyFlag(userArgs, flags) {
    return flags.some((flag) => hasFlag(userArgs, flag));
}

/**
 * @param {string[]} rawArgs - Raw CLI arguments.
 * @param {string} repoRoot - Repository root path.
 *
 * @returns {{
 *     targetFiles: string[];
 *     userArgs: string[];
 *     useDefaultFiles: boolean;
 * }}
 */
function buildActionlintArgs(rawArgs, repoRoot = process.cwd()) {
    const includeBuild = rawArgs.includes("--include-build");
    const workflowsDir = path.join(repoRoot, ".github", "workflows");
    /** @type {string[]} */
    const userArgs = [];
    /** @type {string[]} */
    const fileArgs = [];

    for (let index = 0; index < rawArgs.length; index += 1) {
        const arg = rawArgs[index];

        if (arg === undefined) {
            continue;
        }

        if (arg === "--include-build") {
            continue;
        }

        if (arg === "-" || !arg.startsWith("-")) {
            fileArgs.push(arg);
            continue;
        }

        userArgs.push(arg);

        if (flagsWithValues.has(arg)) {
            const value = rawArgs[index + 1];
            if (typeof value === "string") {
                userArgs.push(value);
                index += 1;
            }
        }
    }

    const useDefaultFiles =
        fileArgs.length === 0 &&
        !hasAnyFlag(userArgs, ["-version", "-init-config"]);

    if (!hasFlag(userArgs, "-config-file")) {
        userArgs.push("-config-file", path.join(".github", "actionlint.yaml"));
    }

    if (!hasAnyFlag(userArgs, ["-color", "-no-color"])) {
        userArgs.push("-color");
    }

    if (!hasFlag(userArgs, "-shellcheck")) {
        userArgs.push("-shellcheck", "");
    }

    if (!hasFlag(userArgs, "-pyflakes")) {
        userArgs.push("-pyflakes", "");
    }

    const workflowFiles = useDefaultFiles
        ? readdirSync(workflowsDir, { withFileTypes: true })
              .filter((entry) => entry.isFile())
              .map((entry) => path.join(workflowsDir, entry.name))
              .filter((filePath) => {
                  const ext = path.extname(filePath).toLowerCase();
                  if (ext !== ".yml" && ext !== ".yaml") {
                      return false;
                  }

                  if (includeBuild) {
                      return true;
                  }

                  return !excludedFiles.has(
                      path.basename(filePath).toLowerCase()
                  );
              })
              .toSorted((left, right) => left.localeCompare(right))
        : [];

    return {
        targetFiles: useDefaultFiles ? workflowFiles : fileArgs,
        userArgs,
        useDefaultFiles,
    };
}

/**
 * @param {string[]} args - CLI arguments.
 * @param {string} repoRoot - Repository root path.
 *
 * @returns {number} Process exit status.
 */
function main(args = process.argv.slice(2), repoRoot = process.cwd()) {
    const { targetFiles, userArgs, useDefaultFiles } = buildActionlintArgs(
        args,
        repoRoot
    );

    if (useDefaultFiles && targetFiles.length === 0) {
        console.error("No workflow files found to lint.");
        return 1;
    }

    const result = spawnSync("actionlint", [...userArgs, ...targetFiles], {
        stdio: "inherit",
    });

    if (result.error) {
        console.error("Failed to run actionlint:", result.error);
        return 1;
    }

    return result.status ?? 1;
}

/**
 * @returns {boolean} `true` when this file is the CLI entrypoint.
 */
function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    process.exitCode = main();
}

export { buildActionlintArgs, hasAnyFlag, hasFlag, isDirectRun, main };
