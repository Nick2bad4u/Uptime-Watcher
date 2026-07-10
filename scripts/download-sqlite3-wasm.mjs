/**
 * Synchronize SQLite WASM build artifacts from the exact node-sqlite3-wasm
 * package installed through package-lock.json.
 *
 * @global
 */

// @ts-check

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
    getArtifactPaths,
    getPinnedPackageInfo,
    inspectWasm,
} from "./verify-sqlite3-wasm.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultWorkspaceRoot = path.resolve(__dirname, "..");

/**
 * @typedef {import("./verify-sqlite3-wasm.mjs").WasmFileInfo} WasmFileInfo
 */

/**
 * @typedef {{
 *     copyFileSync?: typeof fs.copyFileSync;
 *     forceDownload?: boolean;
 *     renameSync?: typeof fs.renameSync;
 *     workspaceRoot?: string;
 * }} SynchronizeOptions
 */

/**
 * @typedef {{
 *     targetPath: string;
 *     temporaryPath: string;
 * }} StagedArtifact
 */

/**
 * Parse command-line options.
 *
 * @param {string[]} args
 */
function parseArgs(args) {
    const options = {
        checkUpdateOnly: false,
        forceDownload: false,
        help: false,
        noUpdate: false,
    };

    for (const arg of args) {
        switch (arg) {
            case "--check-update": {
                options.checkUpdateOnly = true;
                break;
            }
            case "--force": {
                options.forceDownload = true;
                break;
            }
            case "--help":
            case "-h": {
                options.help = true;
                break;
            }
            case "--no-update": {
                options.noUpdate = true;
                break;
            }
            default: {
                throw new Error(`Unknown option: ${arg}`);
            }
        }
    }

    if (
        options.checkUpdateOnly &&
        (options.forceDownload || options.noUpdate)
    ) {
        throw new Error(
            "--check-update cannot be combined with --force or --no-update"
        );
    }

    return options;
}

/**
 * @returns {void}
 */
function showHelp() {
    console.log(`
Synchronize the SQLite WASM artifact from the lockfile-pinned installed package.

Usage: node scripts/download-sqlite3-wasm.mjs [options]

Options:
  --check-update  Check whether asset and dist copies match the package source
  --force         Revalidate and replace both copies even when they already match
  --no-update     Synchronize without any external network access (compatibility alias)
  --help, -h      Show this help
`);
}

/**
 * @param {unknown} error
 *
 * @returns {string}
 */
function getErrorMessage(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.replaceAll(/[\r\n\u2028\u2029]/gu, " ");
}

/**
 * @param {string} message
 *
 * @returns {false}
 */
function reportFailure(message) {
    console.error(`[wasm-sync] ERROR: ${getErrorMessage(message)}`);
    return false;
}

/**
 * @param {string} temporaryPath
 */
function removeTemporaryFile(temporaryPath) {
    try {
        fs.rmSync(temporaryPath, { force: true });
    } catch {
        // Best effort only; the target is never removed during cleanup.
    }
}

/**
 * Copy and validate an artifact in the target directory without touching the
 * existing target.
 *
 * @param {WasmFileInfo} source
 * @param {string} targetPath
 * @param {typeof fs.copyFileSync} copyFileSync
 *
 * @returns {StagedArtifact}
 */
function stageValidatedArtifact(
    source,
    targetPath,
    copyFileSync = fs.copyFileSync
) {
    const targetDirectory = path.dirname(targetPath);
    fs.mkdirSync(targetDirectory, { recursive: true });
    const temporaryPath = path.join(
        targetDirectory,
        `.${path.basename(targetPath)}.${process.pid}.${crypto.randomUUID()}.tmp`
    );

    try {
        copyFileSync(source.path, temporaryPath);
        const staged = inspectWasm(temporaryPath, { report: false });
        if (
            !staged ||
            staged.hash !== source.hash ||
            staged.size !== source.size
        ) {
            throw new Error(
                `Staged artifact for ${targetPath} does not match ${source.path}`
            );
        }
        return { targetPath, temporaryPath };
    } catch (error) {
        removeTemporaryFile(temporaryPath);
        throw error;
    }
}

/**
 * @param {StagedArtifact[]} stagedArtifacts
 */
function cleanupStagedArtifacts(stagedArtifacts) {
    for (const staged of stagedArtifacts) {
        removeTemporaryFile(staged.temporaryPath);
    }
}

/**
 * @param {string} targetPath
 * @param {WasmFileInfo} source
 *
 * @returns {boolean}
 */
function targetMatchesSource(targetPath, source) {
    const target = inspectWasm(targetPath, { report: false });
    return Boolean(
        target && target.hash === source.hash && target.size === source.size
    );
}

