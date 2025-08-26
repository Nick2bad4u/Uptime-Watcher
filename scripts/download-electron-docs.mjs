/**
 * Electron Documentation Downloader Downloads key Electron documentation pages
 * from the official docs
 */

import { exec } from "child_process";
import fs from "node:fs";
import path from "node:path";

/* -------------------- CONFIGURATION -------------------- */

const DOC_NAME = "Electron";
const BASE_URL = "https://www.electronjs.org";

// Key Electron documentation pages
const PAGES = [
    "docs/latest/tutorial/quick-start",
    "docs/latest/tutorial/process-model",
    "docs/latest/tutorial/ipc",
    "docs/latest/tutorial/preload",
    "docs/latest/tutorial/context-isolation",
    "docs/latest/tutorial/security",
    "docs/latest/tutorial/performance",
    "docs/latest/tutorial/accessibility",
    "docs/latest/tutorial/updates",
    "docs/latest/tutorial/native-file-drag-drop",
    "docs/latest/tutorial/keyboard-shortcuts",
    "docs/latest/tutorial/testing-widevine",
    "docs/latest/api/app",
    "docs/latest/api/browser-window",
    "docs/latest/api/web-contents",
    "docs/latest/api/ipc-main",
    "docs/latest/api/ipc-renderer",
    "docs/latest/api/menu",
    "docs/latest/api/menu-item",
    "docs/latest/api/notification",
    "docs/latest/api/dialog",
    "docs/latest/api/clipboard",
    "docs/latest/api/shell",
    "docs/latest/api/net",
    "docs/latest/api/screen",
    "docs/latest/api/auto-updater",
];

const INPUT_FORMAT = "html";
const OUTPUT_FORMAT = "gfm";

const SUBDIR_1 = "docs";
const SUBDIR_2 = "packages";
const OUTPUT_EXT = "md";

/* -------------------- SETUP -------------------- */

const outputDir = path.join(
    process.env.DOCS_OUTPUT_DIR || ".",
    SUBDIR_1,
    SUBDIR_2,
    DOC_NAME
);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const hashFile = path.join(outputDir, `${DOC_NAME}-hashes.json`);
const downloadedFiles = [];

// Load previous hashes (if any)
let previousHashes = {};
if (fs.existsSync(hashFile)) {
    try {
        previousHashes = JSON.parse(fs.readFileSync(hashFile, "utf8"));
        console.log(
            `📁 Loaded ${Object.keys(previousHashes).length} previous hashes.`
        );
    } catch {
        console.warn("⚠️ Failed to parse previous hashes — starting fresh.");
    }
}

const newHashes = {};

/**
 * Clean Electron documentation content
 *
 * @param {string} content
 *
 * @returns {string}
 */
function cleanContent(content) {
    // Remove navigation, sidebar, and footer elements
    let cleaned = content
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
        .replace(
            /<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
            ""
        )
        .replace(/class="[^"]*"/gi, "")
        .replace(/id="[^"]*"/gi, "");

    return cleaned.trim();
}

/**
 * Rewrite Electron docs links to absolute URLs
 *
 * @param {string} content
 *
 * @returns {string}
 */
function rewriteLinks(content) {
    return content
        .replace(/]\(\/docs\//g, `](${BASE_URL}/docs/`)
        .replace(/]\(\/blog\//g, `](${BASE_URL}/blog/`)
        .replace(/]\(\/community\//g, `](${BASE_URL}/community/`)
        .replace(/]\(\/releases\//g, `](${BASE_URL}/releases/`);
}

/**
 * Download an Electron documentation page
 *
 * @param {string} cmd
 * @param {string} filePath
 * @param {string} logMsg
 * @param {string} name
 *
 * @returns {Promise<void>}
 */
function downloadFile(cmd, filePath, logMsg, name) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) {
                console.error(logMsg.replace("✅", "❌") + ` → ${err.message}`);
                return reject(err);
            }
            if (!fs.existsSync(filePath)) {
                console.error(
                    logMsg.replace("✅", "❌") + " → File not created."
                );
                return reject(new Error("File not created: " + filePath));
            }

            let content;
            try {
                content = fs.readFileSync(filePath, "utf8");
            } catch (readErr) {
                console.error(
                    logMsg.replace("✅", "❌") +
                        ` → Failed to read file: ${readErr instanceof Error ? readErr.message : String(readErr)}`
                );
                return reject(readErr);
            }

            if (!content || content.trim().length === 0) {
                console.error(
                    logMsg.replace("✅", "❌") + " → Downloaded file is empty."
                );
                return reject(
                    new Error("Downloaded file is empty: " + filePath)
                );
            }

            // Clean and rewrite content
            const cleanedContent = cleanContent(content);
            const rewrittenContent = rewriteLinks(cleanedContent);

            try {
                fs.writeFileSync(filePath, rewrittenContent, "utf8");
            } catch (writeErr) {
                console.error(
                    logMsg.replace("✅", "❌") +
                        ` → Failed to write file: ${writeErr instanceof Error ? writeErr.message : String(writeErr)}`
                );
                return reject(writeErr);
            }

            console.log(logMsg);
            downloadedFiles.push(name);
            resolve(undefined);
        });
    });
}

const pagePromises = PAGES.map((page) => {
    const url = `${BASE_URL}/${page}`;
    const fileName = `Electron-${page.replace(/docs\/latest\//g, "").replace(/\//g, "-")}.${OUTPUT_EXT}`;
    const filePath = path.join(outputDir, fileName);
    const cmd = `pandoc "${url}" -f ${INPUT_FORMAT} -t ${OUTPUT_FORMAT} -o "${filePath}"`;

    return downloadFile(
        cmd,
        filePath,
        `✅ Downloaded: ${page} → ${fileName}`,
        fileName
    );
});

Promise.all(pagePromises)
    .then(() => {
        console.log(
            `\n🎉 Successfully downloaded ${downloadedFiles.length} Electron documentation files!`
        );
        console.log(`📁 Files saved to: ${outputDir}`);

        if (downloadedFiles.length > 0) {
            console.log("📄 Downloaded files:");
            downloadedFiles.forEach((file) => console.log(`   - ${file}`));
        }

        // Save new hashes
        fs.writeFileSync(hashFile, JSON.stringify(newHashes, null, 2));
        console.log(`💾 Saved ${Object.keys(newHashes).length} file hashes.`);
    })
    .catch((err) => {
        console.error(`❌ Failed to download Electron docs: ${err.message}`);
        process.exit(1);
    });
