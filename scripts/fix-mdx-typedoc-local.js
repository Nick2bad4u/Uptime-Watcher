const fs = require("fs");
const path = require("path");

// Accept multiple docs directories as an array
const DOCS_DIRS = [
    // Add your directories here!
    "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/Uptime-Watcher/docs/docusaurus/docs/app",
    "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/Uptime-Watcher/docs/docusaurus/docs/electron",
    "C:/Users/Nick/Dropbox/PC (2)/Documents/GitHub/Uptime-Watcher/docs/docusaurus/docs/shared",
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;

    // Find code block ranges so we don't touch content inside them
    const codeBlocks = [];
    const codeBlockRegex = /```[\s\S]*?```/g;
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
    content = content.replace(/<([a-zA-Z0-9_, \[\]\.]+)>/g, (m, p1, offset) => {
        for (const [start, end] of codeBlocks) {
            if (offset >= start && offset < end) return m;
        }
        changed = true;
        return `\`${p1}\``;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Fixed: ${filePath}`);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory does not exist: ${dir}`);
        return;
    }
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".md")) fixFile(p);
    }
}

// Process each docs directory
for (const dir of DOCS_DIRS) {
    walk(dir);
}

console.log(
    "Finished fixing TypeDoc markdown for MDX compatibility in all directories."
);
