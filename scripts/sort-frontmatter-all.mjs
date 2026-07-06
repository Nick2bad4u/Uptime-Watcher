// Scripts/sort-frontmatter-all.mjs
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const __dirname = import.meta.dirname;
const repoRoot = path.resolve(__dirname, "..");
const sorterPath = path.resolve(repoRoot, "scripts", "sort-frontmatter.mjs");
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
 * Show command usage.
 */
function showHelp() {
    console.log(`
Sort Markdown frontmatter for matched files.

Usage: node scripts/sort-frontmatter-all.mjs <folder-or-glob> [more...]

Examples:
  node scripts/sort-frontmatter-all.mjs docs
  node scripts/sort-frontmatter-all.mjs .github/prompts
  node scripts/sort-frontmatter-all.mjs ".github/*.instructions.md"
`);
}

/**
 * Parse command-line arguments.
 *
 * @param {string[]} args - Raw command-line arguments.
 *
 * @returns {{ help: boolean; targets: string[] }} Parsed arguments.
 */
function parseArgs(args) {
    const parsed = {
        help: false,
        targets: /** @type {string[]} */ ([]),
    };

    for (const arg of args) {
        switch (arg) {
            case "--help":
            case "-h": {
                parsed.help = true;
                break;
            }

            default: {
                if (arg.startsWith("-")) {
                    throw new Error(`Unknown option: ${arg}`);
                }

                parsed.targets.push(arg);
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
 * Resolve a user-provided target path or glob inside the repository.
 *
 * @param {string} rawArg
 *
 * @returns {string}
 */
function resolveRepoTarget(rawArg) {
    const resolved = path.resolve(repoRoot, rawArg);
    if (!isRepoPath(resolved)) {
        throw new Error(`Target must stay inside the repository: ${rawArg}`);
    }

    return resolved;
}

/**
 * Check whether a file can be processed by the frontmatter sorter.
 *
 * @param {string} file
 *
 * @returns {boolean}
 */
function isSortableMarkdownFile(file) {
    const resolved = path.resolve(file);
    return (
        isRepoPath(resolved) &&
        !isSkippedPath(resolved) &&
        path.extname(resolved).toLowerCase() === ".md"
    );
}

/**
 * Collect markdown files from a directory (recursive).
 *
 * @param {string} dir
 *
 * @returns {string[]}
 */
function collectMarkdownFilesFromDir(dir) {
    const pattern = path.join(dir, "**", "*.md").replaceAll("\\", "/");
    return fs.globSync(pattern).filter(isSortableMarkdownFile);
}

/**
 * Resolve one CLI argument into a list of .md files.
 *
 * - If it's a directory: recurse and collect all .md
 * - Otherwise: treat it as a glob (or single file) and let glob handle it.
 *
 * @param {string} rawArg
 *
 * @returns {string[]}
 */
function resolveArgToFiles(rawArg) {
    // Resolve relative to repo root so usage is consistent
    const resolved = resolveRepoTarget(rawArg);

    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        return collectMarkdownFilesFromDir(resolved);
    }

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        return isSortableMarkdownFile(resolved) ? [resolved] : [];
    }

    // Treat as glob; use the raw argument so user glob syntax is preserved
    // but anchor it at repoRoot.
    const pattern = resolved.replaceAll("\\", "/");
    const matches = fs.globSync(pattern);

    return matches.filter(isSortableMarkdownFile);
}

/**
 * Deduplicate and normalize file paths.
 *
 * @param {string[]} files
 *
 * @returns {string[]}
 */
function dedupeFiles(files) {
    const seen = new Set();
    const result = [];
    for (const f of files) {
        const norm = path.resolve(f);
        if (!seen.has(norm)) {
            seen.add(norm);
            result.push(norm);
        }
    }
    return result;
}

/**
 * Main CLI entrypoint.
 *
 * @param {string[]} [args] - Raw command-line arguments.
 *
 * @returns {boolean} `true` when the command completes successfully.
 */
function main(args = process.argv.slice(2)) {
    try {
        const cliArgs = parseArgs(args);

        if (cliArgs.help) {
            showHelp();
            return true;
        }

        if (cliArgs.targets.length === 0) {
            showHelp();
            return false;
        }

        /** @type {string[]} */
        let allFiles = [];

        for (const arg of cliArgs.targets) {
            const files = resolveArgToFiles(arg);
            allFiles.push(...files);
        }

        allFiles = dedupeFiles(allFiles);

        if (allFiles.length === 0) {
            console.log("No Markdown files matched the given paths/globs.");
            return true;
        }

        for (const file of allFiles) {
            const rel = path.relative(repoRoot, file);
            console.log(`Sorting frontmatter in ${rel}`);
            execFileSync(process.execPath, [sorterPath, file], {
                stdio: "inherit",
            });
        }
        return true;
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        return false;
    }
}

/**
 * @returns {boolean} `true` when this file is the CLI entrypoint.
 */
function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    process.exitCode = main() ? 0 : 1;
}

export {
    collectMarkdownFilesFromDir,
    dedupeFiles,
    isDirectRun,
    isSortableMarkdownFile,
    main,
    parseArgs,
    resolveArgToFiles,
};
