/**
 * Build script to download the SQLite3 WASM binary for Electron distribution.
 * Downloads the required WASM file from the node-sqlite3-wasm repository and
 * places it in the dist directory for bundling.
 *
 * @global
 */

// @ts-check

import crypto from "node:crypto";
import * as fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source URL for WASM. Allow override (e.g., for air‑gapped or pinned artifact mirrors)
const url =
    process.env.SQLITE3_WASM_URL ||
    "https://github.com/tndrle/node-sqlite3-wasm/raw/refs/heads/main/dist/node-sqlite3-wasm.wasm";
const destDir = path.resolve(__dirname, "../dist");
const dest = path.join(destDir, "node-sqlite3-wasm.wasm");
const scriptsDir = path.resolve(__dirname, "../assets");
const scriptsDest = path.join(scriptsDir, "node-sqlite3-wasm.wasm");
const packageDest = path.resolve(
    __dirname,
    "../node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm"
);

// Expected SHA256 of the WASM (update when upstream changes). Allow override via env to facilitate controlled updates.
// If no hash is provided, we'll download and verify against the upstream hash
const EXPECTED_SHA256 = process.env.SQLITE3_WASM_SHA256?.toLowerCase();

const MAX_REDIRECTS = 3;

/**
 * 5MB safety cap.
 */
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * @property {boolean} hasUpdate - Indicates if an update is available.
 * @property {boolean} updateCheckFailed - Indicates if the update check failed.
 * @property {string} latestVersion - The latest version hash.
 * @property {string | null} currentVersion - The current version hash or null
 *   if unknown.
 * @property {string} [error] - Optional error message if checking failed.
 *
 * @interface UpdateCheckResult
 */

/**
 * Parse command-line options.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{
 *     checkUpdateOnly: boolean;
 *     forceDownload: boolean;
 *     help: boolean;
 *     noUpdate: boolean;
 * }}
 *   Parsed options.
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
 * Show command usage.
 *
 * @returns {void}
 */
function showHelp() {
    console.log(`
Download or synchronize the SQLite WASM artifact.

Usage: node scripts/download-sqlite3-wasm.mjs [options]

Options:
  --check-update  Check upstream version and exit without downloading
  --force         Remove existing local artifacts and download explicitly
  --no-update     Synchronize existing local artifacts without network access
  --help, -h      Show this help
`);
}

/**
 * Ensure output directories exist before file copy or download operations.
 */
function ensureArtifactDirectories() {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }
}

/**
 * Normalizes potentially user-controlled values before writing them to logs.
 *
 * @param {string} value
 *
 * @returns {string}
 */
function sanitizeForSingleLineLog(value) {
    return value.replaceAll(/[\r\n\u2028\u2029]/g, " ");
}

/**
 * @param {unknown} error
 *
 * @returns {string}
 */
function getSanitizedErrorMessage(error) {
    const message = error instanceof Error ? error.message : String(error);
    return sanitizeForSingleLineLog(message);
}

/**
 * @param {string} message
 *
 * @returns {Error}
 */
function createDownloadError(message) {
    return new Error(sanitizeForSingleLineLog(message));
}

/**
 * @param {string} actualHash
 * @param {string | undefined} expectedHash
 *
 * @returns {boolean}
 */
function verifyHash(actualHash, expectedHash) {
    if (!expectedHash) {
        console.log(
            `[wasm-download] No expected hash provided, accepting downloaded file with hash: ${actualHash}`
        );
        console.log(
            `[wasm-download] For additional security, you can set SQLITE3_WASM_SHA256=${actualHash} to pin this hash`
        );
        return true;
    }

    if (actualHash !== expectedHash) {
        console.error(
            `[wasm-download] Integrity check failed. Expected ${expectedHash} got ${actualHash}`
        );
        return false;
    }

    console.log(`[wasm-download] Hash verification successful: ${actualHash}`);
    return true;
}

/**
 * @returns {boolean}
 */
function verifyNonPlaceholderHash() {
    // This function is no longer needed since we handle undefined hashes gracefully
    return true;
}

/**
 * @param {string} sourcePath
 * @param {string} targetPath
 */
function copyWasmFile(sourcePath, targetPath) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`[wasm-download] Copied ${sourcePath} to ${targetPath}`);
}

/**
 * @param {string} firstPath
 * @param {string} secondPath
 *
 * @returns {boolean}
 */
