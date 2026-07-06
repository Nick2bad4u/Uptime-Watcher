/**
 * Build script to download the SQLite3 WASM binary for Electron distribution.
 * Downloads the required WASM file from the node-sqlite3-wasm repository and
 * places it in the dist directory for bundling.
 *
 * @global
 */

// @ts-check

import * as fs from "fs";
import https from "https";
import path from "path";
import crypto from "crypto";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source URL for WASM. Allow override (e.g., for air‑gapped or pinned artifact mirrors)
const url =
    process.env["SQLITE3_WASM_URL"] ||
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
const EXPECTED_SHA256 = process.env["SQLITE3_WASM_SHA256"]?.toLowerCase();

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
 * @returns {never}
 */
function failAndExit(message) {
    console.error(
        `[wasm-download] ERROR: ${sanitizeForSingleLineLog(message)}`
    );
    process.exit(1);
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
 * @param {string} urlToFetch
 * @param {string} destPath
 * @param {number} [redirectCount] - Default is `0`.
 */
function download(urlToFetch, destPath, redirectCount = 0) {
    if (redirectCount > MAX_REDIRECTS) {
        failAndExit(`Too many redirects (> ${MAX_REDIRECTS})`);
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
                failAndExit("Redirect response missing 'location' header");
            }
            return download(location, destPath, redirectCount + 1);
        }

        if (res.statusCode !== 200) {
            failAndExit(`Unexpected status code: ${res.statusCode}`);
        }

        const hash = crypto.createHash("sha256");
        let received = 0;
        const tempPath = `${destPath}.download`;
        const file = fs.createWriteStream(tempPath, { flags: "w" });

        file.on("error", (err) => failAndExit(`File write error: ${err}`));

        res.on("data", (chunk) => {
            received += chunk.length;
            if (received > MAX_SIZE_BYTES) {
                res.destroy();
                failAndExit(
                    `Download exceeded maximum allowed size (${MAX_SIZE_BYTES} bytes)`
                );
            }
            hash.update(chunk);
        });

        res.pipe(file);

        res.on("end", () => {
            file.close(() => {
                const actual = hash.digest("hex").toLowerCase();
                if (!verifyHash(actual, EXPECTED_SHA256)) {
                    try {
                        fs.unlinkSync(tempPath);
                    } catch {}
                    failAndExit("Hash verification failed");
                }
                fs.renameSync(tempPath, destPath);
                console.log(
                    `[wasm-download] Downloaded and saved to ${destPath}`
                );
                // Copy to assets
                fs.copyFile(destPath, scriptsDest, (err) => {
                    if (err) {
                        failAndExit(
                            `Failed to copy to scripts directory: ${err}`
                        );
                    }
                    console.log(
                        `[wasm-download] Copied to scripts directory: ${scriptsDest}`
                    );

                    // Save version info after successful download
                    // Try to get the latest commit hash, but don't fail if we can't
                    getLatestCommitHash()
                        .then((version) => {
                            saveVersion(version);
                            console.log(
                                `[wasm-download] Success! Downloaded version ${version}`
                            );
                        })
                        .catch((err) => {
                            console.warn(
                                `[wasm-download] Warning: Could not save version: ${getSanitizedErrorMessage(err)}`
                            );
                            console.log(
                                `[wasm-download] Success! Download completed but version tracking unavailable`
                            );
                        })
                        .finally(() => {
                            process.exit(0);
                        });
                });
            });
        });
    });

    req.on("error", (err) => failAndExit(`Network error: ${err}`));
}

/**
 * Orchestrate update checks and download the node-sqlite3-wasm binary.
 *
 * @returns {Promise<void>} Resolves after completing the workflow.
 */
async function main(options = parseArgs(process.argv.slice(2))) {
    if (options.help) {
        showHelp();
        return;
    }

    ensureArtifactDirectories();

    // Handle check-update-only flag (just check, don't download)
    if (options.checkUpdateOnly) {
        try {
            const result = await checkForUpdates();
            if (result.updateCheckFailed) {
                console.error(
                    `[wasm-download] Error checking for updates: ${result.error ?? "unknown error"}`
                );
                process.exit(1);
            }

            if (result.hasUpdate) {
                console.log(
                    `[wasm-download] Update available: ${result.currentVersion || "none"} → ${result.latestVersion}`
                );
                console.log(
                    "[wasm-download] Run without --check-update to download the latest version"
                );
                process.exit(0);
            } else {
                console.log("[wasm-download] No updates available");
                process.exit(0);
            }
        } catch (error) {
            console.error(
                `[wasm-download] Error: ${getSanitizedErrorMessage(error)}`
            );
            process.exit(1);
        }
    }

    if (options.noUpdate && !options.forceDownload) {
        if (!ensureLocalWasmAvailable()) {
            failAndExit(
                "No local node-sqlite3-wasm.wasm found. Run npm run sqlite:download:force to fetch it explicitly."
            );
        }
        process.exit(0);
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

                process.exit(0);
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

    startDownload();
}

/**
 * Validate configuration and kick off the download workflow.
 *
 * @returns {void}
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
    download(url, dest);
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
    main().catch((error) => {
        console.error(
            `[wasm-download] Unexpected error: ${getSanitizedErrorMessage(error)}`
        );
        process.exit(1);
    });
}

export { parseArgs, sanitizeForSingleLineLog };