/**
 * Synchronize asset and dist copies from the validated package source. All
 * required temporary copies are validated before the first target is replaced.
 *
 * @param {SynchronizeOptions} [options]
 *
 * @returns {{ changed: boolean; version: string }}
 */
function synchronizeWasmArtifacts(options = {}) {
    const workspaceRoot = options.workspaceRoot ?? defaultWorkspaceRoot;
    const copyFileSync = options.copyFileSync ?? fs.copyFileSync;
    const renameSync = options.renameSync ?? fs.renameSync;
    const paths = getArtifactPaths(workspaceRoot);
    const pinnedPackage = getPinnedPackageInfo(workspaceRoot);
    const source = inspectWasm(paths.sourcePath, { report: false });
    if (!source) {
        throw new Error(
            `Lockfile-pinned package artifact is not valid WASM: ${paths.sourcePath}`
        );
    }

    const targets = [paths.assetPath, paths.distPath];
    const targetsToReplace = targets.filter(
        (targetPath) =>
            options.forceDownload || !targetMatchesSource(targetPath, source)
    );
    if (targetsToReplace.length === 0) {
        console.log(
            `[wasm-sync] Asset and dist already match ${paths.sourcePath}`
        );
        return { changed: false, version: pinnedPackage.version };
    }

    /** @type {StagedArtifact[]} */
    const stagedArtifacts = [];
    try {
        for (const targetPath of targetsToReplace) {
            stagedArtifacts.push(
                stageValidatedArtifact(source, targetPath, copyFileSync)
            );
        }

        for (const staged of stagedArtifacts) {
            renameSync(staged.temporaryPath, staged.targetPath);
            console.log(
                `[wasm-sync] Replaced ${staged.targetPath} from ${paths.sourcePath}`
            );
        }
    } finally {
        cleanupStagedArtifacts(stagedArtifacts);
    }

    return { changed: true, version: pinnedPackage.version };
}

/**
 * @param {string} workspaceRoot
 *
 * @returns {{ hasUpdate: boolean; version: string }}
 */
function checkForUpdates(workspaceRoot = defaultWorkspaceRoot) {
    const paths = getArtifactPaths(workspaceRoot);
    const pinnedPackage = getPinnedPackageInfo(workspaceRoot);
    const source = inspectWasm(paths.sourcePath, { report: false });
    if (!source) {
        throw new Error(
            `Lockfile-pinned package artifact is not valid WASM: ${paths.sourcePath}`
        );
    }

    return {
        hasUpdate:
            !targetMatchesSource(paths.assetPath, source) ||
            !targetMatchesSource(paths.distPath, source),
        version: pinnedPackage.version,
    };
}

/**
 * Compatibility wrapper retained for callers that used the previous helper.
 *
 * @param {SynchronizeOptions} [options]
 *
 * @returns {boolean}
 */
function ensureLocalWasmAvailable(options = {}) {
    try {
        synchronizeWasmArtifacts(options);
        return true;
    } catch (error) {
        reportFailure(getErrorMessage(error));
        return false;
    }
}

/**
 * @param {ReturnType<typeof parseArgs>} options
 * @param {SynchronizeOptions} [synchronizeOptions]
 *
 * @returns {Promise<boolean>}
 */
async function main(
    options = parseArgs(process.argv.slice(2)),
    synchronizeOptions = {}
) {
    if (options.help) {
        showHelp();
        return true;
    }

    try {
        if (options.checkUpdateOnly) {
            const result = checkForUpdates(synchronizeOptions.workspaceRoot);
            console.log(
                result.hasUpdate
                    ? `[wasm-sync] Local copies do not match ${result.version}; run npm run copy-wasm`
                    : `[wasm-sync] Local copies match ${result.version}`
            );
            return true;
        }

        const result = synchronizeWasmArtifacts({
            ...synchronizeOptions,
            forceDownload:
                synchronizeOptions.forceDownload ?? options.forceDownload,
        });
        console.log(
            `[wasm-sync] SQLite WASM synchronization complete (${result.version})`
        );
        return true;
    } catch (error) {
        return reportFailure(getErrorMessage(error));
    }
}

/**
 * @returns {boolean}
 */
function isDirectInvocation() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectInvocation()) {
    main()
        .then((isSuccess) => {
            process.exitCode = isSuccess ? 0 : 1;
        })
        .catch((error) => {
            reportFailure(getErrorMessage(error));
            process.exitCode = 1;
        });
}

export {
    checkForUpdates,
    ensureLocalWasmAvailable,
    isDirectInvocation,
    main,
    parseArgs,
    stageValidatedArtifact,
    synchronizeWasmArtifacts,
};
