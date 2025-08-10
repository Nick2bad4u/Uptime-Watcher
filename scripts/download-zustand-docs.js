/**
 * Zustand Documentation Downloader
 * Downloads Zustand documentation from GitHub repository
 */

import { exec } from "child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/* -------------------- CONFIGURATION -------------------- */

const DOC_NAME = "Zustand";
const BASE_URL = "https://raw.githubusercontent.com/pmndrs/zustand/main";

// Key Zustand documentation files from the GitHub repo
const PAGES = [
    "README.md",
    "docs/getting-started/introduction.md",
    "docs/getting-started/comparison.md",
    "docs/guides/updating-state.md",
    "docs/guides/async-actions.md",
    "docs/guides/maps-and-sets-usage.md",
    "docs/guides/practice-with-no-store-actions.md",
    "docs/guides/prevent-rerenders-with-use-shallow.md",
    "docs/guides/flux-inspired-practice.md",
    "docs/guides/connect-to-state-with-url-hash.md",
    "docs/integrations/persisting-store-data.md",
    "docs/integrations/immer.md",
    "docs/integrations/devtools.md",
    "docs/integrations/combining-stores.md",
    "docs/integrations/testing.md",
    "docs/integrations/typescript.md",
    "docs/migrations/migrating-to-v5.md",
];

const INPUT_FORMAT = "gfm";
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
 * Clean Zustand documentation content
 * @param {string} content
 * @returns {string}
 */
function cleanContent(content) {
    // GitHub markdown is usually clean, just remove any GitHub-specific elements
    let cleaned = content
        .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "") // Remove badges
        .replace(/<!--[\s\S]*?-->/g, ""); // Remove comments

    return cleaned.trim();
}

/**
 * Rewrite relative links to absolute GitHub URLs
 * @param {string} content
 * @returns {string}
 */
function rewriteLinks(content) {
    const githubBase = "https://github.com/pmndrs/zustand/blob/main";

    return content
        .replace(/]\(\.\/([^)]+)\)/g, `](${githubBase}/$1)`)
        .replace(/]\(\.\.\/([^)]+)\)/g, `](${githubBase}/$1)`)
        .replace(/]\(docs\/([^)]+)\)/g, `](${githubBase}/docs/$1)`)
        .replace(/]\(examples\/([^)]+)\)/g, `](${githubBase}/examples/$1)`);
}

/**
 * Download a Zustand documentation file
 * @param {string} cmd
 * @param {string} filePath
 * @param {string} logMsg
 * @param {string} name
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
                        ` → Failed to read file: ${readErr.message}`
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
                        ` → Failed to write file: ${writeErr.message}`
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
    const fileName = `Zustand-${page.replace(/docs\//g, "").replace(/\//g, "-")}`;
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
            `\n🎉 Successfully downloaded ${downloadedFiles.length} Zustand documentation files!`
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
        console.error(`❌ Failed to download Zustand docs: ${err.message}`);
        process.exit(1);
    });
