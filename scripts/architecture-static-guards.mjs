#!/usr/bin/env node

/**
 * Lightweight architecture guard checks.
 *
 * This script enforces a few core architectural invariants that are easy to
 * accidentally violate during refactors:
 *
 * 1. Direct `ipcMain.handle(...)` calls must live only in the centralized IPC
 *    registration layer (`electron/services/ipc/IpcService.ts` and its shared
 *    helper module `electron/services/ipc/utils.ts`).
 * 2. Direct `ipcRenderer` imports from the `electron` package are forbidden in
 *    `src/**` (excluding tests). Renderer code must always go through the typed
 *    preload bridge (`window.electronAPI`) and renderer services rather than
 *    talking to Electron primitives directly.
 * 3. Direct `window.electronAPI` usage must not appear outside of approved
 *    locations (tests and explicit helper/type-definition files).
 * 4. Event names passed to `.emitTyped()` / `.onTyped()` / `.offTyped()` /
 *    `.onceTyped()` in production code must be defined in the event catalogue
 *    (`electron/events/eventTypes.ts` and
 *    `electron/events/eventTypes.catalogue.*.ts`).
 */

import { readFile, readdir } from "node:fs/promises";
import * as path from "node:path";
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
    const eventsDirectory = path.resolve(ROOT_DIRECTORY, "electron/events");

    const baseEventTypesPath = path.resolve(eventsDirectory, "eventTypes.ts");

    const entries = await readdir(eventsDirectory, { withFileTypes: true });
    const partFiles = entries
        .filter((entry) => {
            if (!entry.isFile()) {
                return false;
            }

            return /^eventTypes\.catalogue\..+\.ts$/u.test(entry.name);
        })
        .map((entry) => path.resolve(eventsDirectory, entry.name))
        .toSorted();

    const contentByFile = await Promise.all(
        [baseEventTypesPath, ...partFiles].map((filePath) =>
            readFile(filePath, "utf8")
        )
    );

    /** @type {Set<string>} */
    const names = new Set();

    const pattern = /"(?<name>[^"]+)":/g;

    for (const content of contentByFile) {
        pattern.lastIndex = 0;
        let match;

        while ((match = pattern.exec(content)) !== null) {
            const groups = match.groups;
            const name = groups?.["name"];
            if (typeof name === "string") {
                names.add(name);
            }
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
                `${relative}: direct ipcMain.handle(...) usage is forbidden outside electron/services/ipc/IpcService.ts and electron/services/ipc/utils.ts.`
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
 * Ensure `ipcRenderer` is not imported directly from Electron in src/**.
 *
 * @param {string[]} srcFiles
 *
 * @returns {Promise<string[]>}
 */
async function checkIpcRendererImportsInSrc(srcFiles) {
    /** @type {string[]} */
    const errors = [];

    const importPattern =
        /import\s+{[^}]*\bipcRenderer\b[^}]*}\s+from\s+["']electron["']/;
    const requirePattern =
        /(?:const|let|var)\s+{[^}]*\bipcRenderer\b[^}]*}\s*=\s*require\(["']electron["']\)/;

    for (const file of srcFiles) {
        if (isSrcTestFile(file)) {
            continue;
        }

        const content = await readFile(file, "utf8");

        if (importPattern.test(content) || requirePattern.test(content)) {
            const relative = toPosixPath(path.relative(ROOT_DIRECTORY, file));
            errors.push(
                `${relative}: direct ipcRenderer imports from 'electron' are forbidden in src/**. Use the typed preload bridge (window.electronAPI) via renderer services instead.`
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

/**
 * Ensure URL opening stays centralized.
 *
 * @param electronFiles
 * @remarks
 * Direct `shell.openExternal()` calls are easy to sprinkle around the codebase
 * and can accidentally bypass URL validation/allowlisting.
 */
async function checkElectronShellUsage(electronFiles) {
    const allowedFiles = new Set([
        path.resolve(
            ROOT_DIRECTORY,
            "electron/services/shell/openExternalUtils.ts"
        ),
    ]);

    /** @type {string[]} */
    const errors = [];

    const importsShellPattern =
        /import\s+{[^}]*\bshell\b[^}]*}\s+from\s+["']electron["']/;

    for (const file of electronFiles) {
        if (isElectronTestFile(file)) {
            continue;
        }

        if (allowedFiles.has(path.resolve(file))) {
            continue;
        }

        const content = await readFile(file, "utf8");
        if (importsShellPattern.test(content) || content.includes("shell.openExternal(")) {
            const relative = toPosixPath(path.relative(ROOT_DIRECTORY, file));
            errors.push(
                `${relative}: direct Electron shell usage is restricted. Use electron/services/shell/openExternalUtils.ts to open external URLs safely.`
            );
        }
    }

    return errors;
}

/**
 * Ensure window-open handling stays centralized.
 *
 * @param electronFiles
 * @remarks
 * `webContents.setWindowOpenHandler(...)` is a security-sensitive choke point.
 */
async function checkWindowOpenHandlerUsage(electronFiles) {
    const allowedFiles = new Set([
        path.resolve(ROOT_DIRECTORY, "electron/services/window/WindowService.ts"),
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
        if (content.includes("setWindowOpenHandler(")) {
            const relative = toPosixPath(path.relative(ROOT_DIRECTORY, file));
            errors.push(
                `${relative}: setWindowOpenHandler() must be configured only in electron/services/window/WindowService.ts.`
            );
        }
    }

    return errors;
}

/**
 * Ensure every declared IPC invoke channel is implemented/registered.
 *
 * @remarks
 * The shared contract for invoke channels lives in `shared/types/ipc.ts`.
 * Handlers should be registered via the ipc handler modules under
 * `electron/services/ipc/handlers/**`.
 *
 * This guard prevents drift where a new invoke channel is added to the shared
 * types but nobody implements/registers it on the main process side.
 */
async function checkInvokeChannelCoverage() {
    const ipcTypesPath = path.resolve(ROOT_DIRECTORY, "shared/types/ipc.ts");
    const preloadTypesPath = path.resolve(
        ROOT_DIRECTORY,
        "shared/types/preload.ts"
    );
    const handlersRoot = path.resolve(
        ROOT_DIRECTORY,
        "electron/services/ipc/handlers"
    );

    /** @type {string[]} */
    const errors = [];

    const [ipcTypesContent, preloadContent, handlerFiles] = await Promise.all([
        readFile(ipcTypesPath, "utf8"),
        readFile(preloadTypesPath, "utf8"),
        collectFiles(handlersRoot, [".ts"]),
    ]);

    // 1) Extract declared invoke channels from shared/types/ipc.ts.
    const invokeMapStart = ipcTypesContent.indexOf(
        "export interface IpcInvokeChannelMap"
    );
    if (invokeMapStart === -1) {
        errors.push(
            "shared/types/ipc.ts: could not locate export interface IpcInvokeChannelMap"
        );
        return errors;
    }

    const invokeMapSlice = ipcTypesContent.slice(invokeMapStart);
    const declaredChannels = new Set();
    for (const match of invokeMapSlice.matchAll(
        /^\s*"(?<channel>[^"]+)"\s*:\s*{/gm
    )) {
        if (match.groups?.channel) {
            declaredChannels.add(match.groups.channel);
        }
    }

    if (declaredChannels.size === 0) {
        errors.push(
            "shared/types/ipc.ts: failed to extract invoke channels from IpcInvokeChannelMap (0 found)"
        );
        return errors;
    }

    // 2) Build a mapping from *_CHANNELS.<prop> -> channel string by parsing
    // shared/types/preload.ts channel definition objects.
    /** @type {Map<string, Map<string, string>>} */
    const channelObjects = new Map();

    const definitionHeader =
        /const\s+(?<prefix>[\dA-Z_]+)_CHANNELS_DEFINITION\b[^=]*=\s*{/g;
    for (const headerMatch of preloadContent.matchAll(definitionHeader)) {
        const prefix = headerMatch.groups?.prefix;
        if (!prefix) {
            continue;
        }
        const objectName = `${prefix}_CHANNELS`;
        const startIndex = headerMatch.index + headerMatch[0].length;

        // Parse the object literal content by scanning braces.
        let depth = 1;
        let index = startIndex;
        for (; index < preloadContent.length; index++) {
            const char = preloadContent[index];
            if (char === "{") {
                depth += 1;
            } else if (char === "}") {
                depth -= 1;
                if (depth === 0) {
                    break;
                }
            }
        }

        const objectBody = preloadContent.slice(startIndex, index);
        /** @type {Map<string, string>} */
        const propToChannel = new Map();

        for (const entryMatch of objectBody.matchAll(
            /^\s*(?<key>\w+)\s*:\s*"(?<channel>[^"]+)"\s*,?\s*$/gm
        )) {
            const key = entryMatch.groups?.key;
            const channel = entryMatch.groups?.channel;
            if (!key || !channel) {
                continue;
            }

            propToChannel.set(key, channel);
        }

        channelObjects.set(objectName, propToChannel);
    }

    if (channelObjects.size === 0) {
        errors.push(
            "shared/types/preload.ts: failed to extract *_CHANNELS_DEFINITION objects (0 found)"
        );
        return errors;
    }

    const preloadChannels = new Set();
    for (const propToChannel of channelObjects.values()) {
        for (const channel of propToChannel.values()) {
            preloadChannels.add(channel);
        }
    }

    // 3) Extract referenced channels in handler modules.
    const referencedChannels = new Set();
    for (const file of handlerFiles) {
        const content = await readFile(file, "utf8");

        for (const [objectName, propToChannel] of channelObjects.entries()) {
            const usagePattern = new RegExp(
                String.raw`\b${objectName}\.(?<prop>[A-Za-z0-9_]+)\b`,
                "g"
            );

            for (const usageMatch of content.matchAll(usagePattern)) {
                const prop = usageMatch.groups?.prop;
                if (!prop) {
                    continue;
                }
                const channel = propToChannel.get(prop);
                if (!channel) {
                    const relative = toPosixPath(
                        path.relative(ROOT_DIRECTORY, file)
                    );
                    errors.push(
                        `${relative}: references ${objectName}.${prop}, but ${objectName}_DEFINITION does not define that key.`
                    );
                    continue;
                }

                referencedChannels.add(channel);
            }
        }
    }

    // 4) Compare: declared channels must exist in preload constants and be referenced by handlers.
    for (const declared of declaredChannels) {
        if (!preloadChannels.has(declared)) {
            errors.push(
                `IPC invoke channel missing from preload channel constants (shared/types/preload.ts): ${declared}`
            );
            continue;
        }

        if (!referencedChannels.has(declared)) {
            errors.push(
                `IPC invoke channel missing handler registration: ${declared}`
            );
        }
    }

    // Also detect preload constants referencing unknown channels.
    for (const channel of preloadChannels) {
        if (!declaredChannels.has(channel)) {
            errors.push(
                `IPC preload channel constant refers to unknown invoke channel (not in shared/types/ipc.ts): ${channel}`
            );
        }
    }

    // Also detect handler references to unknown channels (helps catch typos or stale channels).
    for (const referenced of referencedChannels) {
        if (!declaredChannels.has(referenced)) {
            errors.push(
                `IPC handler references unknown invoke channel (not in shared/types/ipc.ts): ${referenced}`
            );
        }
    }

    return errors;
}

/**
 *
 */
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
    const ipcRendererImportErrors =
        await checkIpcRendererImportsInSrc(srcFiles);
    const typedEventErrors = await checkTypedEventUsage(
        electronFiles,
        knownEventNames
    );
    const shellUsageErrors = await checkElectronShellUsage(electronFiles);
    const windowOpenHandlerErrors =
        await checkWindowOpenHandlerUsage(electronFiles);
    const invokeChannelCoverageErrors = await checkInvokeChannelCoverage();

    /** @type {string[]} */
    const errors = [
        ...ipcMainErrors,
        ...windowApiErrors,
        ...ipcRendererImportErrors,
        ...typedEventErrors,
        ...shellUsageErrors,
        ...windowOpenHandlerErrors,
        ...invokeChannelCoverageErrors,
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
