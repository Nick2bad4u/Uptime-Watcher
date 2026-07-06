#!/usr/bin/env node

/**
 * Circular dependency checker.
 *
 * Uses Madge's API so CI output reflects actual cycles instead of the CLI's
 * skipped-package warning summary for external dependencies.
 */

import madge from "madge";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const rootDirectory = path.resolve(import.meta.dirname, "..");

/**
 * Run the circular dependency check.
 *
 * @returns {Promise<boolean>} `true` when no circular dependencies are found.
 */
async function main() {
    const result = await madge(
        [
            "src/",
            "electron/",
            "shared/",
        ],
        {
            baseDir: rootDirectory,
            excludeRegExp: [
                /(?:^|[/\\])(?:test|dist|node_modules)(?:$|[/\\])/u,
                /\.css$/u,
            ],
            fileExtensions: [
                "ts",
                "tsx",
                "js",
                "jsx",
                "mjs",
                "cjs",
                "cts",
                "mts",
            ],
            tsConfig: path.join(rootDirectory, "tsconfig.json"),
        }
    );

    const circularDependencies = result.circular();

    if (circularDependencies.length > 0) {
        console.error("Circular dependencies found:");
        for (const circularDependency of circularDependencies) {
            console.error(`- ${circularDependency.join(" -> ")}`);
        }
        return false;
    }

    console.log("No circular dependency found.");
    return true;
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
    try {
        process.exitCode = (await main()) ? 0 : 1;
    } catch (error) {
        console.error("Circular dependency check failed:", error);
        process.exitCode = 1;
    }
}

export { isDirectRun, main };
