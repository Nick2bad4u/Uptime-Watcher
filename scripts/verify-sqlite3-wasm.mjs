/**
 * Verify the lockfile-pinned SQLite WASM package artifact and the copies used
 * by build, development, and packaging flows.
 *
 * @global
 */

// @ts-check

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultWorkspaceRoot = path.resolve(__dirname, "..");

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_SIZE_BYTES = 1024;
const PACKAGE_LOCK_KEY = "node_modules/node-sqlite3-wasm";
const PACKAGE_NAME = "node-sqlite3-wasm";
const WASM_FILENAME = "node-sqlite3-wasm.wasm";
const WASM_MAGIC = Buffer.from([
    0x00,
    0x61,
    0x73,
    0x6d,
]);

/**
 * @typedef {{
 *     hash: string;
 *     path: string;
 *     size: number;
 * }} WasmFileInfo
 */

/**
 * @typedef {{
 *     integrity: string;
 *     resolved: string;
 *     version: string;
 * }} PinnedPackageInfo
 */

/**
 * @param {string} workspaceRoot
 */
function getArtifactPaths(workspaceRoot = defaultWorkspaceRoot) {
    const packageRoot = path.join(workspaceRoot, "node_modules", PACKAGE_NAME);

    return {
        assetPath: path.join(workspaceRoot, "assets", WASM_FILENAME),
        distPath: path.join(workspaceRoot, "dist", WASM_FILENAME),
        lockfilePath: path.join(workspaceRoot, "package-lock.json"),
        packageJsonPath: path.join(packageRoot, "package.json"),
        sourcePath: path.join(packageRoot, "dist", WASM_FILENAME),
    };
}

/**
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
    return typeof value === "object" && value !== null;
}

/**
 * @param {string} filePath
 *
 * @returns {Record<string, unknown>}
 */
function readJsonObject(filePath) {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!isRecord(parsed)) {
        throw new TypeError(`${filePath} must contain a JSON object`);
    }
    return parsed;
}

/**
 * Resolve and validate the exact installed package version recorded by npm. npm
 * verifies the tarball integrity while installing; this check prevents the
 * build scripts from silently using a different installed package afterward.
 *
 * @param {string} workspaceRoot
 *
 * @returns {PinnedPackageInfo}
 */
function getPinnedPackageInfo(workspaceRoot = defaultWorkspaceRoot) {
    const { lockfilePath, packageJsonPath } = getArtifactPaths(workspaceRoot);
    const lockfile = readJsonObject(lockfilePath);
    const packages = lockfile["packages"];
    if (!isRecord(packages)) {
        throw new Error(`${lockfilePath} does not contain a packages map`);
    }

    const lockEntry = packages[PACKAGE_LOCK_KEY];
    if (!isRecord(lockEntry)) {
        throw new Error(`${lockfilePath} does not pin ${PACKAGE_LOCK_KEY}`);
    }

    const integrity = lockEntry["integrity"];
    const resolved = lockEntry["resolved"];
    const version = lockEntry["version"];
    if (
        typeof version !== "string" ||
        version.length === 0 ||
        version.length > 128 ||
        version.trim() !== version ||
        [
            "^",
            "~",
            "*",
            "<",
            ">",
            "=",
            "||",
        ].some((rangeToken) => version.includes(rangeToken))
    ) {
        throw new Error(
            `${lockfilePath} does not contain an exact ${PACKAGE_NAME} version`
        );
    }
    if (typeof integrity !== "string" || !integrity.startsWith("sha512-")) {
        throw new Error(
            `${lockfilePath} does not contain a SHA-512 integrity for ${PACKAGE_NAME}@${version}`
        );
    }
    const encodedIntegrity = integrity.slice("sha512-".length);
    const integrityDigest = Buffer.from(encodedIntegrity, "base64");
    if (
        integrityDigest.length !== 64 ||
        integrityDigest.toString("base64") !== encodedIntegrity
    ) {
        throw new Error(
            `${lockfilePath} does not contain a SHA-512 integrity for ${PACKAGE_NAME}@${version}`
        );
    }
    if (typeof resolved !== "string") {
        throw new Error(
            `${lockfilePath} does not contain a resolved artifact for ${PACKAGE_NAME}@${version}`
        );
    }

    const resolvedUrl = new URL(resolved);
    const expectedSuffix = `/${PACKAGE_NAME}-${version}.tgz`;
    if (
        resolvedUrl.protocol !== "https:" ||
        !resolvedUrl.pathname.endsWith(expectedSuffix)
    ) {
        throw new Error(
            `${lockfilePath} resolves ${PACKAGE_NAME}@${version} to an unexpected artifact`
        );
    }

    const installedPackage = readJsonObject(packageJsonPath);
    if (
        installedPackage["name"] !== PACKAGE_NAME ||
        installedPackage["version"] !== version
    ) {
        throw new Error(
            `Installed ${PACKAGE_NAME} does not match lockfile version ${version}`
        );
    }

    return { integrity, resolved, version };
}

