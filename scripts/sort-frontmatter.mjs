import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const __dirname = import.meta.dirname;
const repoRoot = path.resolve(__dirname, "..");
const SKIPPED_DIRECTORIES = new Set([
    ".cache",
    ".git",
    ".vs",
    ".vscode",
    "build",
    "coverage",
    "dist",
    "dist-bench",
    "dist-configs",
    "dist-playwright",
    "html",
    "node_modules",
    "playwright-report",
    "release",
    "reports",
    "storybook-static",
    "temp",
    "test-results",
]);

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
 * Show command usage.
 */
function showHelp() {
    console.log(`
Sort Markdown frontmatter for one repository file.

Usage: node scripts/sort-frontmatter.mjs [--check] <file.md>

Options:
  --check    Report whether the file is sorted without writing changes.
  -h, --help Show this help.
`);
}

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{ check: boolean; file: string | null; help: boolean }} Parsed
 *   arguments.
 */
function parseArgs(args) {
    const parsed = {
        check: false,
        file: /** @type {string | null} */ (null),
        help: false,
    };

    for (const arg of args) {
        switch (arg) {
            case "--check": {
                parsed.check = true;
                break;
            }

            case "--help":
            case "-h": {
                parsed.help = true;
                break;
            }

            default: {
                if (arg.startsWith("-")) {
                    throw new Error(`Unknown option: ${arg}`);
                }

                if (parsed.file !== null) {
                    throw new Error(
                        `Only one Markdown file can be sorted at a time.`
                    );
                }

                parsed.file = arg;
            }
        }
    }

    return parsed;
}

/**
 * Check whether a path resolves inside the repository.
 *
 * @param {string} resolvedPath
 *
 * @returns {boolean}
 */
function isRepoPath(resolvedPath) {
    const relativePath = path.relative(repoRoot, resolvedPath);
    return (
        relativePath === "" ||
        (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
    );
}

/**
 * Check whether a path is under a generated/cache directory.
 *
 * @param {string} resolvedPath
 *
 * @returns {boolean}
 */
function isSkippedPath(resolvedPath) {
    const relativePath = path.relative(repoRoot, resolvedPath);
    return relativePath
        .split(path.sep)
        .some((segment) => SKIPPED_DIRECTORIES.has(segment));
}

/**
 * Resolve a user-provided Markdown file path inside the repository.
 *
 * @param {string} rawFile
 *
 * @returns {string}
 */
function resolveMarkdownFile(rawFile) {
    const resolved = path.resolve(repoRoot, rawFile);

    if (!isRepoPath(resolved)) {
        throw new Error(`Target must stay inside the repository: ${rawFile}`);
    }

    if (isSkippedPath(resolved)) {
        throw new Error(`Refusing to sort generated/cache path: ${rawFile}`);
    }

    if (path.extname(resolved).toLowerCase() !== ".md") {
        throw new Error(`Target must be a Markdown file: ${rawFile}`);
    }

    if (!fs.existsSync(resolved)) {
        throw new Error(`File does not exist: ${rawFile}`);
    }

    if (!fs.statSync(resolved).isFile()) {
        throw new Error(`Target must be a file: ${rawFile}`);
    }

    return resolved;
}

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
            currentKey = match?.groups?.["key"] ?? "";
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
    const orderedBlocks = blocks
        .map((block, index) => ({ block, index }))
        .toSorted((left, right) => {
            if (!left.block.key || !right.block.key) {
                if (!left.block.key && !right.block.key) {
                    return left.index - right.index;
                }

                return left.block.key ? 1 : -1;
            }

            const leftKnownIndex = KEY_ORDER.indexOf(left.block.key);
            const rightKnownIndex = KEY_ORDER.indexOf(right.block.key);

            if (leftKnownIndex !== -1 || rightKnownIndex !== -1) {
                if (leftKnownIndex === -1) {
                    return 1;
                }

                if (rightKnownIndex === -1) {
                    return -1;
                }

                if (leftKnownIndex !== rightKnownIndex) {
                    return leftKnownIndex - rightKnownIndex;
                }

                return left.index - right.index;
            }

            const keyComparison = left.block.key.localeCompare(right.block.key);
            return keyComparison === 0
                ? left.index - right.index
                : keyComparison;
        });

    return orderedBlocks.flatMap(({ block }) => block.lines).join("\n");
}

/**
 * Sort frontmatter text for a Markdown file.
 *
 * @param {string} fileContent - Current file content.
 *
 * @returns {string | null} Sorted content, or null when no frontmatter exists.
 */
function sortFrontmatterContent(fileContent) {
    const split = splitFrontmatter(fileContent);

    if (!split) {
        return null;
    }

    const blocks = parseKeyBlocks(split.frontmatter);
    const reorderedFrontmatter = reorderBlocks(blocks);

    return `---\n${reorderedFrontmatter}\n---\n${split.body}`;
}

/**
 * Sort one Markdown file's frontmatter.
 *
 * @param {string} filename - Markdown file path inside the repository.
 * @param {{ check?: boolean }} [options] - Sorting options.
 *
 * @returns {{ changed: boolean; filename: string; skipped: boolean }} Result.
 */
function sortFrontmatterFile(filename, options = {}) {
    const resolvedFile = resolveMarkdownFile(filename);
    const file = fs.readFileSync(resolvedFile, "utf8");
    const out = sortFrontmatterContent(file);

    if (out === null) {
        return {
            changed: false,
            filename: resolvedFile,
            skipped: true,
        };
    }

    const changed = out !== file;

    if (changed && options.check !== true) {
        fs.writeFileSync(resolvedFile, out);
    }

    return {
        changed,
        filename: resolvedFile,
        skipped: false,
    };
}

/**
 * Main CLI entrypoint.
 *
 * @param {string[]} [args] - Raw command-line arguments.
 */
function main(args = process.argv.slice(2)) {
    try {
        const options = parseArgs(args);

        if (options.help) {
            showHelp();
            return;
        }

        if (options.file === null) {
            showHelp();
            process.exit(1);
        }

        const result = sortFrontmatterFile(options.file, {
            check: options.check,
        });

        if (result.skipped) {
            console.error("No valid frontmatter found in", result.filename);
            process.exit(1);
        }

        if (options.check && result.changed) {
            console.error("Frontmatter is not sorted in", result.filename);
            process.exit(1);
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

if (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
    main();
}

export {
    isRepoPath,
    isSkippedPath,
    parseArgs,
    parseKeyBlocks,
    reorderBlocks,
    resolveMarkdownFile,
    sortFrontmatterContent,
    sortFrontmatterFile,
    splitFrontmatter,
};
