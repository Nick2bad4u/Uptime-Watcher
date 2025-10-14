/**
 * Chart.js Documentation Downloader Downloads key Chart.js documentation pages
 * from the official docs
 */

import { exec } from "child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {Object} HashRecord
 *
 * @property {Record<string, string>} [key] - Mapping of file names to their
 *   SHA-256 hashes
 */

/**
 * @typedef {Record<string, string>} FileHashMap
 */

/* -------------------- CONFIGURATION -------------------- */

/** @type {string} */
const DOC_NAME = "Chartjs";
/** @type {string} */
const BASE_URL = "https://www.chartjs.org";

// Key Chart.js documentation pages
/** @type {string[]} */
const PAGES = [
    "docs/latest/getting-started/installation",
    "docs/latest/getting-started/usage",
    "docs/latest/getting-started/integration",
    "docs/latest/charts/line",
    "docs/latest/charts/bar",
    "docs/latest/charts/radar",
    "docs/latest/charts/doughnut",
    "docs/latest/charts/polar",
    "docs/latest/charts/bubble",
    "docs/latest/charts/scatter",
    "docs/latest/charts/area",
    "docs/latest/charts/mixed",
    "docs/latest/configuration/responsive",
    "docs/latest/configuration/device-pixel-ratio",
    "docs/latest/configuration/locale",
    "docs/latest/configuration/interactions",
    "docs/latest/configuration/canvas-background",
    "docs/latest/configuration/decimation",
    "docs/latest/axes/cartesian",
    "docs/latest/axes/radial",
    "docs/latest/developers/api",
    "docs/latest/developers/updates",
    "docs/latest/developers/plugins",
    "docs/latest/samples",
];

/** @type {string} */
const INPUT_FORMAT = "html";
/** @type {string} */
const OUTPUT_FORMAT = "gfm";

/** @type {string} */
const SUBDIR_1 = "docs";
/** @type {string} */
const SUBDIR_2 = "packages";
/** @type {string} */
const OUTPUT_EXT = "md";

/* -------------------- SETUP -------------------- */

/** @type {string} */
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

/** @type {string} */
const hashFile = path.join(outputDir, `${DOC_NAME}-hashes.json`);
/** @type {string[]} */
const downloadedFiles = [];

// Load previous hashes (if any)
/** @type {FileHashMap} */
let previousHashes = {};
if (fs.existsSync(hashFile)) {
    try {
        /** @type {unknown} */
        const parsed = JSON.parse(fs.readFileSync(hashFile, "utf8"));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            previousHashes = /** @type {FileHashMap} */ (parsed);
        } else {
            console.warn("⚠️ Invalid hashes file structure — starting fresh.");
            previousHashes = {};
        }
        console.log(
            `📁 Loaded ${Object.keys(previousHashes).length} previous hashes.`
        );
    } catch {
        console.warn("⚠️ Failed to parse previous hashes — starting fresh.");
    }
}

/** @type {FileHashMap} */
const newHashes = {};

/**
 * Clean Chart.js documentation content
 *
 * @param {string} content
 *
 * @returns {string}
 */
function cleanContent(content) {
    // Remove navigation, ads, and footer elements
    let cleaned = content
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
        .replace(/class="[^"]*"/gi, "")
        .replace(/id="[^"]*"/gi, "");

    return cleaned.trim();
}

/**
 * Rewrite Chart.js docs links to absolute URLs
 *
 * @param {string} content
 *
 * @returns {string}
 */
function rewriteLinks(content) {
    return content
        .replace(/]\(\/docs\//g, `](${BASE_URL}/docs/`)
        .replace(/]\(\/samples\//g, `](${BASE_URL}/samples/`)
        .replace(/]\(\/community\//g, `](${BASE_URL}/community/`);
}

/**
 * Download a Chart.js documentation page
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

/** @type {Promise<void>[]} */
const pagePromises = PAGES.map((page) => {
    /** @type {string} */
    const url = `${BASE_URL}/${page}`;
    /** @type {string} */
    const fileName = `Chartjs-${page.replace(/docs\/latest\//g, "").replace(/\//g, "-")}.${OUTPUT_EXT}`;
    /** @type {string} */
    const filePath = path.join(outputDir, fileName);
    /** @type {string} */
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
            `\n🎉 Successfully downloaded ${downloadedFiles.length} Chart.js documentation files!`
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
        console.error(`❌ Failed to download Chart.js docs: ${err.message}`);
        process.exit(1);
    });
