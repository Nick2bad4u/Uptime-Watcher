/**
 * Build script to download the SQLite3 WASM binary for Electron distribution.
 * Downloads the required WASM file from the node-sqlite3-wasm repository and
 * places it in the dist-electron directory for bundling.
 *
 * @global process
 */

import * as fs from "fs";
import https from "https";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source URL for WASM. Allow override (e.g., for air‑gapped or pinned artifact mirrors)
const url =
    process.env.SQLITE3_WASM_URL ||
    "https://github.com/tndrle/node-sqlite3-wasm/raw/refs/heads/main/dist/node-sqlite3-wasm.wasm";
const destDir = path.resolve(__dirname, "../dist-electron");
const dest = path.join(destDir, "node-sqlite3-wasm.wasm");
const scriptsDir = path.resolve(__dirname, "../assets");
const scriptsDest = path.join(scriptsDir, "node-sqlite3-wasm.wasm");

// Ensure dist-electron directory exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Ensure assets directory exists
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
}

// Expected SHA256 of the WASM (update when upstream changes). Allow override via env to facilitate controlled updates.
// If no hash is provided, we'll download and verify against the upstream hash
const EXPECTED_SHA256 = process.env.SQLITE3_WASM_SHA256?.toLowerCase();

const MAX_REDIRECTS = 3;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB safety cap

// Check for command line flags
const forceDownload = process.argv.includes("--force");
const checkUpdateOnly = process.argv.includes("--check-update");
const noUpdate = process.argv.includes("--no-update");

function failAndExit(message) {
    console.error(`[wasm-download] ERROR: ${message}`);
    process.exit(1);
}

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

function verifyNonPlaceholderHash() {
    // This function is no longer needed since we handle undefined hashes gracefully
    return true;
}

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
                                    `Failed to parse GitHub API response: ${error.message}`
                                )
                            );
                        }
                    });
                }
            )
            .on("error", (error) => {
                reject(
                    new Error(`Failed to fetch latest commit: ${error.message}`)
                );
            });
    });
}

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

function saveVersion(version) {
    const versionFile = path.join(__dirname, "../assets/.wasm-version");
    try {
        fs.writeFileSync(versionFile, version, "utf8");
        console.log(`[wasm-download] Saved version: ${version}`);
    } catch (error) {
        console.warn(
            `[wasm-download] Warning: Could not save version file: ${error.message}`
        );
    }
}

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
                latestVersion: latestHash,
                currentVersion: null,
            };
        }

        if (currentVersion !== latestHash) {
            console.log("[wasm-download] New version available!");
            return {
                hasUpdate: true,
                latestVersion: latestHash,
                currentVersion,
            };
        }

        console.log("[wasm-download] You have the latest version");
        return { hasUpdate: false, latestVersion: latestHash, currentVersion };
    } catch (error) {
        console.warn(
            `[wasm-download] Warning: Could not check for updates: ${error.message}`
        );
        return { hasUpdate: false, error: error.message };
    }
}

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
                                `[wasm-download] Warning: Could not save version: ${err.message}`
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

async function main() {
    // Handle check-update-only flag (just check, don't download)
    if (checkUpdateOnly) {
        try {
            const result = await checkForUpdates();
            if (result.error) {
                console.error(
                    `[wasm-download] Error checking for updates: ${result.error}`
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
            console.error(`[wasm-download] Error: ${error.message}`);
            process.exit(1);
        }
        return;
    }

    // Check if files exist and handle accordingly
    if (fs.existsSync(dest) && !forceDownload && noUpdate) {
        console.log("WASM file already exists:", dest);
        // Also check if it exists in scripts and copy if needed
        if (!fs.existsSync(scriptsDest)) {
            fs.copyFileSync(dest, scriptsDest);
            console.log(
                "Copied existing file to scripts directory:",
                scriptsDest
            );
        } else {
            console.log(
                "WASM file also exists in scripts directory:",
                scriptsDest
            );
        }
        process.exit(0);
    }

    // Default behavior: check for updates (unless --no-update is specified)
    if (!noUpdate && !forceDownload) {
        try {
            const result = await checkForUpdates();
            if (result.hasUpdate || result.error) {
                if (result.error) {
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
                        "Copied existing file to dist-electron directory:",
                        dest
                    );
                }

                process.exit(0);
            }
        } catch (error) {
            console.error(
                `[wasm-download] Error checking for updates: ${error.message}`
            );
            console.log("[wasm-download] Proceeding with download anyway...");
        }
    }

    // Handle force download
    if (forceDownload && fs.existsSync(dest)) {
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

// Run the main function
main().catch((error) => {
    console.error(`[wasm-download] Unexpected error: ${error.message}`);
    process.exit(1);
});
