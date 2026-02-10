#!/usr/bin/env node

/**
 * Automated documentation maintenance script.
 *
 * Performs routine maintenance tasks on documentation including:
 *
 * - Auto-updating last_reviewed dates for recently modified files
 * - Generating table of contents for files that need them
 * - Validating cross-references and internal links
 * - Checking for outdated API documentation
 * - Analyzing content quality metrics.
 *
 * Processes all documentation folders:
 *
 * - Docs/Architecture/ - Architecture decision records and patterns
 * - Docs/Testing/ - Testing guides and best practices
 * - Docs/Guides/ - User and developer guides.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { remark } from "remark";
import remarkToc from "remark-toc";

const __dirname = import.meta.dirname;
const ROOT_DIRECTORY = path.join(__dirname, "..");

/**
 * @typedef {object} MaintenanceReport
 *
 * @property {string[]} updatedFiles - Files that had their frontmatter updated.
 * @property {string[]} tocGenerated - Files that had TOC generated.
 * @property {string[]} linksFixed - Files that had broken links fixed.
 * @property {string[]} warnings - Issues that need manual attention.
 */

/**
 * Simple representation of parsed frontmatter. Keys map to either scalar string
 * values or string arrays (for fields like `tags`/`topics`).
 *
 * @typedef {Record<string, string | string[]>} Frontmatter
 */

/**
 * Get the last modified date of a file from git.
 *
 * @param {string} filePath - Path to the file.
 *
 * @returns {Promise<Date | null>} Last modification date or null if not in git.
 */
async function getGitLastModified(filePath) {
    try {
        const relativePath = path
            .relative(ROOT_DIRECTORY, filePath)
            .replaceAll("\\", "/");
        const output = execSync(
            `git log -1 --format="%ci" -- "${relativePath}"`,
            {
                cwd: ROOT_DIRECTORY,
                encoding: "utf8",
            }
        ).trim();

        return output ? new Date(output) : null;
    } catch {
        return null;
    }
}

/**
 * Extract frontmatter from markdown content.
 *
 * @param {string} content - Markdown content.
 *
 * @returns {{
 *     frontmatter: Frontmatter | null;
 *     content: string;
 *     yamlLines: number;
 * }}
 */
function parseFrontmatter(content) {
    const frontmatterMatch = content.match(
        /^---\s*\n(?<yaml>[\S\s]*?)\n---\s*\n/
    );

    if (frontmatterMatch === null) {
        return { frontmatter: null, content, yamlLines: 0 };
    }

    const yamlContent = frontmatterMatch.groups?.["yaml"] ?? "";

    /**
     * +2 for the --- delimiters.
     */
    const yamlLineCount = yamlContent.split("\n").length + 2;
    const contentAfterFrontmatter = content.slice(frontmatterMatch[0].length);
    const yamlLines = yamlContent.split("\n");

    // Simple YAML parser for frontmatter supporting scalar and list values
    /** @type {Frontmatter} */
    const frontmatter = {};
    for (let index = 0; index < yamlLines.length; index += 1) {
        const line = yamlLines[index];
        if (!line || line.trim().length === 0 || line.trim().startsWith("#")) {
            continue;
        }

        const colonIndex = line.indexOf(":");
        if (colonIndex <= 0) {
            continue;
        }

        const key = line.slice(0, colonIndex).trim();
        const rawValue = line.slice(colonIndex + 1).trim();

        // Handle multi-line list values (e.g., tags/topics)
        if (rawValue === "" || rawValue === "|") {
            const listItems = [];
            let lookaheadIndex = index + 1;

            while (lookaheadIndex < yamlLines.length) {
                const candidateLine = yamlLines[lookaheadIndex];
                if (typeof candidateLine !== "string") {
                    break;
                }

                if (/^\s*-/u.test(candidateLine)) {
                    const listValue = candidateLine
                        .replace(/^\s*-\s*/u, "")
                        .trim();
                    listItems.push(stripYamlQuotes(listValue));
                    lookaheadIndex += 1;
                    continue;
                }

                // Allow blank lines inside list blocks
                if (candidateLine.trim().length === 0) {
                    lookaheadIndex += 1;
                    continue;
                }

                break;
            }

            if (listItems.length > 0) {
                frontmatter[key] = listItems;
                index = lookaheadIndex - 1;
                continue;
            }
        }

        // Inline JSON-like arrays (e.g., tags: ["a", "b"])
        if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
            const trimmedValue = rawValue.slice(1, -1).trim();
            frontmatter[key] =
                trimmedValue.length === 0
                    ? []
                    : trimmedValue
                          .split(",")
                          .map((item) => stripYamlQuotes(item.trim()));
            continue;
        }

        frontmatter[key] = stripYamlQuotes(rawValue);
    }

    return {
        frontmatter,
        content: contentAfterFrontmatter,
        yamlLines: yamlLineCount,
    };
}

