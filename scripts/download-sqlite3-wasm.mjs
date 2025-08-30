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
// Placeholder hash (all zeros) forces explicit update until verified.
const EXPECTED_SHA256 = (
    process.env.SQLITE3_WASM_SHA256 ||
    "0000000000000000000000000000000000000000000000000000000000000000"
).toLowerCase();

const MAX_REDIRECTS = 3;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB safety cap

function failAndExit(message) {
    console.error(`[wasm-download] ERROR: ${message}`);
    process.exit(1);
}

function verifyNonPlaceholderHash() {
    if (/^0{64}$/.test(EXPECTED_SHA256)) {
        failAndExit(
            "Expected SHA256 hash placeholder in script. Set SQLITE3_WASM_SHA256 env var with verified hash before distribution."
        );
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
                if (actual !== EXPECTED_SHA256) {
                    try {
                        fs.unlinkSync(tempPath);
                    } catch {}
                    failAndExit(
                        `Integrity check failed. Expected ${EXPECTED_SHA256} got ${actual}`
                    );
                }
                fs.renameSync(tempPath, destPath);
                console.log(
                    `[wasm-download] Verified SHA256 (${actual}) and saved to ${destPath}`
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
                    process.exit(0);
                });
            });
        });
    });

    req.on("error", (err) => failAndExit(`Network error: ${err}`));
}

if (fs.existsSync(dest)) {
    console.log("WASM file already exists:", dest);
    // Also check if it exists in scripts and copy if needed
    if (!fs.existsSync(scriptsDest)) {
        fs.copyFileSync(dest, scriptsDest);
        console.log("Copied existing file to scripts directory:", scriptsDest);
    } else {
        console.log("WASM file also exists in scripts directory:", scriptsDest);
    }
    process.exit(0); // Explicitly exit with success
}

verifyNonPlaceholderHash();
console.log(
    `[wasm-download] Downloading node-sqlite3-wasm.wasm from ${url} (max ${MAX_SIZE_BYTES} bytes)`
);
download(url, dest);
