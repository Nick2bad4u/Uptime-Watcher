#!/usr/bin/env node
/**
 * Lightweight architecture guard checks.
 *
 * This script enforces a few core architectural invariants that are easy to
 * accidentally violate during refactors:
 *
 * 1. Direct `ipcMain.handle(...)` calls must live only in
 *    `electron/services/ipc/IpcService.ts`.
 * 2. Direct `window.electronAPI` usage must not appear outside of approved
 *    locations (tests and type definitions).
 * 3. Event names passed to `.emitTyped()` / `.onTyped()` / `.offTyped()` /
 *    `.onceTyped()` in production code must be defined in
 *    `electron/events/eventTypes.ts`.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const __dirname = import.meta.dirname;
const ROOT_DIRECTORY = path.resolve(__dirname, "..");

/**
 * Normalize paths for comparison.
 *
 * @param {string} filePath
 *
 * @returns {string}
 */
function toPosixPath(filePath) {
    return filePath.replaceAll("\\", "/");
}

/**
 * Recursively collect files under a directory, filtering by extension.
 *
 * @param {string} startDirectory
 * @param {readonly string[]} extensions
 *
 * @returns {Promise<string[]>}
 */
async function collectFiles(startDirectory, extensions) {
    const stack = [startDirectory];
    /** @type {string[]} */
    const results = [];

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            continue;
        }

        const entries = await readdir(current, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = path.join(current, entry.name);

            if (entry.isDirectory()) {
                stack.push(entryPath);
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            const lowerName = entry.name.toLowerCase();
            if (!extensions.some((ext) => lowerName.endsWith(ext))) {
                continue;
            }

            results.push(entryPath);
        }
    }

    return results;
}

/**
 * @param {string} filePath
 *
 * @returns {boolean}
 */
function isElectronTestFile(filePath) {
    const normalized = toPosixPath(filePath);
    return normalized.includes("/electron/test/");
}

/**
 * @param {string} filePath
 *
 * @returns {boolean}
 */
function isSrcTestFile(filePath) {
    const normalized = toPosixPath(filePath);
    return normalized.includes("/src/test/");
}

/**
 * Load the set of event names defined in electron/events/eventTypes.ts.
 *
 * @returns {Promise<Set<string>>}
 */
async function loadKnownEventNames() {
    const eventTypesPath = path.resolve(
        ROOT_DIRECTORY,
        "electron/events/eventTypes.ts"
    );
    const content = await readFile(eventTypesPath, "utf8");

    /** @type {Set<string>} */
    const names = new Set();

    const pattern = /"(?<name>[^"]+)":/g;
    let match;

    while ((match = pattern.exec(content)) !== null) {
        const groups = match.groups;
        const name = groups?.["name"];
        if (typeof name === "string") {
            names.add(name);
        }
    }

    return names;
}

/**
 * Ensure `ipcMain.handle` is only used from the central IpcService.
 *
 * @param {string[]} electronFiles
 *
 * @returns {Promise<string[]>}
 */
async function checkIpcMainUsage(electronFiles) {
    const allowedFiles = new Set([
        path.resolve(ROOT_DIRECTORY, "electron/services/ipc/IpcService.ts"),
        path.resolve(ROOT_DIRECTORY, "electron/services/ipc/utils.ts"),
    ]);

    /** @type {string[]} */
    const errors = [];

    for (const file of electronFiles) {
        if (isElectronTestFile(file)) {
            continue;
        }

        if (allowedFiles.has(path.resolve(file))) {
            continue;
        }

        const content = await readFile(file, "utf8");
        if (content.includes("ipcMain.handle(")) {
            const relative = toPosixPath(path.relative(ROOT_DIRECTORY, file));
            errors.push(
                `${relative}: direct ipcMain.handle(...) usage is forbidden outside electron/services/ipc/IpcService.ts.`
            );
        }
    }

    return errors;
}

/**
 * Ensure window.electronAPI usage is scoped to tests and explicit helpers.
 *
 * @param {string[]} srcFiles
 *
 * @returns {Promise<string[]>}
 */
