import {
    readFileSync,
    writeFileSync,
    renameSync,
    existsSync,
    readdirSync,
    statSync,
} from "node:fs";
import path from "node:path";

// Unified docs directory
const DOCS_DIR =
    "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/Uptime-Watcher/docs/docusaurus/docs";

/**
 * @param {string} filePath
 */
function fixFile(filePath) {
    let content = readFileSync(filePath, "utf8");
    const originalContent = content;

    // Find code block ranges so we don't touch content inside them
    /**
     * @type {number[][]}
     */
    const codeBlocks = [];
    const codeBlockRegex = /```[\w-]*[\S\s]*?```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        codeBlocks.push([match.index, codeBlockRegex.lastIndex]);
    }

    // Replace {anything} outside code blocks
    content = content.replaceAll(/{(?<temp1>[^}]+)}/g, (m, p1, offset) => {
        for (const [start, end] of codeBlocks) {
            if (
                start !== undefined &&
                end !== undefined &&
                offset >= start &&
                offset < end
            )
                return m;
        }
        return `\`${p1}\``;
    });

    // Replace <anything> outside code blocks
    content = content.replaceAll(/<(?<temp1>[^\n>]+)>/g, (m, p1, offset) => {
        for (const [start, end] of codeBlocks) {
            if (
                start !== undefined &&
                end !== undefined &&
                offset >= start &&
                offset < end
            )
                return m;
        }
        return `\`${p1}\``;
    });

    if (content !== originalContent) {
        const tempFilePath = `${filePath}.tmp`;
        writeFileSync(tempFilePath, content, "utf8");
        renameSync(tempFilePath, filePath);
        console.log(`Fixed: ${filePath}`);
    }
}

/**
 * Recursively walks through a directory and fixes markdown files.
 *
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
    } catch (error) {
        console.error(`Failed to read directory: ${dir}`, error);
        return;
    }
    for (const f of files) {
        const p = path.join(dir, f);
        let stat;
        try {
            stat = statSync(p);
        } catch (error) {
            console.error(`Failed to stat path: ${p}`, error);
            continue;
        }
        if (stat.isDirectory()) {
            walk(p);
        } else if (p.endsWith(".md")) {
            try {
                fixFile(p);
            } catch (error) {
                console.error(`Failed to fix file: ${p}`, error);
            }
        }
    }
}

// Process the unified docs directory
walk(DOCS_DIR);

console.log(
    "Finished fixing TypeDoc markdown for MDX compatibility in unified documentation."
);
