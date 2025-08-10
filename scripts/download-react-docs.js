/**
 * React Documentation Downloader
 * Downloads key React documentation pages from the official React docs
 */

import { exec } from "child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/* -------------------- CONFIGURATION -------------------- */

const DOC_NAME = "React";
const BASE_URL = "https://react.dev";

// Key React documentation pages
const PAGES = [
    "learn",
    "learn/start-a-new-react-project",
    "learn/add-react-to-an-existing-project", 
    "learn/editor-setup",
    "learn/react-developer-tools",
    "learn/describing-the-ui",
    "learn/adding-interactivity",
    "learn/managing-state",
    "learn/escape-hatches",
    "reference/react",
    "reference/react-dom",
    "reference/react/hooks",
    "reference/react/useState",
    "reference/react/useEffect",
    "reference/react/useContext",
    "reference/react/useReducer",
    "reference/react/useMemo",
    "reference/react/useCallback"
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
        console.log(`📁 Loaded ${Object.keys(previousHashes).length} previous hashes.`);
    } catch {
        console.warn("⚠️ Failed to parse previous hashes — starting fresh.");
    }
}

const newHashes = {};

/**
 * Clean React documentation content
 * @param {string} content
 * @returns {string}
 */
function cleanContent(content) {
    // Remove navigation and footer elements
    let cleaned = content
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/class="[^"]*"/gi, '')
        .replace(/id="[^"]*"/gi, '');

    return cleaned.trim();
}

/**
 * Rewrite React docs links to absolute URLs
 * @param {string} content
 * @returns {string}
 */
function rewriteLinks(content) {
    return content
        .replace(/]\(\/learn\//g, `](${BASE_URL}/learn/`)
        .replace(/]\(\/reference\//g, `](${BASE_URL}/reference/`)
        .replace(/]\(\/blog\//g, `](${BASE_URL}/blog/`)
        .replace(/]\(\/community\//g, `](${BASE_URL}/community/`);
}

/**
 * Download a React documentation page
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
                console.error(logMsg.replace("✅", "❌") + " → File not created.");
                return reject(new Error("File not created: " + filePath));
            }
            
            let content;
            try {
                content = fs.readFileSync(filePath, "utf8");
            } catch (readErr) {
                console.error(logMsg.replace("✅", "❌") + ` → Failed to read file: ${readErr.message}`);
                return reject(readErr);
            }
            
            if (!content || content.trim().length === 0) {
                console.error(logMsg.replace("✅", "❌") + " → Downloaded file is empty.");
                return reject(new Error("Downloaded file is empty: " + filePath));
            }

            // Clean and rewrite content
            const cleanedContent = cleanContent(content);
            const rewrittenContent = rewriteLinks(cleanedContent);
            
            try {
                fs.writeFileSync(filePath, rewrittenContent, "utf8");
            } catch (writeErr) {
                console.error(logMsg.replace("✅", "❌") + ` → Failed to write file: ${writeErr.message}`);
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
    const fileName = `React-${page.replace(/\//g, "-")}.${OUTPUT_EXT}`;
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
        console.log(`\n🎉 Successfully downloaded ${downloadedFiles.length} React documentation files!`);
        console.log(`📁 Files saved to: ${outputDir}`);
        
        if (downloadedFiles.length > 0) {
            console.log("📄 Downloaded files:");
            downloadedFiles.forEach(file => console.log(`   - ${file}`));
        }
        
        // Save new hashes
        fs.writeFileSync(hashFile, JSON.stringify(newHashes, null, 2));
        console.log(`💾 Saved ${Object.keys(newHashes).length} file hashes.`);
    })
    .catch((err) => {
        console.error(`❌ Failed to download React docs: ${err.message}`);
        process.exit(1);
    });
