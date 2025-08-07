#!/usr/bin/env node

/**
 * Script to find all empty directories recursively under the 'electron' and 'src' folders.
 * Usage: Run this script from the project root.
 * Requires: Node.js
 * Run on windows with: node scripts/find-empty-dirs.mjs
 */

import { join, relative } from "node:path";
import { stat, readdir } from "node:fs/promises";

/**
 * The absolute path to the project root directory where the script is executed.
 */
const ROOT_DIR = process.cwd();
const TARGET_DIRS = ["electron", "src"];

/**
 * Helper to check if a path is a directory, with error handling.
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function isDirectory(path) {
    try {
        const s = await stat(path);
        return s.isDirectory();
    } catch (err) {
        if (err && err.code === "EACCES") {
            console.warn(`Permission denied: ${path}`);
        } else {
            console.warn(`Error accessing ${path}:`, err.message || err);
        }
        return false;
    }
}

/**
 * Helper to get directory entries, with error handling.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function safeReadDir(dir) {
    try {
        return await readdir(dir);
    } catch (err) {
        console.warn(
            `Error reading directory ${dir}:`,
            err && err.message ? err.message : err
        );
        return [];
    }
}

/**
 * Recursively find all empty directories under a given directory.
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} - Array of empty directory paths, each relative to ROOT_DIR
 */
async function findEmptyDirs(dir) {
    if (!(await isDirectory(dir))) return [];

    const entries = await safeReadDir(dir);
    if (entries.length === 0) {
        return [relative(ROOT_DIR, dir)];
    }

    let emptyDirs = [];
    let hasNonEmpty = false;

    for (const entry of entries) {
        const fullPath = join(dir, entry);
        if (await isDirectory(fullPath)) {
            const subEmpty = await findEmptyDirs(fullPath);
            emptyDirs = emptyDirs.concat(subEmpty);
            if (subEmpty.length === 0) {
                hasNonEmpty = true;
            }
        } else {
            hasNonEmpty = true;
        }
    }

    if (!hasNonEmpty) {
        emptyDirs.push(relative(ROOT_DIR, dir));
    }
    return emptyDirs;
}

async function main() {
    for (const target of TARGET_DIRS) {
        const absTarget = join(ROOT_DIR, target);
        try {
            const targetStat = await stat(absTarget);
            if (!targetStat.isDirectory()) continue;
        } catch {
            continue;
        }
        const emptyDirs = await findEmptyDirs(absTarget);
        if (emptyDirs.length > 0) {
            console.log(`Empty directories under '${target}':`);
            for (const d of emptyDirs) {
                console.log(d);
            }
        } else {
            console.log(`No empty directories found under '${target}'.`);
        }
    }
}
main().catch((err) => {
    console.error(
        "An error occurred while running the find-empty-dirs script:",
        err
    );
    process.exit(1);
});