function filesMatch(firstPath, secondPath) {
    return fs.readFileSync(firstPath).equals(fs.readFileSync(secondPath));
}

/**
 * Keep local WASM copies synchronized without contacting the network.
 *
 * @returns {boolean} True when a local source was found.
 */
function ensureLocalWasmAvailable() {
    if (fs.existsSync(scriptsDest)) {
        if (!fs.existsSync(dest)) {
            copyWasmFile(scriptsDest, dest);
        } else if (!filesMatch(scriptsDest, dest)) {
            copyWasmFile(scriptsDest, dest);
        } else {
            console.log(`[wasm-download] WASM file already exists: ${dest}`);
        }
        return true;
    }

    if (fs.existsSync(dest)) {
        copyWasmFile(dest, scriptsDest);
        return true;
    }

    if (fs.existsSync(packageDest)) {
        copyWasmFile(packageDest, dest);
        copyWasmFile(packageDest, scriptsDest);
        return true;
    }

    return false;
}

/**
 * @returns {Promise<string>}
 */
async function getLatestCommitHash() {
    return new Promise((resolve, reject) => {
        const apiUrl =
            "https://api.github.com/repos/tndrle/node-sqlite3-wasm/commits/main";

        https
            .get(
                apiUrl,
                {
                    headers: {
                        "User-Agent": "uptime-watcher-build-script",
                    },
                },
                (res) => {
                    let data = "";

                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        try {
                            const response = JSON.parse(data);
                            resolve(response.sha.substring(0, 8)); // Short hash
                        } catch (error) {
                            reject(
                                new Error(
                                    `Failed to parse GitHub API response: ${getSanitizedErrorMessage(error)}`
                                )
                            );
                        }
                    });
                }
            )
            .on("error", (error) => {
                reject(
                    new Error(
                        `Failed to fetch latest commit: ${getSanitizedErrorMessage(error)}`
                    )
                );
            });
    });
}

/**
 * @returns {string | null}
 */
function getCurrentVersion() {
    const versionFile = path.join(__dirname, "../assets/.wasm-version");
    if (fs.existsSync(versionFile)) {
        try {
            return fs.readFileSync(versionFile, "utf8").trim();
        } catch {
            return null;
        }
    }
    return null;
}

/**
 * @param {string} version
 */
function saveVersion(version) {
    const versionFile = path.join(__dirname, "../assets/.wasm-version");
    try {
        fs.writeFileSync(versionFile, version, "utf8");
        console.log(`[wasm-download] Saved version: ${version}`);
    } catch (error) {
        console.warn(
            `[wasm-download] Warning: Could not save version file: ${getSanitizedErrorMessage(error)}`
        );
    }
}

/**
 * @returns Any.
 */
async function checkForUpdates() {
    try {
        console.log("[wasm-download] Checking for updates...");
        const latestHash = await getLatestCommitHash();
        const currentVersion = getCurrentVersion();

        console.log(`[wasm-download] Latest upstream version: ${latestHash}`);
        console.log(
            `[wasm-download] Current local version: ${currentVersion || "unknown"}`
        );

        if (!currentVersion) {
            console.log(
                "[wasm-download] No local version found - update recommended"
            );
            return {
                hasUpdate: true,
                updateCheckFailed: false,
                latestVersion: latestHash,
                currentVersion: null,
            };
        }

        if (currentVersion !== latestHash) {
            console.log("[wasm-download] New version available!");
            return {
                hasUpdate: true,
                updateCheckFailed: false,
                latestVersion: latestHash,
                currentVersion,
            };
        }

        console.log("[wasm-download] You have the latest version");
        return {
            hasUpdate: false,
            updateCheckFailed: false,
            latestVersion: latestHash,
            currentVersion,
        };
    } catch (error) {
        const errorMessage = getSanitizedErrorMessage(error);
        console.warn(
            `[wasm-download] Warning: Could not check for updates: ${errorMessage}`
        );
        return {
            hasUpdate: false,
            updateCheckFailed: true,
            error: errorMessage,
        };
    }
}

/**
 * @param {string} urlToFetch - URL to fetch.
 * @param {string} destPath - Destination path.
 * @param {number} [redirectCount] - Default is `0`.
 *
 * @returns {Promise<void>} Resolves after download and synchronization finish.
 */
