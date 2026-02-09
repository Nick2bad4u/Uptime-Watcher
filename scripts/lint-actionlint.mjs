#!/usr/bin/env node

/**
 * Run actionlint for workflow files, excluding Build.yml by default to avoid hangs.
 * Pass --include-build to lint all workflows (including Build.yml).
 *
 * Defaults:
 * - Disable shellcheck/pyflakes integrations unless explicitly provided.
 * - Enable color output unless -no-color is provided.
 * - Use config/linting/ActionLintConfig.yaml unless -config-file is provided.
 */

import { readdirSync } from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const workflowsDir = path.join(repoRoot, ".github", "workflows");
const rawArgs = process.argv.slice(2);
const includeBuild = rawArgs.includes("--include-build");
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

/** @param {string} flag */
const hasFlag = (flag) => userArgs.includes(flag);
/** @param {string[]} flags */
const hasAnyFlag = (flags) => flags.some((flag) => hasFlag(flag));
const useDefaultFiles = fileArgs.length === 0 &&
    !hasAnyFlag(["-version", "-init-config"]);

if (!hasFlag("-config-file")) {
    userArgs.push(
        "-config-file",
        path.join("config", "linting", "ActionLintConfig.yaml"),
    );
}

if (!hasAnyFlag(["-color", "-no-color"])) {
    userArgs.push("-color");
}

if (!hasFlag("-shellcheck")) {
    userArgs.push("-shellcheck", "");
}

if (!hasFlag("-pyflakes")) {
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

              return !excludedFiles.has(path.basename(filePath).toLowerCase());
          })
          .toSorted((left, right) => left.localeCompare(right))
    : [];

const targetFiles = useDefaultFiles ? workflowFiles : fileArgs;

if (useDefaultFiles && targetFiles.length === 0) {
    console.error("No workflow files found to lint.");
    process.exit(1);
}

const result = spawnSync(
    "actionlint",
    [...userArgs, ...targetFiles],
    { stdio: "inherit" },
);

if (result.error) {
    console.error("Failed to run actionlint:", result.error);
    process.exit(1);
}

process.exit(result.status ?? 1);