async function checkWindowElectronApiUsage(srcFiles) {
    /** @type {Set<string>} */
    const allowedFiles = new Set([
        path.resolve(ROOT_DIRECTORY, "src/types/ipc.ts"),
        path.resolve(ROOT_DIRECTORY, "src/services/DataService.ts"),
        path.resolve(
            ROOT_DIRECTORY,
            "src/services/NotificationPreferenceService.ts"
        ),
        path.resolve(ROOT_DIRECTORY, "src/services/StateSyncService.ts"),
        path.resolve(
            ROOT_DIRECTORY,
            "src/services/utils/createIpcServiceHelpers.ts"
        ),
        path.resolve(
            ROOT_DIRECTORY,
            "src/services/utils/electronBridgeReadiness.ts"
        ),
    ]);

    /** @type {string[]} */
    const errors = [];

    for (const file of srcFiles) {
        if (isSrcTestFile(file)) {
            continue;
        }

        if (allowedFiles.has(path.resolve(file))) {
            continue;
        }

        const content = await readFile(file, "utf8");
        if (content.includes("window.electronAPI")) {
            const relative = toPosixPath(path.relative(ROOT_DIRECTORY, file));
            errors.push(
                `${relative}: direct window.electronAPI usage is restricted to tests and explicit helper/type-definition files.`
            );
        }
    }

    return errors;
}

/**
 * Ensure event names used with emitTyped/onTyped/offTyped/onceTyped exist in
 * electron/events/eventTypes.ts.
 *
 * @param {string[]} electronFiles
 * @param {Set<string>} knownEventNames
 *
 * @returns {Promise<string[]>}
 */
async function checkTypedEventUsage(electronFiles, knownEventNames) {
    /** @type {string[]} */
    const errors = [];

    const pattern =
        /\.(?:emitTyped|onTyped|offTyped|onceTyped)\("(?<event>[^"]+)"/g;

    for (const file of electronFiles) {
        if (isElectronTestFile(file)) {
            continue;
        }

        const resolvedPath = path.resolve(file);
        const typedEventBusPath = path.resolve(
            ROOT_DIRECTORY,
            "electron/events/TypedEventBus.ts"
        );
        if (resolvedPath === typedEventBusPath) {
            // TypedEventBus contains illustrative examples in TSDoc comments;
            // allow arbitrary event names there without enforcing mapping.
            continue;
        }

        const content = await readFile(file, "utf8");

        let match;
        while ((match = pattern.exec(content)) !== null) {
            const groups = match.groups;
            const eventName = groups?.["event"];
            if (typeof eventName !== "string") {
                continue;
            }

            if (!knownEventNames.has(eventName)) {
                const relative = toPosixPath(
                    path.relative(ROOT_DIRECTORY, file)
                );
                errors.push(
                    `${relative}: event '${eventName}' used with emitTyped/onTyped/offTyped/onceTyped is not defined in electron/events/eventTypes.ts.`
                );
            }
        }
    }

    return errors;
}

async function main() {
    const electronRoot = path.resolve(ROOT_DIRECTORY, "electron");
    const srcRoot = path.resolve(ROOT_DIRECTORY, "src");

    const [
        electronFiles,
        srcFiles,
        knownEventNames,
    ] = await Promise.all([
        collectFiles(electronRoot, [".ts"]),
        collectFiles(srcRoot, [".ts", ".tsx"]),
        loadKnownEventNames(),
    ]);

    const ipcMainErrors = await checkIpcMainUsage(electronFiles);
    const windowApiErrors = await checkWindowElectronApiUsage(srcFiles);
    const typedEventErrors = await checkTypedEventUsage(
        electronFiles,
        knownEventNames
    );

    /** @type {string[]} */
    const errors = [
        ...ipcMainErrors,
        ...windowApiErrors,
        ...typedEventErrors,
    ];

    if (errors.length > 0) {
        console.error("Architecture guard checks failed:\n");
        for (const message of errors) {
            console.error(`• ${message}`);
        }

        console.error(
            `\nTotal architecture guard violations: ${errors.length}.`
        );
        process.exit(1);
    }

    console.log(
        "Architecture guard checks passed – IPC and event usage match the expected patterns."
    );
}

try {
    await main();
} catch (error) {
    console.error(
        "Architecture guard checks failed due to an unexpected error."
    );
    console.error(error);
    process.exit(1);
}
