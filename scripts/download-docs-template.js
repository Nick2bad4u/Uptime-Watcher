/**
 * Universal Doc Downloader & Cleaner Template
 * -------------------------------------------
 * Easily configure all variables at the top!
 * 
 * HOW TO CONFIGURE:
 *   1. Set variables in the CONFIGURATION section below.
 *   2. Adjust the `rewriteLinks` and `cleanContent` functions if needed.
 *   3. Run: `node doc_downloader_template.js`
 */

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* -------------------- CONFIGURATION -------------------- */

// Unique name for this doc sync; used for log/hashes file names
const DOC_NAME = "Axios";

// Array of doc/page names (relative, e.g. ["intro", "example"])
const PAGES = [
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

// Base URL for docs (no trailing slash)
const BASE_URL = "https://example.com/docs";

// Output directory (edit here or use env variable DOCS_OUTPUT_DIR)
let OUTPUT_DIR = process.env.DOCS_OUTPUT_DIR || path.join(process.cwd(), "docs", "packages", DOC_NAME.toLowerCase());
OUTPUT_DIR = path.resolve(OUTPUT_DIR);

// Pandoc output file name template (should include DOC_NAME and page name)
const FILE_NAME_TEMPLATE = (page) => `${DOC_NAME}-${page.replace(/_/g, "-")}.md`;

// Log and hash file paths (auto-uses DOC_NAME)
const LOG_FILE = path.join(OUTPUT_DIR, `${DOC_NAME}-Download-Log.md`);
const HASHES_FILE = path.join(OUTPUT_DIR, `${DOC_NAME}-Hashes.json`);

// Command template for downloading & converting (must produce $OUT_FILE)
const CMD_TEMPLATE = (url, outFile) => `pandoc "${url}.html" -t markdown -o "${outFile}"`;

/** 
 * SECTION REMOVAL/STRIP OPTIONS:
 * - To remove everything from a marker onwards, add its string to REMOVE_FROM_MARKER (array, any string).
 * - To remove only lines that contain certain markers, add those to REMOVE_LINE_MARKERS (array).
 */
const REMOVE_FROM_MARKER = [
    "::::: sponsors_container"
];
const REMOVE_LINE_MARKERS = [
    "::::::: body"
];

/* --------- END CONFIGURATION (edit above only!) -------- */

/**
 * Rewrites relative Markdown links to absolute URLs for your documentation set.
 * Customize as needed for your doc set.
 * @param {string} content
 * @returns {string}
 */
function rewriteLinks(content) {
    return content.replace(/\(\.\/([\w-]+)\)/g, (_, page) => `(${BASE_URL}/${page})`);
}

/**
 * Cleans unwanted sections/lines from Markdown.
 * - Removes everything from the first occurrence of any REMOVE_FROM_MARKER onward.
 * - Removes any line that contains any REMOVE_LINE_MARKERS.
 * @param {string} content
 * @returns {string}
 */
function cleanContent(content) {
    // Remove everything from the first REMOVE_FROM_MARKER onward (if any)
    let cleaned = content;
    for (const marker of REMOVE_FROM_MARKER) {
        const idx = cleaned.indexOf(marker);
        if (idx !== -1) {
            // Find the start of the line for the marker
            const lineStart = cleaned.lastIndexOf('\n', idx) + 1;
            cleaned = cleaned.slice(0, lineStart);
        }
    }
    // Remove lines containing any REMOVE_LINE_MARKERS
    cleaned = cleaned
        .split('\n')
        .filter(line => !REMOVE_LINE_MARKERS.some(marker => line.includes(marker)))
        .join('\n')
        .trimEnd();

    return cleaned;
}

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// State tracking
const downloadedFiles = [];
let previousHashes = {};
if (fs.existsSync(HASHES_FILE)) {
    try {
        const parsed = JSON.parse(fs.readFileSync(HASHES_FILE, "utf8"));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            previousHashes = parsed;
        } else {
            console.warn("⚠️ Invalid hashes file structure — starting fresh.");
            previousHashes = {};
        }
    } catch {
        console.warn("⚠️ Failed to parse previous hashes — starting fresh.");
    }
}
const newHashes = {};

// Download and process a single doc page
function downloadFile(cmd, filePath, logMsg, name) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) {
                console.error(logMsg.replace("✅", "❌") + ` → ${err.message}`);
                return reject(err);
            }
            if (!fs.existsSync(filePath)) {
                console.error(logMsg.replace("✅", "❌") + " → File not created.");
                return reject(new Error("File not created: " + filePath));
            }
            let content;
            try {
                content = fs.readFileSync(filePath, "utf8");
            } catch (readErr) {
                console.error(
                    logMsg.replace("✅", "❌") + ` → Failed to read file: ${readErr.message}`
                );
                return reject(readErr);
            }
            if (!content || content.trim().length === 0) {
                console.error(logMsg.replace("✅", "❌") + " → File is empty.");
                return reject(new Error("Downloaded file is empty: " + filePath));
            }
            try {
                let processedContent = rewriteLinks(content);
                processedContent = cleanContent(processedContent);
                fs.writeFileSync(filePath, processedContent);
            } catch (writeErr) {
                console.error(
                    logMsg.replace("✅", "❌") + ` → Failed to write file: ${writeErr.message}`
                );
                return reject(writeErr);
            }
            console.log(logMsg);
            downloadedFiles.push(name);
            resolve();
        });
    });
}

// Build page download promises
const pagePromises = PAGES.map((page) => {
    const url = `${BASE_URL}/${page}`;
    const fileName = FILE_NAME_TEMPLATE(page);
    const filePath = path.join(OUTPUT_DIR, fileName);
    const cmd = CMD_TEMPLATE(url, filePath);
    return downloadFile(cmd, filePath, `✅ Downloaded: ${page} → ${fileName}`, fileName);
});

(async function main() {
    try {
        await Promise.all(pagePromises);
        writeLogIfComplete();
    } catch (err) {
        // Centralized error handling: log, then re-throw
        console.error("❌ One or more downloads failed.", err);
        writeLogIfComplete();
        throw err;
    }
})();

function writeLogIfComplete() {
    const expectedCount = PAGES.length;
    if (downloadedFiles.length !== expectedCount) return;

    const timestamp = new Date().toISOString();
    let logEntry = `## 🕓 ${DOC_NAME} docs sync @ ${timestamp}\n`;
    let changedCount = 0;

    downloadedFiles.forEach((name) => {
        const filePath = path.join(OUTPUT_DIR, name);
        const content = fs.readFileSync(filePath, "utf8");
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        newHashes[name] = hash;

        if (previousHashes[name] !== hash) {
            changedCount++;
            logEntry += `- ✅ ${name}\n  ↳ Hash: \`${hash}\`\n`;
        }
    });

    if (changedCount > 0) {
        logEntry += `\n🔧 ${changedCount} changed file${changedCount > 1 ? "s" : ""}\n---\n`;
        fs.appendFileSync(LOG_FILE, logEntry);
        console.log(`🗒️ Log updated → ${LOG_FILE}`);
        fs.writeFileSync(HASHES_FILE, JSON.stringify(newHashes, null, 2));
    } else {
        console.log("📦 All files unchanged — no log entry written.");
    }
}