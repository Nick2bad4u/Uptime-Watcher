#!/usr/bin/env node

/**
 * Deletes local branches that have already been merged into the current HEAD.
 *
 * @remarks
 * This replaces the previous POSIX-only `grep | xargs` package script with a
 * Node implementation that works consistently from PowerShell, cmd, and POSIX
 * shells.
 */

import { spawnSync } from "node:child_process";

const protectedBranches = new Set([
    "develop",
    "main",
    "master",
]);

/**
 * Print usage information and exit immediately.
 *
 * @returns {void}
 */
function showHelp() {
    console.log(`
Usage: node scripts/delete-merged-branches.mjs [options]

Options:
  --dry-run    List eligible merged local branches without deleting them
  --help, -h   Show this help message
`);
}

/**
 * Parse command line arguments.
 *
 * @param {string[]} args - Raw command line arguments.
 *
 * @returns {{ dryRun: boolean; help: boolean }} Parsed options.
 */
function parseArgs(args) {
    const options = {
        dryRun: false,
        help: false,
    };

    for (const arg of args) {
        switch (arg) {
            case "--dry-run": {
                options.dryRun = true;
                break;
            }
            case "--help":
            case "-h": {
                options.help = true;
                break;
            }
            default: {
                throw new Error(`Unknown argument: ${arg}`);
            }
        }
    }

    return options;
}

let options;
try {
    options = parseArgs(process.argv.slice(2));
} catch (error) {
    console.error(
        "❌ Error:",
        error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
}

if (options.help) {
    showHelp();
    process.exit(0);
}

const runGit = (args, options = {}) => {
    const result = spawnSync("git", args, {
        encoding: "utf8",
        ...options,
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        const stderr =
            typeof result.stderr === "string" ? result.stderr.trim() : "";
        throw new Error(stderr || `git ${args.join(" ")} failed`);
    }

    return typeof result.stdout === "string" ? result.stdout : "";
};

const currentBranch = runGit(["branch", "--show-current"]).trim();

const mergedBranches = runGit(["branch", "--merged"])
    .split(/\r?\n/u)
    .map((line) => line.replace(/^\*\s*/u, "").trim())
    .filter((branch) => branch.length > 0)
    .filter((branch) => branch !== currentBranch)
    .filter((branch) => !protectedBranches.has(branch));

if (mergedBranches.length === 0) {
    console.log("No merged local branches are eligible for deletion.");
    process.exit(0);
}

if (options.dryRun) {
    console.log("Merged local branches eligible for deletion:");
    for (const branch of mergedBranches) {
        console.log(`- ${branch}`);
    }
    process.exit(0);
}

for (const branch of mergedBranches) {
    runGit(
        [
            "branch",
            "-d",
            branch,
        ],
        { stdio: "inherit" }
    );
}