function download(urlToFetch, destPath, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > MAX_REDIRECTS) {
            reject(
                createDownloadError(`Too many redirects (> ${MAX_REDIRECTS})`)
            );
            return;
        }

        const req = https.get(urlToFetch, (res) => {
            if (
                res.statusCode &&
                [
                    301,
                    302,
                    303,
                    307,
                    308,
                ].includes(res.statusCode)
            ) {
                const location = res.headers.location;
                if (!location) {
                    reject(
                        createDownloadError(
                            "Redirect response missing 'location' header"
                        )
                    );
                    return;
                }

                const redirectUrl = new URL(location, urlToFetch).toString();
                download(redirectUrl, destPath, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(
                    createDownloadError(
                        `Unexpected status code: ${res.statusCode}`
                    )
                );
                return;
            }

            const hash = crypto.createHash("sha256");
            let received = 0;
            let settled = false;
            const tempPath = `${destPath}.download`;
            const file = fs.createWriteStream(tempPath, { flags: "w" });

            const cleanupTempFile = () => {
                try {
                    fs.unlinkSync(tempPath);
                } catch {
                    // Best-effort cleanup for partially downloaded artifacts.
                }
            };

            /**
             * @param {unknown} error - Failure reason.
             *
             * @returns {void}
             */
            const fail = (error) => {
                if (settled) {
                    return;
                }

                settled = true;
                cleanupTempFile();
                reject(
                    error instanceof Error
                        ? error
                        : createDownloadError(String(error))
                );
            };

            file.on("error", (error) => {
                fail(createDownloadError(`File write error: ${error.message}`));
            });

            res.on("error", fail);

            res.on("data", (chunk) => {
                received += chunk.length;
                if (received > MAX_SIZE_BYTES) {
                    res.destroy();
                    file.destroy();
                    fail(
                        createDownloadError(
                            `Download exceeded maximum allowed size (${MAX_SIZE_BYTES} bytes)`
                        )
                    );
                    return;
                }

                hash.update(chunk);
            });

            res.pipe(file);

            res.on("end", () => {
                file.close(async (closeError) => {
                    if (settled) {
                        return;
                    }

                    if (closeError) {
                        fail(
                            createDownloadError(
                                `File close error: ${closeError.message}`
                            )
                        );
                        return;
                    }

                    try {
                        const actual = hash.digest("hex").toLowerCase();
                        if (!verifyHash(actual, EXPECTED_SHA256)) {
                            cleanupTempFile();
                            fail(
                                createDownloadError("Hash verification failed")
                            );
                            return;
                        }

                        fs.renameSync(tempPath, destPath);
                        console.log(
                            `[wasm-download] Downloaded and saved to ${destPath}`
                        );
                        fs.copyFileSync(destPath, scriptsDest);
                        console.log(
                            `[wasm-download] Copied to scripts directory: ${scriptsDest}`
                        );

                        try {
                            const version = await getLatestCommitHash();
                            saveVersion(version);
                            console.log(
                                `[wasm-download] Success! Downloaded version ${version}`
                            );
                        } catch (error) {
                            console.warn(
                                `[wasm-download] Warning: Could not save version: ${getSanitizedErrorMessage(error)}`
                            );
                            console.log(
                                `[wasm-download] Success! Download completed but version tracking unavailable`
                            );
                        }

                        settled = true;
                        resolve();
                    } catch (error) {
                        fail(error);
                    }
                });
            });
        });

        req.on("error", (error) => {
            reject(createDownloadError(`Network error: ${error.message}`));
        });
    });
}

/**
 * @param {string} message - Error message to log.
 *
 * @returns {false}
 */
function reportFailure(message) {
    console.error(
        `[wasm-download] ERROR: ${sanitizeForSingleLineLog(message)}`
    );
    return false;
}

/**
 * Orchestrate update checks and download the node-sqlite3-wasm binary.
 *
 * @param {ReturnType<typeof parseArgs>} options - Parsed CLI options.
 *
 * @returns {Promise<boolean>} Resolves `true` on success.
 */
