#!/usr/bin/env node
// @ts-check
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(
    fileURLToPath(new URL("..", import.meta.url))
);
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
const sortByLocale = (values) =>
    Array.from(values).toSorted((left, right) => left.localeCompare(right));

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
const toStringArray = (values) => values.map(String);

const main = async () => {
    const tsconfigRaw = await readFile(STORYBOOK_TSCONFIG_PATH, "utf8");

    let tsconfig;
    try {
        tsconfig = JSON.parse(tsconfigRaw);
    } catch (error) {
        const cause = error instanceof Error ? error : undefined;
        const normalizedMessage = (() => {
            if (cause && cause.message.trim()) {
                return cause.message;
            }

            const fallback = String(error).trim();
            return fallback || "Unknown Storybook tsconfig parsing error.";
        })();
        throw new Error(
            `Failed to parse Storybook tsconfig at ${STORYBOOK_TSCONFIG_PATH}: ${normalizedMessage}`,
            { cause: error }
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

        const details = parts.join("\n\n").trim();

        throw new Error(
            details || "Storybook tsconfig include glob mismatch detected.",
            {
                cause: {
                    missing,
                    unexpected,
                },
            }
        );
    }

    console.log("Storybook tsconfig include globs verified.");
};

try {
    await main();
} catch (error) {
    if (error instanceof Error) {
        const message = error.message.trim();
        const fallback = error.toString().trim();
        const finalMessage = message || fallback;

        console.error(
            finalMessage || "Unknown Storybook tsconfig verification error."
        );
        if (error.cause) {
            console.error("Cause:", error.cause);
        }
    } else {
        const fallback = String(error).trim();
        const finalMessage =
            fallback || "Unknown Storybook tsconfig verification error.";
        console.error(finalMessage);
    }
    process.exitCode = 1;
}
