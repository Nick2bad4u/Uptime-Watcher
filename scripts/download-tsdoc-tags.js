const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const tags = [
    "alpha",
    "beta",
    "decorator",
    "defaultvalue",
    "deprecated",
    "eventproperty",
    "example",
    "experimental",
    "inheritdoc",
    "internal",
    "label",
    "link",
    "override",
    "packagedocumentation",
    "param",
    "privateremarks",
    "public",
    "readonly",
    "remarks",
    "returns",
    "sealed",
    "see",
    "throws",
    "typeparam",
    "virtual",
];

const extraPages = [
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/spec/overview.md",
        fileName: "TSDoc-Spec-Overview.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/spec/tag_kinds.md",
        fileName: "TSDoc-Spec-TagKinds.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/spec/standardization_groups.md",
        fileName: "TSDoc-Spec-StandardizationGroups.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/index.md",
        fileName: "TSDoc-Home.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/intro/approach.md",
        fileName: "TSDoc-Intro-Approach.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/intro/using_tsdoc.md",
        fileName: "TSDoc-Intro-UsingTsdoc.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/packages/tsdoc.md",
        fileName: "TSDoc-Package-Tsdoc.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/packages/tsdoc-config.md",
        fileName: "TSDoc-Package-TsdocConfig.md",
    },
    {
        url: "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/packages/eslint-plugin-tsdoc.md",
        fileName: "TSDoc-Package-EslintPluginTsdoc.md",
    },
];

const baseGitHubUrl =
    "https://github.com/microsoft/rushstack-websites/raw/refs/heads/main/websites/tsdoc.org/docs/pages/tags";
let outputDir = process.env.TSDOC_OUTPUT_DIR || path.join(process.cwd(), "docs", "TSDoc");
// Normalize and resolve the output directory for cross-platform compatibility
outputDir = path.resolve(outputDir);
const logFile = path.join(outputDir, "TSDoc-Download-Log.md");
const tsdocDomain = "https://tsdoc.org/pages";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const downloadedFiles = [];

const hashesPath = path.join(outputDir, "TSDoc-Hashes.json");
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
// 🧠 Helper to sanitize and rewrite link content

/**
 * Rewrites relative Markdown links to absolute URLs for TSDoc documentation.
 *
 * - Converts links to spec pages: (../spec/page.md) → (https://tsdoc.org/pages/spec/page/)
 * - Converts links to tag pages: (../tags/tag.md) → (https://tsdoc.org/pages/tags/tag/)
 *
 * Limitations and Edge Cases:
 * - Only rewrites links matching the exact patterns: (../spec/[name].md) and (../tags/[name].md).
 * - Links with different formats, additional query parameters, anchors, or subdirectories will not be rewritten.
 * - Non-Markdown links or malformed links are ignored.
 * - Nested Markdown links, links inside code blocks, or links with additional Markdown formatting (e.g., images, reference-style links) are not handled and may remain unchanged.
 * - If a link contains multiple levels of nesting or complex Markdown syntax, only the outermost matching pattern is processed.
 * - The function does not validate the existence of the target URLs or handle broken links.
 *
 * @param {string} content - The Markdown content to process.
 * @returns {string} The content with rewritten links.
 */
function rewriteLinks(content) {
    content = content.replace(/\(\.\.\/spec\/([\w-]+)\.md\)/g, (_, page) => `(${tsdocDomain}/spec/${page}/)`);
    content = content.replace(/\(\.\.\/tags\/([\w-]+)\.md\)/g, (_, tag) => `(${tsdocDomain}/tags/${tag}/)`);
    return content;
}

// 🏷 Download Tag Pages (from GitHub)
function downloadFile(cmd, filePath, logMsg, name) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) {
                console.error(logMsg.replace("✅", "❌").replace("📘", "❌") + ` → ${err.message}`);
                return reject(err);
            }
            if (!fs.existsSync(filePath)) {
                console.error(logMsg.replace("✅", "❌").replace("📘", "❌") + " → File not created.");
                return reject(new Error("File not created: " + filePath));
            }
            let content;
            try {
                content = fs.readFileSync(filePath, "utf8");
            } catch (readErr) {
                console.error(
                    logMsg.replace("✅", "❌").replace("📘", "❌") + ` → Failed to read file: ${readErr.message}`
                );
                return reject(readErr);
            }
            if (!content || content.trim().length === 0) {
                console.error(logMsg.replace("✅", "❌").replace("📘", "❌") + " → File is empty.");
                return reject(new Error("Downloaded file is empty: " + filePath));
            }
            try {
                fs.writeFileSync(filePath, rewriteLinks(content));
            } catch (writeErr) {
                console.error(
                    logMsg.replace("✅", "❌").replace("📘", "❌") + ` → Failed to write file: ${writeErr.message}`
                );
                return reject(writeErr);
            }
            console.log(logMsg);
            downloadedFiles.push(name);
            resolve();
        });
    });
}

const tagPromises = tags.map((tag) => {
    const url = `${baseGitHubUrl}/${tag}.md`;
    const fileName = `TSDoc-Tag-${tag.charAt(0).toUpperCase() + tag.slice(1)}.md`;
    const filePath = path.join(outputDir, fileName);
    const cmd = `curl -sSL "${url}" -o "${filePath}"`;
    return downloadFile(cmd, filePath, `✅ Downloaded: ${tag} → ${fileName}`, fileName);
});
const extraPagePromises = extraPages.map(({ url, fileName }) => {
    const filePath = path.join(outputDir, fileName);
    const cmd = `pandoc ${url} -t markdown -o "${filePath}"`;
    return downloadFile(cmd, filePath, `📘 Fetched: ${fileName}`, fileName);
});

(async function main() {
    try {
        await Promise.all([...tagPromises, ...extraPagePromises]);
        writeLogIfComplete();
    } catch (err) {
        // Centralized error handling: log, then re-throw
        console.error("❌ One or more downloads failed.", err);
        writeLogIfComplete();
        throw err;
    }
})();

/**
 * Writes a log entry summarizing the results of all TSDoc downloads.
 *
 * - Only writes the log if all expected files have been downloaded.
 * - Compares file hashes to detect changes and logs updated files.
 * - Updates the hashes file for future change detection.
 *
 * No parameters; relies on global state for downloaded files and hashes.
 */
// 🗒️ Write log after all downloads
function writeLogIfComplete() {
    const expectedCount = tags.length + extraPages.length;
    if (downloadedFiles.length !== expectedCount) return;

    const timestamp = new Date().toISOString();
    let logEntry = `## 🕓 TSDoc sync @ ${timestamp}\n`;
    let changedCount = 0;

    downloadedFiles.forEach((name) => {
        const filePath = path.join(outputDir, name);
        const content = fs.readFileSync(filePath, "utf8");
        const hash = crypto.createHash("sha256").update(content).digest("hex");
        newHashes[name] = hash;

        if (previousHashes[name] !== hash) {
            changedCount++;
            const icon = name.startsWith("TSDoc-Tag-") ? "✅" : "📘";
            logEntry += `- ${icon} ${name}\n  ↳ Hash: \`${hash}\`\n`;
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