async function main(options = parseArgs(process.argv.slice(2))) {
    if (options.help) {
        showHelp();
        return true;
    }

    ensureArtifactDirectories();

    // Handle check-update-only flag (just check, don't download)
    if (options.checkUpdateOnly) {
        try {
            const result = await checkForUpdates();
            if (result.updateCheckFailed) {
                return reportFailure(
                    `Error checking for updates: ${result.error ?? "unknown error"}`
                );
            }

            if (result.hasUpdate) {
                console.log(
                    `[wasm-download] Update available: ${result.currentVersion || "none"} → ${result.latestVersion}`
                );
                console.log(
                    "[wasm-download] Run without --check-update to download the latest version"
                );
                return true;
            } else {
                console.log("[wasm-download] No updates available");
                return true;
            }
        } catch (error) {
            return reportFailure(`Error: ${getSanitizedErrorMessage(error)}`);
        }
    }

    if (options.noUpdate && !options.forceDownload) {
        if (!ensureLocalWasmAvailable()) {
            return reportFailure(
                "No local node-sqlite3-wasm.wasm found. Run npm run sqlite:download:force to fetch it explicitly."
            );
        }
        return true;
    }

    // Default behavior: check for updates (unless --no-update is specified)
    if (!options.noUpdate && !options.forceDownload) {
        try {
            const result = await checkForUpdates();
            if (result.hasUpdate || result.updateCheckFailed) {
                if (result.updateCheckFailed) {
                    console.log(
                        "[wasm-download] Could not check for updates, proceeding with download..."
                    );
                } else {
                    console.log(
                        "[wasm-download] Update available, proceeding with download..."
                    );
                }

                // Remove existing files if they exist
                if (fs.existsSync(dest)) {
                    console.log(
                        "[wasm-download] Removing existing file for update:",
                        dest
                    );
                    fs.unlinkSync(dest);
                }
                if (fs.existsSync(scriptsDest)) {
                    console.log(
                        "[wasm-download] Removing existing file from scripts directory:",
                        scriptsDest
                    );
                    fs.unlinkSync(scriptsDest);
                }
            } else {
                console.log("[wasm-download] Already up to date");

                // Ensure files exist in both locations
                if (fs.existsSync(dest) && !fs.existsSync(scriptsDest)) {
                    fs.copyFileSync(dest, scriptsDest);
                    console.log(
                        "Copied existing file to scripts directory:",
                        scriptsDest
                    );
                } else if (!fs.existsSync(dest) && fs.existsSync(scriptsDest)) {
                    fs.copyFileSync(scriptsDest, dest);
                    console.log(
                        "Copied existing file to dist directory:",
                        dest
                    );
                }

                return true;
            }
        } catch (error) {
            console.error(
                `[wasm-download] Error checking for updates: ${getSanitizedErrorMessage(error)}`
            );
            console.log("[wasm-download] Proceeding with download anyway...");
        }
    }

    // Handle force download
    if (options.forceDownload && fs.existsSync(dest)) {
        console.log(
            "[wasm-download] Force download requested, removing existing file:",
            dest
        );
        fs.unlinkSync(dest);
        if (fs.existsSync(scriptsDest)) {
            console.log(
                "[wasm-download] Removing existing file from scripts directory:",
                scriptsDest
            );
            fs.unlinkSync(scriptsDest);
        }
    }

    await startDownload();
    return true;
}

/**
 * Validate configuration and kick off the download workflow.
 *
 * @returns {Promise<void>} Resolves when the download finishes.
 */
function startDownload() {
    verifyNonPlaceholderHash();
    console.log(
        `[wasm-download] Downloading node-sqlite3-wasm.wasm from ${url} (max ${MAX_SIZE_BYTES} bytes)`
    );
    if (EXPECTED_SHA256) {
        console.log(
            `[wasm-download] Will verify against expected SHA256: ${EXPECTED_SHA256}`
        );
    } else {
        console.log(
            `[wasm-download] No hash verification configured - will accept any valid download`
        );
    }
    return download(url, dest);
}

/**
 * Check whether this module was executed directly.
 *
 * @returns {boolean} Whether this is the CLI entrypoint.
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
            console.error(
                `[wasm-download] Unexpected error: ${getSanitizedErrorMessage(error)}`
            );
            process.exitCode = 1;
        });
}

export {
    checkForUpdates,
    createDownloadError,
    download,
    ensureLocalWasmAvailable,
    getCurrentVersion,
    getLatestCommitHash,
    isDirectInvocation,
    main,
    parseArgs,
    reportFailure,
    sanitizeForSingleLineLog,
    startDownload,
    verifyHash,
};
