#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const DOCUSAURUS_PREFIX = "docs/docusaurus";
const REMOTE_NAME = "origin-docs";
const TARGET_BRANCH = "main";

function showUsage() {
    console.log(`Usage: node scripts/push-docusaurus-subtree.mjs [--force]

Pushes ${DOCUSAURUS_PREFIX} to ${REMOTE_NAME}/${TARGET_BRANCH}.

Options:
  --force      Split the subtree locally and force-push it to the target branch.
  --help, -h   Show this help message.`);
}

function runGit(arguments_, options = {}) {
    return spawnSync("git", arguments_, {
        encoding: options.capture ? "utf8" : undefined,
        stdio: options.capture
            ? [
                  "ignore",
                  "pipe",
                  "inherit",
              ]
            : "inherit",
    });
}

function ensureRemoteExists() {
    const result = runGit(
        [
            "remote",
            "get-url",
            REMOTE_NAME,
        ],
        {
            capture: true,
        }
    );

    if (result.status === 0) {
        return true;
    }

    console.error(
        `Missing git remote '${REMOTE_NAME}'. Add it with:\n` +
            `git remote add ${REMOTE_NAME} https://github.com/Nick2bad4u/Uptime-Watcher-Docusaurus.git`
    );
    return false;
}

function pushSubtree() {
    return runGit([
        "subtree",
        "push",
        `--prefix=${DOCUSAURUS_PREFIX}`,
        REMOTE_NAME,
        TARGET_BRANCH,
    ]).status;
}

function forcePushSubtree() {
    const splitResult = runGit(
        [
            "subtree",
            "split",
            `--prefix=${DOCUSAURUS_PREFIX}`,
        ],
        {
            capture: true,
        }
    );

    if (splitResult.status !== 0) {
        return splitResult.status ?? 1;
    }

    const splitCommit = splitResult.stdout.trim();
    if (!/^[\da-f]{40}$/iu.test(splitCommit)) {
        console.error(
            `git subtree split returned an unexpected commit id: ${splitCommit}`
        );
        return 1;
    }

    return runGit([
        "push",
        REMOTE_NAME,
        `${splitCommit}:${TARGET_BRANCH}`,
        "--force",
    ]).status;
}

function main(rawArguments = process.argv.slice(2)) {
    const force = rawArguments.includes("--force");
    const help = rawArguments.includes("--help") || rawArguments.includes("-h");
    const unknownArguments = rawArguments.filter(
        (argument) =>
            argument !== "--force" && argument !== "--help" && argument !== "-h"
    );

    if (help) {
        showUsage();
        return 0;
    }

    if (unknownArguments.length > 0) {
        console.error(`Unknown arguments: ${unknownArguments.join(", ")}`);
        showUsage();
        return 1;
    }

    if (!ensureRemoteExists()) {
        return 1;
    }

    return force ? forcePushSubtree() : pushSubtree();
}

process.exitCode = main();

export {
    ensureRemoteExists,
    forcePushSubtree,
    main,
    pushSubtree,
    runGit,
    showUsage,
};
