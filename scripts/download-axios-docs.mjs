import { exec } from "child_process";
import {
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    appendFileSync,
} from "fs";
import { join, resolve as _resolve } from "path";
import { createHash } from "crypto";

/**
 * @typedef {Object} HashRecord
 * @property {Record<string, string>} [key] - Mapping of file names to their SHA-256 hashes
 */

/**
 * @typedef {Record<string, string>} FileHashMap
 */

// List of Axios documentation pages to download
/** @type {string[]} */
const axiosPages = [
    "intro",
    "example",
    "post_example",
    "api_intro",
    "instance",
    "req_config",
    "res_schema",
    "config_defaults",
    "interceptors",
    "handling_errors",
    "cancellation",
    "urlencoded",
    "multipart",
    "notes",
];

/** @type {string} */
const baseAxiosUrl = "https://axios-http.com/docs";
/** @type {string} */
let outputDir =
    process.env.AXIOS_DOCS_OUTPUT_DIR ||
    join(process.cwd(), "docs", "packages", "axios");
// Normalize and resolve the output directory for cross-platform compatibility
outputDir = _resolve(outputDir);
/** @type {string} */
const logFile = join(outputDir, "Axios-Download-Log.md");
/** @type {string} */
const hashesPath = join(outputDir, "Axios-Hashes.json");

if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}

/** @type {string[]} */
const downloadedFiles = [];

/** @type {FileHashMap} */
let previousHashes = {};
if (existsSync(hashesPath)) {
    try {
        /** @type {unknown} */
        const parsed = JSON.parse(readFileSync(hashesPath, "utf8"));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            previousHashes = /** @type {FileHashMap} */ (parsed);
        } else {
            console.warn("⚠️ Invalid hashes file structure — starting fresh.");
            previousHashes = {};
        }
    } catch {
        console.warn("⚠️ Failed to parse previous hashes — starting fresh.");
    }
}

/** @type {FileHashMap} */
const newHashes = {};

/**
 * Removes everything from the line containing '::::: sponsors_container'
 * onward, and removes any line that contains '::::::: body'.
 *
 * @param {string} content
 *
 * @returns {string}
 */
function cleanContent(content) {
    const marker = "::::: sponsors_container";
    // 1. Remove everything from sponsors_container onward
    const idx = content.indexOf(marker);
    let keepContent =
        idx === -1
            ? content
            : content.slice(0, content.lastIndexOf("\n", idx) + 1);

    // 2. Remove any line that contains '::::::: body'
    keepContent = keepContent
        .split("\n")
        .filter((line) => !line.includes("::::::: body"))
        .join("\n")
        .trimEnd();

    return keepContent;
}

/**
 * Rewrites relative Markdown links to absolute URLs for Axios documentation.
 *
 * - Converts links like (./other_page) to
 *   (https://axios-http.com/docs/other_page)
 * - Only rewrites links matching the pattern: (./[name])
 * - Does not handle anchors, query params, or complex markdown links.
 *
 * @param {string} content
 *
 * @returns {string}
 */
function rewriteLinks(content) {
    return content.replace(
        /\(\.\/([\w-]+)\)/g,
        (_, page) => `(${baseAxiosUrl}/${page})`
    );
}

/**
 * Download a single Axios doc page as markdown
 *
 * @param {string} cmd - The pandoc command to execute
 * @param {string} filePath - The path where the downloaded file will be saved
 * @param {string} logMsg - The log message to display on success
 * @param {string} name - The name of the file being downloaded
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
            if (!existsSync(filePath)) {
                console.error(
                    logMsg.replace("✅", "❌") + " → File not created."
                );
                return reject(new Error("File not created: " + filePath));
            }
            let content;
            try {
                content = readFileSync(filePath, "utf8");
            } catch (readErr) {
                console.error(
                    logMsg.replace("✅", "❌") +
                    ` → Failed to read file: ${readErr instanceof Error ? readErr.message : String(readErr)}`
                );
                return reject(readErr);
            }
            if (!content || content.trim().length === 0) {
                console.error(logMsg.replace("✅", "❌") + " → File is empty.");
                return reject(
                    new Error("Downloaded file is empty: " + filePath)
                );
            }
            try {
                // Process content: rewrite links, then clean unwanted sections
                let processedContent = rewriteLinks(content);
                processedContent = cleanContent(processedContent);
                writeFileSync(filePath, processedContent);
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
const axiosPagePromises = axiosPages.map((page) => {
    // Download the HTML page and convert to markdown using pandoc
    /** @type {string} */
    const url = `${baseAxiosUrl}/${page}`;
    /** @type {string} */
    const fileName = `Axios-${page.replace(/_/g, "-")}.md`;
    /** @type {string} */
    const filePath = join(outputDir, fileName);
    /** @type {string} */
    const cmd = `pandoc "${url}.html" -t markdown -o "${filePath}"`;
    return downloadFile(
        cmd,
        filePath,
        `✅ Downloaded: ${page} → ${fileName}`,
        fileName
    );
});

/**
 * Main execution function
 *
 * @returns {Promise<void>}
 */
(async function main() {
    try {
        await Promise.all(axiosPagePromises);
        writeLogIfComplete();
    } catch (err) {
        // Centralized error handling: log, then re-throw
        console.error("❌ One or more downloads failed.", err);
        writeLogIfComplete();
        throw err;
    }
})();

/**
 * Writes a log entry summarizing the results of all Axios doc downloads.
 *
 * - Only writes the log if all expected files have been downloaded.
 * - Compares file hashes to detect changes and logs updated files.
 * - Updates the hashes file for future change detection.
 *
 * @returns {void}
 */
function writeLogIfComplete() {
    /** @type {number} */
    const expectedCount = axiosPages.length;
    if (downloadedFiles.length !== expectedCount) return;

    /** @type {string} */
    const timestamp = new Date().toISOString();
    /** @type {string} */
    let logEntry = `## 🕓 Axios docs sync @ ${timestamp}\n`;
    /** @type {number} */
    let changedCount = 0;

    downloadedFiles.forEach((name) => {
        /** @type {string} */
        const filePath = join(outputDir, name);
        /** @type {string} */
        const content = readFileSync(filePath, "utf8");
        /** @type {string} */
        const hash = createHash("sha256").update(content).digest("hex");
        newHashes[name] = hash;

        if (previousHashes[name] !== hash) {
            changedCount++;
            logEntry += `- ✅ ${name}\n  ↳ Hash: \`${hash}\`\n`;
        }
    });

    if (changedCount > 0) {
        logEntry += `\n🔧 ${changedCount} changed file${changedCount > 1 ? "s" : ""}\n---\n`;
        appendFileSync(logFile, logEntry);
        console.log(`🗒️ Log updated → ${logFile}`);
        writeFileSync(hashesPath, JSON.stringify(newHashes, null, 2));
    } else {
        console.log("📦 All files unchanged — no log entry written.");
    }
}