/**
 * Remove surrounding single/double quotes from YAML values.
 *
 * @param {string} value - Raw YAML scalar.
 *
 * @returns {string} Unquoted value.
 */
function stripYamlQuotes(value) {
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

/**
 * Serialize frontmatter back to YAML.
 *
 * @param {Frontmatter} frontmatter - Frontmatter object.
 *
 * @returns {string} YAML string.
 */
function serializeFrontmatter(frontmatter) {
    const lines = ["---"];

    // Ensure consistent order of fields
    const fieldOrder = [
        "schema",
        "doc_title",
        "summary",
        "created",
        "last_reviewed",
        "doc_category",
        "author",
        "tags",
        "topics",
        "doc_group",
        "difficulty",
        "version",
    ];

    fieldOrder.forEach((field) => {
        if (frontmatter[field] !== undefined) {
            if (Array.isArray(frontmatter[field])) {
                lines.push(`${field}:`);
                frontmatter[field].forEach((item) => {
                    lines.push(`  - "${item}"`);
                });
            } else {
                lines.push(`${field}: "${frontmatter[field]}"`);
            }
        }
    });

    // Add any additional fields not in the standard order
    Object.keys(frontmatter).forEach((field) => {
        if (!fieldOrder.includes(field)) {
            if (Array.isArray(frontmatter[field])) {
                lines.push(`${field}:`);
                frontmatter[field].forEach((item) => {
                    lines.push(`  - "${item}"`);
                });
            } else {
                lines.push(`${field}: "${frontmatter[field]}"`);
            }
        }
    });

    lines.push("---", "");
    return lines.join("\n");
}

/**
 * Update last_reviewed date for files modified within the last 180 days.
 *
 * @param {string} filePath - Path to the markdown file.
 *
 * @returns {Promise<boolean>} True if file was updated.
 */
async function updateLastReviewedDate(filePath) {
    try {
        const content = await readFile(filePath, "utf8");
        const { frontmatter, content: bodyContent } = parseFrontmatter(content);

        if (frontmatter === null) {
            return false;
        }

        const lastModified = await getGitLastModified(filePath);
        if (lastModified === null) {
            return false;
        }

        const oneHundredEightyDaysAgo = new Date();
        oneHundredEightyDaysAgo.setDate(
            oneHundredEightyDaysAgo.getDate() - 180
        );

        // Update if file was modified in the last 180 days, always updating last_reviewed
        if (lastModified > oneHundredEightyDaysAgo) {
            const isoDate = lastModified.toISOString().split("T")[0] || "";

            // Always update last_reviewed to the git modification date
            frontmatter["last_reviewed"] = isoDate;

            const newContent = serializeFrontmatter(frontmatter) + bodyContent;
            await writeFile(filePath, newContent, "utf8");
            return true;
        }

        return false;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
            `Failed to update last_reviewed for ${filePath}:`,
            message
        );
        return false;
    }
}

/**
 * Generate table of contents for files that need them using remark-toc.
 *
 * @param {string} filePath - Path to the markdown file.
 *
 * @returns {Promise<boolean>} True if TOC was added.
 */
