const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// List of Axios documentation pages to download
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

const baseAxiosUrl = "https://axios-http.com/docs";
let outputDir =
    process.env.AXIOS_DOCS_OUTPUT_DIR ||
    path.join(process.cwd(), "docs", "packages", "axios");
// Normalize and resolve the output directory for cross-platform compatibility
outputDir = path.resolve(outputDir);
const logFile = path.join(outputDir, "Axios-Download-Log.md");
const hashesPath = path.join(outputDir, "Axios-Hashes.json");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const downloadedFiles = [];

let previousHashes = {};
if (fs.existsSync(hashesPath)) {
    try {
        const parsed = JSON.parse(fs.readFileSync(hashesPath, "utf8"));
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

/**
 * Removes everything from the line containing '::::: sponsors_container' onward,
 * and removes any line that contains '::::::: body'.
 * @param {string} content
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
 * - Converts links like (./other_page) to (https://axios-http.com/docs/other_page)
 * - Only rewrites links matching the pattern: (./[name])
 * - Does not handle anchors, query params, or complex markdown links.
 * @param {string} content
 * @returns {string}
 */
function rewriteLinks(content) {
    return content.replace(
        /\(\.\/([\w-]+)\)/g,
        (_, page) => `(${baseAxiosUrl}/${page})`
    );
}

// Download a single Axios doc page as markdown
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
                console.error(logMsg.replace("✅", "❌") + " → File is empty.");
                return reject(
                    new Error("Downloaded file is empty: " + filePath)
                );
            }
            try {
                // Process content: rewrite links, then clean unwanted sections
                let processedContent = rewriteLinks(content);
                processedContent = cleanContent(processedContent);
                fs.writeFileSync(filePath, processedContent);
            } catch (writeErr) {
                console.error(
                    logMsg.replace("✅", "❌") +
                        ` → Failed to write file: ${writeErr.message}`
                );
                return reject(writeErr);
            }
            console.log(logMsg);
            downloadedFiles.push(name);
            resolve();
        });
    });
}

const axiosPagePromises = axiosPages.map((page) => {
    // Download the HTML page and convert to markdown using pandoc
    const url = `${baseAxiosUrl}/${page}`;
    const fileName = `Axios-${page.replace(/_/g, "-")}.md`;
    const filePath = path.join(outputDir, fileName);
    const cmd = `pandoc "${url}.html" -t markdown -o "${filePath}"`;
    return downloadFile(
        cmd,
        filePath,
        `✅ Downloaded: ${page} → ${fileName}`,
        fileName
    );
});

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
 * - Only writes the log if all expected files have been downloaded.
 * - Compares file hashes to detect changes and logs updated files.
 * - Updates the hashes file for future change detection.
 */
function writeLogIfComplete() {
    const expectedCount = axiosPages.length;
    if (downloadedFiles.length !== expectedCount) return;

    const timestamp = new Date().toISOString();
    let logEntry = `## 🕓 Axios docs sync @ ${timestamp}\n`;
    let changedCount = 0;

    downloadedFiles.forEach((name) => {
        const filePath = path.join(outputDir, name);
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
        fs.appendFileSync(logFile, logEntry);
        console.log(`🗒️ Log updated → ${logFile}`);
        fs.writeFileSync(hashesPath, JSON.stringify(newHashes, null, 2));
    } else {
        console.log("📦 All files unchanged — no log entry written.");
    }
}
