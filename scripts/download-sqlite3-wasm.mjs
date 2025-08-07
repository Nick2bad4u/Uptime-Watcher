/**
 * Build script to download the SQLite3 WASM binary for Electron distribution.
 * Downloads the required WASM file from the node-sqlite3-wasm repository
 * and places it in the dist-electron directory for bundling.
 *
 * @global process
 */

import * as fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url =
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

function download(url, dest, redirectCount = 0) {
    if (redirectCount > 5) {
        console.error("Too many redirects");
        process.exit(1);
    }
    const req = https.get(url, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
            // Follow redirect if location header is present
            if (res.headers.location) {
                download(res.headers.location, dest, redirectCount + 1);
            } else {
                console.error("Redirect response missing 'location' header.");
                process.exit(1);
            }
            return;
        }
        if (res.statusCode !== 200) {
            console.error("Failed to download WASM:", res.statusCode);
            process.exit(1);
        }
        const file = fs.createWriteStream(dest);

        // Handle disk write errors before piping
        file.on("error", (err) => {
            console.error("File write error:", err);
            process.exit(1);
        });

        res.pipe(file);

        file.on("finish", () => {
            file.close();
            console.log("Downloaded:", dest);

            // Also copy to scripts directory
            fs.copyFile(dest, scriptsDest, (err) => {
                if (err) {
                    console.error("Failed to copy to scripts directory:", err);
                    process.exit(1);
                } else {
                    console.log("Copied to scripts directory:", scriptsDest);
                    process.exit(0); // Explicitly exit with success
                }
            });
        });
    });

    req.on("error", (err) => {
        console.error("Network error while downloading WASM:", err);
        process.exit(1);
    });
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

console.log("Downloading node-sqlite3-wasm.wasm...");
download(url, dest);