/**
 * @param {string} message
 */
function reportPass(message) {
    console.log(`[wasm-verify] OK: ${message}`);
}

/**
 * @param {string} message
 */
function reportFailure(message) {
    console.error(`[wasm-verify] ERROR: ${message}`);
}

/**
 * @param {string} filePath
 * @param {{ report?: boolean }} [options]
 *
 * @returns {WasmFileInfo | null}
 */
function inspectWasm(filePath, options = {}) {
    const { report = true } = options;
    if (!fs.existsSync(filePath)) {
        if (report) {
            reportFailure(`Missing ${filePath}`);
        }
        return null;
    }

    let buffer;
    try {
        buffer = fs.readFileSync(filePath);
    } catch (error) {
        if (report) {
            reportFailure(
                `Could not read ${filePath}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
        return null;
    }

    if (buffer.length < MIN_SIZE_BYTES) {
        if (report) {
            reportFailure(
                `${filePath} is unexpectedly small (${buffer.length} bytes)`
            );
        }
        return null;
    }
    if (buffer.length > MAX_SIZE_BYTES) {
        if (report) {
            reportFailure(
                `${filePath} exceeds ${MAX_SIZE_BYTES} bytes (${buffer.length} bytes)`
            );
        }
        return null;
    }
    if (!buffer.subarray(0, WASM_MAGIC.length).equals(WASM_MAGIC)) {
        if (report) {
            reportFailure(
                `${filePath} does not start with the WASM magic header`
            );
        }
        return null;
    }

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    if (report) {
        reportPass(`${filePath} (${buffer.length} bytes, sha256 ${hash})`);
    }
    return { hash, path: filePath, size: buffer.length };
}

/**
 * @param {WasmFileInfo[]} files
 *
 * @returns {boolean}
 */
function allHashesMatch(files) {
    const [firstFile] = files;
    if (!firstFile || files.length < 2) {
        return false;
    }

    const mismatchedFile = files.find((file) => file.hash !== firstFile.hash);
    if (!mismatchedFile) {
        return true;
    }

    reportFailure(
        `${mismatchedFile.path} does not match authoritative source ${firstFile.path}`
    );
    return false;
}

/**
 * @param {{ workspaceRoot?: string }} [options]
 *
 * @returns {boolean} `true` when required SQLite WASM artifacts are valid.
 */
function verifySqliteWasmArtifacts(options = {}) {
    const workspaceRoot = options.workspaceRoot ?? defaultWorkspaceRoot;
    const paths = getArtifactPaths(workspaceRoot);

    let pinnedPackage;
    try {
        pinnedPackage = getPinnedPackageInfo(workspaceRoot);
    } catch (error) {
        reportFailure(error instanceof Error ? error.message : String(error));
        return false;
    }
    reportPass(
        `${PACKAGE_NAME}@${pinnedPackage.version} matches package-lock.json`
    );

    const results = [
        paths.sourcePath,
        paths.assetPath,
        paths.distPath,
    ].map((filePath) => inspectWasm(filePath));
    if (results.some((result) => result === null)) {
        return false;
    }

    const validResults = /** @type {WasmFileInfo[]} */ (results);
    if (!allHashesMatch(validResults)) {
        return false;
    }

    reportPass("SQLite WASM source, asset, and dist copies match");
    return true;
}

/**
 * @returns {number} Process exit status.
 */
function main() {
    return verifySqliteWasmArtifacts() ? 0 : 1;
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
    process.exitCode = main();
}

export {
    allHashesMatch,
    getArtifactPaths,
    getPinnedPackageInfo,
    inspectWasm,
    isDirectRun,
    main,
    verifySqliteWasmArtifacts,
};
