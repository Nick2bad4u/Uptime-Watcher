#!/usr/bin/env node
/**
 * Documentation link checker.
 *
 * Scans Markdown content within the docs directory and verifies that relative
 * links resolve to existing files or directories. External links (http, https,
 * mailto, etc.) are ignored. Fails with a non-zero exit code when broken links
 * are detected so CI can block the offending changes early.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const __dirname = import.meta.dirname;
const ROOT_DIRECTORY = path.resolve(__dirname, "..");
const DOCS_DIRECTORIES = [
    "docs/Architecture",
    "docs/Guides",
    "docs/Testing",
    "docs/docusaurus/src/pages",
];
const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".docusaurus",
    "build",
    "dist",
    ".vite",
]);

const LINK_PATTERN = /!?\[[^\]]*]\((?<temp1>[^)]+)\)/g;

const EXTERNAL_PROTOCOLS = [
    "http:",
    "https:",
    "mailto:",
    "tel:",
    "data:",
    // eslint-disable-next-line no-script-url -- testing
    "javascript:",
];

const LEADING_BANG = /^!/;

/**
 * @param {import("fs").PathLike} entryPath
 */
async function isDirectory(entryPath) {
    try {
        const entryStat = await stat(entryPath);
        return entryStat.isDirectory();
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return false;
        }
        throw error;
    }
}

/**
 * @param {string} startDirectory
 */
async function collectMarkdownFiles(startDirectory) {
    const results = [];
    const stack = [startDirectory];

    while (stack.length > 0) {
        const current = stack.pop();
        if (current === undefined) {
            // This should not happen due to the loop condition, but added for safety in JS
            continue;
        }
        const entries = await readdir(current, { withFileTypes: true });

        for (const entry of entries) {
            const entryName = entry.name;

            if (IGNORED_DIRECTORIES.has(entryName)) {
                continue;
            }

            const entryPath = path.join(current, entryName);

            if (entry.isDirectory()) {
                stack.push(entryPath);
                continue;
            }

            if (entry.isFile() && entryName.toLowerCase().endsWith(".md")) {
                results.push(entryPath);
            }
        }
    }

    return results;
}

/**
 * @param {string} link
 */
function isExternalLink(link) {
    return EXTERNAL_PROTOCOLS.some((protocol) =>
        link.toLowerCase().startsWith(protocol)
    );
}

/**
 * @param {string} link
 */
function isAnchor(link) {
    return link.startsWith("#");
}

/**
 * @param {string} link
 */
function normalizeLink(link) {
    const [pathPart] = link.split("#");
    if (!pathPart) return "";
    const [cleanPath] = pathPart.split("?");
    if (!cleanPath) return "";
    return cleanPath.trim();
}

/**
 * @param {string} markdownPath
 * @param {string} link
 * @param {{ file: any; link: any; resolvedPath: string }[]} issues
 */
async function validateLink(markdownPath, link, issues) {
    const normalized = normalizeLink(link);

    if (normalized.length === 0) {
        return;
    }

    if (isAnchor(normalized) || isExternalLink(normalized)) {
        return;
    }

    const directory = path.dirname(markdownPath);
    const isAbsolute = normalized.startsWith("/");
    const candidatePath = isAbsolute
        ? path.resolve(ROOT_DIRECTORY, normalized.replace(/^\/+/, ""))
        : path.resolve(directory, normalized);

    const candidateDirectory = await isDirectory(candidatePath);
    if (candidateDirectory) {
        return;
    }

    try {
        await stat(candidatePath);
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            issues.push({
                file: markdownPath,
                link,
                resolvedPath: candidatePath,
            });
            return;
        }
        throw error;
    }
}

/**
 * @param {string} markdownPath
 * @param {any[]} issues
 */
async function checkFile(markdownPath, issues) {
    const content = await readFile(markdownPath, "utf8");
    const matches = Array.from(content.matchAll(LINK_PATTERN));

    for (const match of matches) {
        const fullMatch = match[0];
        const link = match[1];

        if (LEADING_BANG.test(fullMatch)) {
            continue;
        }

        if (link) {
            await validateLink(markdownPath, link, issues);
        }
    }
}

async function main() {
    /**
     * @type {string | any[]}
     */
    const issues = [];
    for (const directory of DOCS_DIRECTORIES) {
        const absoluteDirectory = path.resolve(ROOT_DIRECTORY, directory);
        const markdownFiles = await collectMarkdownFiles(absoluteDirectory);

        await Promise.all(markdownFiles.map((file) => checkFile(file, issues)));
    }

    if (issues.length > 0) {
        console.error("Broken documentation links detected:\n");
        for (const issue of issues) {
            console.error(
                `• ${issue.file} -> ${issue.link} (resolved path: ${issue.resolvedPath})`
            );
        }
        console.error(
            `\nTotal broken links: ${issues.length}. Please fix the links above.`
        );
        process.exit(1);
    }

    console.log("Documentation link check passed – no broken links found.");
}

try {
    await main();
} catch (error) {
    console.error(
        "Documentation link check failed due to an unexpected error."
    );
    console.error(error);
    process.exit(1);
}
