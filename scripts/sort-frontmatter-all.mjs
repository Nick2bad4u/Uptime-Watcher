// Scripts/sort-frontmatter-all.mjs
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const __dirname = import.meta.dirname;
const repoRoot = path.resolve(__dirname, "..");
const sorterPath = path.resolve(repoRoot, "scripts", "sort-frontmatter.mjs");

/**
 * Collect markdown files from a directory (recursive).
 *
 * @param {string} dir
 *
 * @returns {string[]}
 */
function collectMarkdownFilesFromDir(dir) {
    const pattern = path.join(dir, "**", "*.md").replaceAll("\\", "/");
    return fs.globSync(pattern);
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
    const resolved = path.resolve(repoRoot, rawArg);

    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        return collectMarkdownFilesFromDir(resolved);
    }

    // Treat as glob; use the raw argument so user glob syntax is preserved
    // but anchor it at repoRoot.
    const pattern = path.resolve(repoRoot, rawArg).replaceAll("\\", "/");
    const matches = fs.globSync(pattern);

    return matches.filter((/** @type {string} */ file) =>
        file.toLowerCase().endsWith(".md")
    );
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

// --- CLI entrypoint ---

// Arguments after `--` in npm scripts end up here
const cliArgs = process.argv.slice(2);

if (cliArgs.length === 0) {
    console.error(
        "Usage: node scripts/sort-frontmatter-runner.mjs <folder-or-glob> [more...]"
    );
    console.error("Examples:");
    console.error("  node scripts/sort-frontmatter-runner.mjs .");
    console.error("  node scripts/sort-frontmatter-runner.mjs .github/prompts");
    console.error(
        "  node scripts/sort-frontmatter-runner. mjs .github/*. instructions.md"
    );
    process.exit(1);
}

/** @type {string[]} */
let allFiles = [];

for (const arg of cliArgs) {
    const files = resolveArgToFiles(arg);
    allFiles.push(...files);
}

allFiles = dedupeFiles(allFiles);

if (allFiles.length === 0) {
    console.log("No Markdown files matched the given paths/globs.");
    process.exit(0);
}

for (const file of allFiles) {
    const rel = path.relative(repoRoot, file);
    console.log(`Sorting frontmatter in ${rel}`);
    execSync(`node "${sorterPath}" "${file}"`, { stdio: "inherit" });
}
