#!/usr/bin/env node

/**
 * Custom ESLint rule documentation checker.
 *
 * Ensures every uptime-watcher rule has a rule doc and fixture-backed test.
 */
/* eslint-disable jsdoc/require-jsdoc -- Internal CLI helpers are scoped to this script. */

import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const rootDirectory = path.resolve(import.meta.dirname, "..");
const docsDirectory = path.join(
    rootDirectory,
    "config/linting/plugins/uptime-watcher/docs/rules"
);
const testsDirectory = path.join(
    rootDirectory,
    "config/linting/plugins/uptime-watcher/test"
);

const harnessTests = new Set(["configs", "docs-integrity"]);

function addError(errors, message) {
    errors.push(message);
}

async function getRuleDocNames() {
    const entries = await readdir(docsDirectory, {
        withFileTypes: true,
    });

    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => path.basename(entry.name, ".md"))
        .toSorted();
}

async function getRuleTestNames() {
    const entries = await readdir(testsDirectory, {
        withFileTypes: true,
    });

    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".test.ts"))
        .map((entry) => path.basename(entry.name, ".test.ts"))
        .toSorted();
}

async function validateRuleDoc(ruleName, errors) {
    const relativeDocPath = `config/linting/plugins/uptime-watcher/docs/rules/${ruleName}.md`;
    const content = await readFile(
        path.join(rootDirectory, relativeDocPath),
        "utf8"
    );

    if (!content.startsWith("# ")) {
        addError(
            errors,
            `${relativeDocPath} must start with an H1 rule title.`
        );
    }

    if (!content.includes("##")) {
        addError(
            errors,
            `${relativeDocPath} must document rule behavior beyond a title.`
        );
    }
}

async function main() {
    const errors = [];
    const ruleDocs = await getRuleDocNames();
    const ruleTests = await getRuleTestNames();
    const ruleDocSet = new Set(ruleDocs);
    const ruleTestSet = new Set(ruleTests);

    for (const ruleName of ruleDocs) {
        if (!ruleTestSet.has(ruleName)) {
            addError(
                errors,
                `Missing fixture-backed test for uptime-watcher/${ruleName}. Expected config/linting/plugins/uptime-watcher/test/${ruleName}.test.ts.`
            );
        }

        await validateRuleDoc(ruleName, errors);
    }

    for (const testName of ruleTests) {
        if (!ruleDocSet.has(testName) && !harnessTests.has(testName)) {
            addError(
                errors,
                `Test ${testName}.test.ts has no matching rule doc. Add a docs/rules/${testName}.md file or list it as a harness test.`
            );
        }
    }

    if (errors.length > 0) {
        console.error("Custom ESLint rule docs check failed:");
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        return false;
    }

    console.log(
        `Custom ESLint rule docs/tests aligned: ${ruleDocs.length} rules, ${harnessTests.size} harness tests.`
    );
    return true;
}

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
        console.error(
            "Custom ESLint rule docs check failed due to an unexpected error."
        );
        console.error(error);
        process.exitCode = 1;
    }
}

export { isDirectRun, main };

/* eslint-enable jsdoc/require-jsdoc */
