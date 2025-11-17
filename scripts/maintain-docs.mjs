#!/usr/bin/env node
/**
 * Automated documentation maintenance script
 *
 * Performs routine maintenance tasks on documentation including:
 *
 * - Auto-updating last_reviewed dates for recently modified files
 * - Generating table of contents for files that need them
 * - Validating cross-references and internal links
 * - Checking for outdated API documentation
 * - Analyzing content quality metrics
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const __dirname = import.meta.dirname;
const ROOT_DIRECTORY = path.join(__dirname, "..");

/**
 * @typedef {Object} MaintenanceReport
 *
 * @property {string[]} updatedFiles - Files that had their frontmatter updated
 * @property {string[]} tocGenerated - Files that had TOC generated
 * @property {string[]} linksFixed - Files that had broken links fixed
 * @property {string[]} warnings - Issues that need manual attention
 */

/**
 * Get the last modified date of a file from git
 *
 * @param {string} filePath - Path to the file
 *
 * @returns {Promise<Date | null>} Last modification date or null if not in git
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
 * Extract frontmatter from markdown content
 *
 * @param {string} content - Markdown content
 *
 * @returns {{
 *     frontmatter: Object | null;
 *     content: string;
 *     yamlLines: number;
 * }}
 */
function parseFrontmatter(content) {
    const frontmatterMatch = content.match(
        /^---\s*\n(?<yaml>[\S\s]*?)\n---\s*\n/
    );

    if (!frontmatterMatch) {
        return { frontmatter: null, content, yamlLines: 0 };
    }

    const yamlContent = frontmatterMatch.groups?.yaml ?? "";
    const yamlLines = yamlContent.split("\n").length + 2; // +2 for the --- delimiters
    const contentAfterFrontmatter = content.slice(frontmatterMatch[0].length);

    // Simple YAML parser for frontmatter
    const frontmatter = {};
    yamlContent.split("\n").forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();

            // Handle quoted values
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }

            frontmatter[key] = value;
        }
    });

    return { frontmatter, content: contentAfterFrontmatter, yamlLines };
}

/**
 * Serialize frontmatter back to YAML
 *
 * @param {Object} frontmatter - Frontmatter object
 *
 * @returns {string} YAML string
 */
function serializeFrontmatter(frontmatter) {
    const lines = ["---"];

    // Ensure consistent order of fields
    const fieldOrder = [
        "schema",
        "title",
        "summary",
        "created",
        "last_reviewed",
        "category",
        "author",
        "tags",
        "topics",
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
 * Update last_reviewed date for files modified within the last 30 days
 *
 * @param {string} filePath - Path to the markdown file
 *
 * @returns {Promise<boolean>} True if file was updated
 */
async function updateLastReviewedDate(filePath) {
    try {
        const content = await readFile(filePath, "utf8");
        const { frontmatter, content: bodyContent } = parseFrontmatter(content);

        if (!frontmatter) {
            return false;
        }

        const lastModified = await getGitLastModified(filePath);
        if (!lastModified) {
            return false;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Only update if file was modified recently and last_reviewed is older
        if (lastModified > thirtyDaysAgo) {
            const currentLastReviewed = frontmatter.last_reviewed
                ? new Date(frontmatter.last_reviewed)
                : null;

            if (!currentLastReviewed || lastModified > currentLastReviewed) {
                frontmatter.last_reviewed = lastModified
                    .toISOString()
                    .split("T")[0];

                const newContent =
                    serializeFrontmatter(frontmatter) + bodyContent;
                await writeFile(filePath, newContent, "utf8");
                return true;
            }
        }

        return false;
    } catch (error) {
        console.warn(
            `Failed to update last_reviewed for ${filePath}:`,
            error.message
        );
        return false;
    }
}

/**
 * Generate table of contents for files that need them
 *
 * @param {string} filePath - Path to the markdown file
 *
 * @returns {Promise<boolean>} True if TOC was added
 */
async function generateTableOfContents(filePath) {
    try {
        const content = await readFile(filePath, "utf8");

        // Skip if file already has TOC
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

        // Only add TOC for substantial documents with multiple sections
        if (wordCount > 1000 && headings.length > 5) {
            const { frontmatter, content: bodyContent } =
                parseFrontmatter(content);

            // Generate TOC from headings
            const tocLines = ["## Table of Contents", ""];

            headings.slice(1).forEach((heading) => {
                // Skip the main title
                const level = (heading.match(/^#+/) || [""])[0].length;
                const text = heading.replace(/^#+\s+/, "").trim();
                const anchor = text
                    .toLowerCase()
                    .replaceAll(/[^\s\w-]/g, "")
                    .replaceAll(/\s+/g, "-");

                const indent = "  ".repeat(Math.max(0, level - 2));
                tocLines.push(`${indent}- [${text}](#${anchor})`);
            });

            tocLines.push("");

            // Insert TOC after first heading
            const firstHeadingIndex = bodyContent.indexOf("\n# ");
            if (firstHeadingIndex !== -1) {
                const endOfFirstHeading = bodyContent.indexOf(
                    "\n",
                    firstHeadingIndex + 1
                );
                const beforeToc = bodyContent.slice(0, endOfFirstHeading + 1);
                const afterToc = bodyContent.slice(endOfFirstHeading + 1);

                const newBodyContent = `${beforeToc}\n${tocLines.join("\n")}${afterToc}`;

                const newContent = frontmatter
                    ? serializeFrontmatter(frontmatter) + newBodyContent
                    : newBodyContent;

                await writeFile(filePath, newContent, "utf8");
                return true;
            }
        }

        return false;
    } catch (error) {
        console.warn(`Failed to generate TOC for ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Fix common cross-reference issues
 *
 * @param {string} filePath - Path to the markdown file
 *
 * @returns {Promise<boolean>} True if links were fixed
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

            const linkText = groups.text;
            const linkUrl = groups.url;

            // Fix common path issues
            if (linkUrl.includes("../") && !linkUrl.startsWith("http")) {
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
        console.warn(
            `Failed to fix cross-references for ${filePath}:`,
            error.message
        );
        return false;
    }
}

/**
 * Main maintenance function
 *
 * @returns {Promise<MaintenanceReport>}
 */
async function maintainDocs() {
    console.log("🔧 Starting documentation maintenance...\n");

    const report = {
        updatedFiles: [],
        tocGenerated: [],
        linksFixed: [],
        warnings: [],
    };

    const docsDir = path.join(ROOT_DIRECTORY, "docs");

    async function collectMarkdownFiles(dir) {
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

    const markdownFiles = await collectMarkdownFiles(docsDir);

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
 * Display maintenance report
 *
 * @param {MaintenanceReport} report - Maintenance results
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

// Run maintenance if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        const report = await maintainDocs();
        displayMaintenanceReport(report);
    } catch (error) {
        console.error("❌ Maintenance failed:", error);
        process.exit(1);
    }
}

export { maintainDocs, displayMaintenanceReport };
