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

const arguments_ = new Set(process.argv.slice(2));
const isDryRun = arguments_.has("--dry-run");

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

if (isDryRun) {
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