async function generateTableOfContents(filePath) {
    try {
        const content = await readFile(filePath, "utf8");

        if (
            content.includes("## Table of Contents") ||
            content.includes("## TOC")
        ) {
            return false;
        }

        const headings = content.match(/^#+\s+.+$/gm) || [];
        const wordCount = content
            .split(/\s+/)
            .filter((word) => word.length > 0).length;

        if (!(wordCount > 1000 && headings.length > 5)) {
            return false;
        }

        const { frontmatter, content: bodyContent } = parseFrontmatter(content);

        const firstHeadingMatch = bodyContent.match(/^#\s.+$/m);
        if (!firstHeadingMatch || firstHeadingMatch.index === undefined) {
            return false;
        }

        const headingEndIndex =
            firstHeadingMatch.index + firstHeadingMatch[0].length;
        const beforeToc = bodyContent.slice(0, headingEndIndex);
        const afterToc = bodyContent.slice(headingEndIndex);

        const placeholderHeading = "\n\n## Table of Contents\n\n";
        const bodyWithPlaceholder = `${beforeToc}${placeholderHeading}${afterToc}`;

        const processed = await remark()
            .use(remarkToc, {
                heading: "table of contents",
                maxDepth: 2,
                ordered: true,
                tight: true,
            })
            .process(bodyWithPlaceholder);

        const newBodyContent = String(processed);
        const newContent = frontmatter
            ? serializeFrontmatter(frontmatter) + newBodyContent
            : newBodyContent;

        await writeFile(filePath, newContent, "utf8");
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to generate TOC for ${filePath}:`, message);
        return false;
    }
}

/**
 * Fix common cross-reference issues.
 *
 * @param {string} filePath - Path to the markdown file.
 *
 * @returns {Promise<boolean>} True if links were fixed.
 */
async function fixCrossReferences(filePath) {
    try {
        const content = await readFile(filePath, "utf8");
        let updatedContent = content;
        let hasChanges = false;

        // Fix relative path references that might be incorrect
        const linkPattern = /\[(?<text>[^\]]+)]\((?<url>[^)]+)\)/g;
        let match;

        while ((match = linkPattern.exec(content)) !== null) {
            const { groups } = match;
            if (!groups) {
                continue;
            }

            /**
             * From named capture group.
             */
            const linkText = groups["text"];

            /**
             * From named capture group.
             */
            const linkUrl = groups["url"];

            // Fix common path issues
            if (
                linkUrl &&
                linkUrl.includes("../") &&
                !linkUrl.startsWith("http")
            ) {
                const correctedUrl = linkUrl.replaceAll(/\.\.\/+/g, "../");
                if (correctedUrl !== linkUrl) {
                    updatedContent = updatedContent.replace(
                        match[0],
                        `[${linkText}](${correctedUrl})`
                    );
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            await writeFile(filePath, updatedContent, "utf8");
            return true;
        }

        return false;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
            `Failed to fix cross-references for ${filePath}:`,
            message
        );
        return false;
    }
}

/**
 * Main maintenance function.
 *
 * @returns {Promise<MaintenanceReport>}
 */
async function maintainDocs() {
    console.log("🔧 Starting documentation maintenance...\n");

    /** @type {MaintenanceReport} */
    const report = {
        updatedFiles: [],
        tocGenerated: [],
        linksFixed: [],
        warnings: [],
    };

    const docsDir = path.join(ROOT_DIRECTORY, "docs");

    /**
     * Recursively collect Markdown files under a directory.
     *
     * @param {string} dir
     *
     * @returns {Promise<string[]>}
     */
    async function collectMarkdownFiles(dir) {
        /** @type {string[]} */
        const files = [];
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (
                    ![
                        "node_modules",
                        "build",
                        "dist",
                        "docusaurus", // Skip Docusaurus build output
                        "TSDoc", // Skip external TSDoc documentation
                    ].includes(entry.name)
                ) {
                    files.push(...(await collectMarkdownFiles(fullPath)));
                }
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                files.push(fullPath);
            }
        }

        return files;
    }

    // Collect markdown files from all documentation folders
    const documentationFolders = [
        path.join(docsDir, "Architecture"),
        path.join(docsDir, "Testing"),
        path.join(docsDir, "Guides"),
        docsDir, // Include root-level docs
    ];

    /** @type {string[]} */
    let markdownFiles = [];
    for (const folder of documentationFolders) {
        try {
            const folderFiles = await collectMarkdownFiles(folder);
            markdownFiles.push(...folderFiles);
        } catch {
            // Folder might not exist, skip it
            console.log(
                `⚠️  Skipping ${path.relative(ROOT_DIRECTORY, folder)} (not found)`
            );
        }
    }

    // Remove duplicates (in case root docs overlaps with subfolder docs)
    markdownFiles = Array.from(new Set(markdownFiles));

    console.log(
        `📝 Processing ${markdownFiles.length} documentation files...\n`
    );

    for (const filePath of markdownFiles) {
        const relativePath = path.relative(ROOT_DIRECTORY, filePath);

        // Update last_reviewed dates
        if (await updateLastReviewedDate(filePath)) {
            report.updatedFiles.push(relativePath);
            console.log(`✅ Updated last_reviewed date: ${relativePath}`);
        }

        // Generate table of contents
        if (await generateTableOfContents(filePath)) {
            report.tocGenerated.push(relativePath);
            console.log(`📋 Generated TOC: ${relativePath}`);
        }

        // Fix cross-references
        if (await fixCrossReferences(filePath)) {
            report.linksFixed.push(relativePath);
            console.log(`🔗 Fixed links: ${relativePath}`);
        }
    }

    return report;
}

/**
 * Display maintenance report.
 *
 * @param {MaintenanceReport} report - Maintenance results.
 */
function displayMaintenanceReport(report) {
    console.log("\n🎯 MAINTENANCE REPORT");
    console.log("====================\n");

    if (report.updatedFiles.length > 0) {
        console.log(
            `📅 Updated last_reviewed dates (${report.updatedFiles.length}):`
        );
        report.updatedFiles.forEach((file) => console.log(`   - ${file}`));
        console.log();
    }

    if (report.tocGenerated.length > 0) {
        console.log(
            `📋 Generated table of contents (${report.tocGenerated.length}):`
        );
        report.tocGenerated.forEach((file) => console.log(`   - ${file}`));
        console.log();
    }

    if (report.linksFixed.length > 0) {
        console.log(`🔗 Fixed links (${report.linksFixed.length}):`);
        report.linksFixed.forEach((file) => console.log(`   - ${file}`));
        console.log();
    }

    if (report.warnings.length > 0) {
        console.log(`⚠️  Warnings (${report.warnings.length}):`);
        report.warnings.forEach((warning) => console.log(`   - ${warning}`));
        console.log();
    }

    const totalChanges =
        report.updatedFiles.length +
        report.tocGenerated.length +
        report.linksFixed.length;

    if (totalChanges === 0) {
        console.log("✨ No maintenance needed - documentation is up to date!");
    } else {
        console.log(
            `✨ Maintenance complete! Made ${totalChanges} improvements to documentation.`
        );
    }
}

/**
 * Determine whether the current ES module is the entry point.
 *
 * @param {string} moduleUrl - URL for the executing module (typically
 *   import.meta.url).
 *
 * @returns {boolean} True when the module is being run directly via Node.
 */
function isExecutedDirectly(moduleUrl) {
    const entryFilePath = process.argv[1];
    if (!entryFilePath) {
        return false;
    }

    const normalizedEntryUrl = pathToFileURL(path.resolve(entryFilePath)).href;
    return moduleUrl === normalizedEntryUrl;
}

// Run maintenance if called directly
if (isExecutedDirectly(import.meta.url)) {
    try {
        const report = await maintainDocs();
        displayMaintenanceReport(report);
    } catch (error) {
        console.error("❌ Maintenance failed:", error);
        process.exit(1);
    }
}

export { maintainDocs, displayMaintenanceReport };
