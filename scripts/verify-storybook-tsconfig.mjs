#!/usr/bin/env node
// @ts-check
import { readFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const STORYBOOK_TSCONFIG_PATH = path.resolve(
    PROJECT_ROOT,
    "storybook/tsconfig.json"
);

const ALLOWED_INCLUDE_GLOBS = [
    "./**/*.ts",
    "./**/*.tsx",
    "../src/**/*.ts",
    "../src/**/*.tsx",
    "../shared/**/*.ts",
    "../shared/**/*.tsx",
];

/**
 * Sorts a string array using locale-aware comparison.
 *
 * @param {readonly string[]} values - Values to sort.
 *
 * @returns {string[]} Sorted values.
 */
const sortByLocale = (values) => [...values].sort((left, right) => {
    if (left === right) {
        return 0;
    }

    return left.localeCompare(right);
});

/**
 * Creates a newline-separated bullet list.
 *
 * @param {readonly string[]} values - Values to format.
 *
 * @returns {string} Bullet list string.
 */
const stringifyList = (values) =>
    values.map((value) => `  - ${value}`).join("\n");

/**
 * Converts an unknown array into an array of strings.
 *
 * @param {readonly unknown[]} values - Values to convert.
 *
 * @returns {string[]} Normalized strings.
 */
const toStringArray = (values) => values.map((value) => String(value));

const main = async () => {
    const tsconfigRaw = await readFile(STORYBOOK_TSCONFIG_PATH, "utf8");

    let tsconfig;
    try {
        tsconfig = JSON.parse(tsconfigRaw);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : String(error);
        throw new Error(
            `Failed to parse Storybook tsconfig at ${STORYBOOK_TSCONFIG_PATH}: ${message}`
        );
    }

    /** @type {string[]} */
    const includes = Array.isArray(tsconfig.include)
        ? toStringArray(tsconfig.include)
        : [];

    if (includes.length === 0) {
        throw new Error(
            `storybook/tsconfig.json must declare an include array matching:\n${stringifyList(ALLOWED_INCLUDE_GLOBS)}`
        );
    }

    const unexpected = includes.filter(
        (pattern) => !ALLOWED_INCLUDE_GLOBS.includes(pattern)
    );
    const missing = ALLOWED_INCLUDE_GLOBS.filter(
        (pattern) => !includes.includes(pattern)
    );

    if (unexpected.length > 0 || missing.length > 0) {
        const parts = [];

        if (unexpected.length > 0) {
            parts.push(
                `Found disallowed Storybook tsconfig include globs:\n${stringifyList(sortByLocale(unexpected))}`
            );
        }

        if (missing.length > 0) {
            parts.push(
                `Missing required Storybook tsconfig include globs:\n${stringifyList(sortByLocale(missing))}`
            );
        }

        parts.push(
            `Allowed include globs:\n${stringifyList(ALLOWED_INCLUDE_GLOBS)}`
        );

        throw new Error(parts.join("\n\n"));
    }

    console.log("Storybook tsconfig include globs verified.");
};

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
