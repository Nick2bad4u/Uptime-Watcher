import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Unified docs directory
const DOCS_DIR = "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/Uptime-Watcher/docs/docusaurus/docs";

function fixFile(filePath) {
    let content = readFileSync(filePath, "utf8");
    let changed = false;

    // Find code block ranges so we don't touch content inside them
    const codeBlocks = [];
    const codeBlockRegex = /```(?:[a-zA-Z0-9_-]*)[\s\S]*?```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        codeBlocks.push([match.index, codeBlockRegex.lastIndex]);
    }

    // Replace {anything} outside code blocks
    content = content.replace(/\{([^}]+)\}/g, (m, p1, offset) => {
        for (const [start, end] of codeBlocks) {
            if (offset >= start && offset < end) return m;
        }
        changed = true;
        return `\`${p1}\``;
    });

    // Replace <anything> outside code blocks
    content = content.replace(/<([^>\n]+)>/g, (m, p1, offset) => {
        for (const [start, end] of codeBlocks) {
            if (offset >= start && offset < end) return m;
        }
        changed = true;
        return `\`${p1}\``;
    });

    if (changed) {
        const tempFilePath = filePath + ".tmp";
        writeFileSync(tempFilePath, content, "utf8");
        renameSync(tempFilePath, filePath);
        console.log(`Fixed: ${filePath}`);
    }
}

/**
 * Recursively walks through a directory and fixes markdown files.
 * @param {string} dir - The directory path to walk.
 */
function walk(dir) {
    if (!existsSync(dir)) {
        console.warn(`Directory does not exist: ${dir}`);
        return;
    }
    let files;
    try {
        files = readdirSync(dir);
    } catch (err) {
        console.error(`Failed to read directory: ${dir}`, err);
        return;
    }
    for (const f of files) {
        const p = join(dir, f);
        let stat;
        try {
            stat = statSync(p);
        } catch (err) {
            console.error(`Failed to stat path: ${p}`, err);
            continue;
        }
        if (stat.isDirectory()) {
            walk(p);
        } else if (p.endsWith(".md")) {
            try {
                fixFile(p);
            } catch (err) {
                console.error(`Failed to fix file: ${p}`, err);
            }
        }
    }
}

// Process the unified docs directory
walk(DOCS_DIR);

console.log(
    "Finished fixing TypeDoc markdown for MDX compatibility in unified documentation."
);
