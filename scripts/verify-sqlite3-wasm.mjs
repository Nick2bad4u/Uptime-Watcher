/**
 * Verify the local SQLite WASM artifacts used by build, dev, and packaging
 * flows.
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
const workspaceRoot = path.resolve(__dirname, "..");

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_SIZE_BYTES = 1024;
const WASM_MAGIC = Buffer.from([
    0x00,
    0x61,
    0x73,
    0x6d,
]);

const assetPath = path.join(workspaceRoot, "assets", "node-sqlite3-wasm.wasm");
const distPath = path.join(workspaceRoot, "dist", "node-sqlite3-wasm.wasm");
const packagePath = path.join(
    workspaceRoot,
    "node_modules",
    "node-sqlite3-wasm",
    "dist",
    "node-sqlite3-wasm.wasm"
);
const versionPath = path.join(workspaceRoot, "assets", ".wasm-version");

/**
 * @typedef {{
 *     hash: string;
 *     path: string;
 *     size: number;
 * }} WasmFileInfo
 */

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
 *
 * @returns {WasmFileInfo | null}
 */
function inspectWasm(filePath) {
    if (!fs.existsSync(filePath)) {
        reportFailure(`Missing ${filePath}`);
        return null;
    }

    const buffer = fs.readFileSync(filePath);
    if (buffer.length < MIN_SIZE_BYTES) {
        reportFailure(
            `${filePath} is unexpectedly small (${buffer.length} bytes)`
        );
        return null;
    }

    if (buffer.length > MAX_SIZE_BYTES) {
        reportFailure(
            `${filePath} exceeds ${MAX_SIZE_BYTES} bytes (${buffer.length} bytes)`
        );
        return null;
    }

    if (!buffer.subarray(0, WASM_MAGIC.length).equals(WASM_MAGIC)) {
        reportFailure(`${filePath} does not start with the WASM magic header`);
        return null;
    }

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    reportPass(`${filePath} (${buffer.length} bytes, sha256 ${hash})`);
    return {
        hash,
        path: filePath,
        size: buffer.length,
    };
}

/**
 * @param {WasmFileInfo[]} files
 *
 * @returns {boolean}
 */
function allHashesMatch(files) {
    const [firstFile] = files;
    if (!firstFile) {
        return false;
    }

    const mismatchedFile = files.find((file) => file.hash !== firstFile.hash);
    if (!mismatchedFile) {
        reportPass("Bundled WASM copies have matching SHA256 hashes");
        return true;
    }

    reportFailure(
        `${mismatchedFile.path} hash ${mismatchedFile.hash} does not match ${firstFile.path} hash ${firstFile.hash}`
    );
    return false;
}

/**
 * @returns {boolean}
 */
function verifyVersionFile() {
    if (!fs.existsSync(versionPath)) {
        reportFailure(`Missing ${versionPath}`);
        return false;
    }

    const version = fs.readFileSync(versionPath, "utf8").trim();
    if (!/^[\da-f]{7,40}$/iu.test(version)) {
        reportFailure(`${versionPath} does not contain a commit-like hash`);
        return false;
    }

    reportPass(`${versionPath} contains version ${version}`);
    return true;
}

const bundledFiles = [assetPath, distPath];
const optionalFiles = [packagePath];

/**
 * @returns {boolean} `true` when required SQLite WASM artifacts are valid.
 */
function verifySqliteWasmArtifacts() {
    const bundledResults = bundledFiles.map((filePath) =>
        inspectWasm(filePath)
    );
    const optionalResults = optionalFiles
        .filter((filePath) => fs.existsSync(filePath))
        .map((filePath) => inspectWasm(filePath));

    if (optionalResults.length > 0) {
        reportPass(
            "Optional package WASM copy is present and structurally valid"
        );
    }

    const bundledFilesValid = bundledResults.every((result) => result !== null);
    const versionValid = verifyVersionFile();
    const hashesValid = allHashesMatch(
        bundledResults.filter((result) => result !== null)
    );

    if (!bundledFilesValid || !versionValid || !hashesValid) {
        return false;
    }

    reportPass("SQLite WASM artifacts are valid");
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
    inspectWasm,
    isDirectRun,
    main,
    verifySqliteWasmArtifacts,
    verifyVersionFile,
};
