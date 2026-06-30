#!/usr/bin/env node

/**
 * Circular dependency checker.
 *
 * Uses Madge's API so CI output reflects actual cycles instead of the CLI's
 * skipped-package warning summary for external dependencies.
 */

import madge from "madge";
import * as path from "node:path";

const rootDirectory = path.resolve(import.meta.dirname, "..");

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
    process.exitCode = 1;
} else {
    console.log("No circular dependency found.");
}
