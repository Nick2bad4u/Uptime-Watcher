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
import * as path from "node:path";
import { pathToFileURL } from "node:url";

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

const runGit = (args, commandOptions = {}) => {
    const result = spawnSync("git", args, {
        encoding: "utf8",
        ...commandOptions,
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

/**
 * Find local branches that are merged into the current HEAD and not protected.
 *
 * @returns {string[]} Eligible local branch names.
 */
function getMergedBranches() {
    const currentBranch = runGit(["branch", "--show-current"]).trim();

    return runGit(["branch", "--merged"])
        .split(/\r?\n/u)
        .map((line) => line.replace(/^\*\s*/u, "").trim())
        .filter((branch) => branch.length > 0)
        .filter((branch) => branch !== currentBranch)
        .filter((branch) => !protectedBranches.has(branch));
}

/**
 * Delete or list merged branches.
 *
 * @param {{ dryRun: boolean; help: boolean }} options - Parsed CLI options.
 *
 * @returns {boolean} `true` when the command completes successfully.
 */
function deleteMergedBranches(options) {
    if (options.help) {
        showHelp();
        return true;
    }

    const mergedBranches = getMergedBranches();

    if (mergedBranches.length === 0) {
        console.log("No merged local branches are eligible for deletion.");
        return true;
    }

    if (options.dryRun) {
        console.log("Merged local branches eligible for deletion:");
        for (const branch of mergedBranches) {
            console.log(`- ${branch}`);
        }
        return true;
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

    return true;
}

/**
 * Main execution function.
 *
 * @param {string[]} args - CLI arguments.
 *
 * @returns {boolean} `true` when branch cleanup completes successfully.
 */
function main(args = process.argv.slice(2)) {
    try {
        return deleteMergedBranches(parseArgs(args));
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        return false;
    }
}

/**
 * @returns {boolean} `true` when this file is the CLI entrypoint.
 */
function isDirectInvocation() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectInvocation()) {
    process.exitCode = main() ? 0 : 1;
}

export {
    deleteMergedBranches,
    getMergedBranches,
    isDirectInvocation,
    main,
    parseArgs,
    runGit,
    showHelp,
};
