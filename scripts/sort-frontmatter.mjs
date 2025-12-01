// Sort-frontmatter.mjs
import fs from "node:fs";

/**
 * Desired key order for your front matter.
 *
 * @type {string[]}
 */
const KEY_ORDER = [
    "name",
    "agent",
    "model",
    "description",
    "argument-hint",
    "target",
    "infer",
    "handoffs",
    "tools",
    "applyTo",
];

/**
 * Extract frontmatter and body from a Markdown file.
 *
 * Returns null if no valid frontmatter block is found.
 *
 * @param {string} text
 *
 * @returns {{ frontmatter: string; body: string } | null}
 */
function splitFrontmatter(text) {
    const lines = text.split(/\r?\n/);
    if (lines[0] !== "---") {
        return null;
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] === "---") {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) {
        return null;
    }

    const frontmatterLines = lines.slice(1, endIndex);
    const bodyLines = lines.slice(endIndex + 1);
    return {
        frontmatter: frontmatterLines.join("\n"),
        body: bodyLines.join("\n"),
    };
}

/**
 * Split frontmatter into top-level key blocks.
 *
 * Each block is: key line + any following indented lines.
 *
 * @param {string} frontmatter
 *
 * @returns {{ key: string; lines: string[] }[]}
 */
function parseKeyBlocks(frontmatter) {
    const lines = frontmatter.split(/\r?\n/);
    /** @type {{ key: string; lines: string[] }[]} */
    const blocks = [];

    /** @type {string | null} */
    let currentKey = null;
    /** @type {string[]} */
    let currentLines = [];

    // Named capturing group to satisfy lint rules
    const keyLineRegex = /^(?<key>[\w-]+)\s*:/;

    for (const line of lines) {
        const isKeyLine = keyLineRegex.test(line) && !line.startsWith(" ");

        if (isKeyLine) {
            // Flush previous block
            if (currentKey !== null) {
                blocks.push({ key: currentKey, lines: currentLines });
            }

            const match = keyLineRegex.exec(line);
            if (match && match.groups && match.groups["key"]) {
                currentKey = match.groups["key"];
            } else {
                // Fallback: treat as anonymous block if regex somehow fails
                currentKey = "";
            }
            currentLines = [line];
        } else {
            // Continuation line (indented or blank)
            if (currentKey === null) {
                // If there is content before the first key, treat it as an anonymous block
                // so we don't drop it.
                currentKey = "";
                currentLines = [];
            }
            currentLines.push(line);
        }
    }

    if (currentKey !== null) {
        blocks.push({ key: currentKey, lines: currentLines });
    }

    return blocks;
}

/**
 * Reorder key blocks by KEY_ORDER, then remaining keys alphabetically.
 * Formatting inside blocks is preserved exactly.
 *
 * @param {{ key: string; lines: string[] }[]} blocks
 *
 * @returns {string}
 */
function reorderBlocks(blocks) {
    /** @type {Map<string, { key: string; lines: string[] }>} */
    const byKey = new Map();
    for (const block of blocks) {
        // Anonymous / weird blocks get a synthetic key and are left at the top
        if (!block.key) continue;
        byKey.set(block.key, block);
    }

    /** @type {string[]} */
    const resultLines = [];

    // 1. Known keys in specified order
    for (const key of KEY_ORDER) {
        const block = byKey.get(key);
        if (block) {
            resultLines.push(...block.lines);
            byKey.delete(key);
        }
    }

    // 2. Remaining keys in alphabetical order (using toSorted)
    const remainingKeys = Array.from(byKey.keys()).toSorted((a, b) =>
        a.localeCompare(b)
    );
    for (const key of remainingKeys) {
        const block = byKey.get(key);
        if (block) {
            resultLines.push(...block.lines);
        }
    }

    return resultLines.join("\n");
}

const filename = process.argv[2];
if (!filename) {
    console.error("Usage: node sort-frontmatter.mjs <file.md>");
    process.exit(1);
}

const file = fs.readFileSync(filename, "utf8");
const split = splitFrontmatter(file);

if (!split) {
    console.error("No valid frontmatter found in", filename);
    process.exit(1);
}

const blocks = parseKeyBlocks(split.frontmatter);
const reorderedFrontmatter = reorderBlocks(blocks);

const out = `---\n${reorderedFrontmatter}\n---\n${split.body}`;
fs.writeFileSync(filename, out);
