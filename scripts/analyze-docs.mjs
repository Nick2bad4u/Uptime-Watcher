#!/usr/bin/env node
/**
 * Documentation analytics and health checking script
 *
 * Provides insights into documentation quality, coverage, and maintenance needs
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const __dirname = import.meta.dirname;
const ROOT_DIRECTORY = path.join(__dirname, "..");

/**
 * @typedef {Object} DocumentationStats
 *
 * @property {number} totalFiles - Total markdown files analyzed
 * @property {number} totalWords - Total word count across all files
 * @property {number} averageReadingTime - Average reading time in minutes
 * @property {string[]} missingFrontmatter - Files without proper frontmatter
 * @property {string[]} outdatedDocs - Files not reviewed recently
 * @property {Object<string, number>} complexityScore - Complexity metrics per
 *   file
 * @property {Object<string, number>} wordCounts - Word count per file
 * @property {string[]} missingTOC - Files that should have table of contents
 * @property {Object<string, string[]>} brokenLinks - Files with potential
 *   broken internal links
 */

/**
 * Recursively collect all markdown files in documentation directories
 *
 * @param {string} dir - Directory to scan
 *
 * @returns {Promise<string[]>} Array of file paths
 */
async function collectMarkdownFiles(dir) {
    const files = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules and build directories
            if (
                ![
                    "node_modules",
                    "build",
                    "dist",
                    ".git",
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

/**
 * Extract and parse YAML frontmatter from markdown content
 *
 * @param {string} content - Markdown file content
 *
 * @returns {Object | null} Parsed frontmatter or null if not found
 */
function extractFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\s*\n(?<yaml>[\S\s]*?)\n---/);
    if (!frontmatterMatch) return null;

    try {
        // Simple YAML parser for basic frontmatter
        const yamlContent = frontmatterMatch.groups?.yaml ?? "";
        const frontmatter = {};

        yamlContent.split("\n").forEach((line) => {
            const colonIndex = line.indexOf(":");
            if (colonIndex > 0) {
                const key = line.slice(0, colonIndex).trim();
                const value = line
                    .slice(colonIndex + 1)
                    .trim()
                    .replaceAll(/^["']|["']$/g, "");
                frontmatter[key] = value;
            }
        });

        return frontmatter;
    } catch {
        return null;
    }
}

/**
 * Calculate complexity score based on various factors
 *
 * @param {string} content - Markdown content
 *
 * @returns {number} Complexity score (1-10)
 */
function calculateComplexity(content) {
    let score = 1;

    // Code blocks increase complexity
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    score += Math.min(codeBlocks * 0.5, 3);

    // Number of headings indicates structure complexity
    const headings = (content.match(/^#+\s/gm) || []).length;
    score += Math.min(headings * 0.2, 2);

    // Technical terms increase complexity
    const technicalTerms = [
        "TypeScript",
        "Electron",
        "API",
        "interface",
        "async",
        "await",
        "Promise",
        "Observable",
        "dependency injection",
        "architecture",
    ];

    const foundTerms = technicalTerms.filter((term) =>
        content.toLowerCase().includes(term.toLowerCase())
    );
    score += Math.min(foundTerms.length * 0.3, 3);

    // Length affects complexity
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 2000) score += 1;
    if (wordCount > 5000) score += 1;

    return Math.min(Math.round(score), 10);
}

/**
 * Check for broken internal links
 *
 * @param {string} content - Markdown content
 * @param {string} filePath - Current file path
 * @param {string[]} allFiles - All markdown files in the project
 *
 * @returns {string[]} Array of potentially broken links
 */
function checkInternalLinks(content, filePath, allFiles) {
    const brokenLinks = [];
    const linkPattern = /\[(?<text>[^\]]+)]\((?<url>[^)]+)\)/g;
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
        const { groups } = match;
        if (!groups) continue;

        const linkUrl = groups.url;

        // Check internal relative links
        if (linkUrl.startsWith("./") || linkUrl.startsWith("../")) {
            const resolvedPath = path.join(
                filePath,
                "..",
                linkUrl.split("#")[0]
            );
            const relativePath = path.relative(ROOT_DIRECTORY, resolvedPath);

            if (
                !allFiles.some(
                    (file) =>
                        path.relative(ROOT_DIRECTORY, file) === relativePath
                )
            ) {
                brokenLinks.push(linkUrl);
            }
        }
    }

    return brokenLinks;
}

/**
 * Main analysis function
 *
 * @returns {Promise<DocumentationStats>}
 */
async function analyzeDocumentation() {
    console.log("🔍 Analyzing documentation...\n");

    const docsDir = path.join(ROOT_DIRECTORY, "docs");
    const markdownFiles = await collectMarkdownFiles(docsDir);

    const stats = {
        totalFiles: markdownFiles.length,
        totalWords: 0,
        averageReadingTime: 0,
        missingFrontmatter: [],
        outdatedDocs: [],
        complexityScore: {},
        wordCounts: {},
        missingTOC: [],
        brokenLinks: {},
    };

    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    for (const filePath of markdownFiles) {
        const content = await readFile(filePath, "utf8");
        const relativePath = path.relative(ROOT_DIRECTORY, filePath);

        // Word count analysis
        const words = content
            .replaceAll(/```[\S\s]*?```/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 0);
        const wordCount = words.length;
        stats.totalWords += wordCount;
        stats.wordCounts[relativePath] = wordCount;

        // Frontmatter analysis
        const frontmatter = extractFrontmatter(content);
        if (frontmatter) {
            // Check if documentation is outdated
            const lastReviewed =
                frontmatter.last_reviewed || frontmatter.last_updated;
            if (lastReviewed) {
                const reviewDate = new Date(lastReviewed);
                if (reviewDate < threeMonthsAgo) {
                    stats.outdatedDocs.push(relativePath);
                }
            }
        } else {
            stats.missingFrontmatter.push(relativePath);
        }

        // Complexity analysis
        stats.complexityScore[relativePath] = calculateComplexity(content);

        // TOC analysis (for longer documents)
        if (
            wordCount > 1000 &&
            !content.includes("## Table of Contents") &&
            !content.includes("## TOC")
        ) {
            const headingCount = (content.match(/^#+\s/gm) || []).length;
            if (headingCount > 5) {
                stats.missingTOC.push(relativePath);
            }
        }

        // Link analysis
        const brokenLinks = checkInternalLinks(
            content,
            filePath,
            markdownFiles
        );
        if (brokenLinks.length > 0) {
            stats.brokenLinks[relativePath] = brokenLinks;
        }
    }

    stats.averageReadingTime = Math.round(
        stats.totalWords / stats.totalFiles / 200
    );

    return stats;
}

/**
 * Generate and display analysis report
 *
 * @param {DocumentationStats} stats - Analysis results
 */
function displayReport(stats) {
    console.log("📊 DOCUMENTATION ANALYSIS REPORT");
    console.log("================================\n");

    // Overview
    console.log("📈 Overview:");
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Total words: ${stats.totalWords.toLocaleString()}`);
    console.log(
        `   Average reading time: ${stats.averageReadingTime} minutes per document\n`
    );

    // Quality Issues
    console.log("⚠️  Quality Issues:");
    if (stats.missingFrontmatter.length > 0) {
        console.log(
            `   Missing frontmatter (${stats.missingFrontmatter.length}):`
        );
        stats.missingFrontmatter.forEach((file) =>
            console.log(`     - ${file}`)
        );
        console.log();
    }

    if (stats.outdatedDocs.length > 0) {
        console.log(`   Outdated docs (${stats.outdatedDocs.length}):`);
        stats.outdatedDocs.forEach((file) => console.log(`     - ${file}`));
        console.log();
    }

    if (stats.missingTOC.length > 0) {
        console.log(
            `   Missing table of contents (${stats.missingTOC.length}):`
        );
        stats.missingTOC.forEach((file) => console.log(`     - ${file}`));
        console.log();
    }

    // Broken links
    if (Object.keys(stats.brokenLinks).length > 0) {
        console.log(`   Broken internal links:`);
        Object.entries(stats.brokenLinks).forEach(([file, links]) => {
            console.log(`     ${file}:`);
            links.forEach((link) => console.log(`       - ${link}`));
        });
        console.log();
    }

    // Complexity analysis
    console.log("🧠 Complexity Analysis:");
    const complexFiles = Object.entries(stats.complexityScore)
        .filter(([, score]) => score >= 7)
        .toSorted(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (complexFiles.length > 0) {
        console.log("   Most complex documents:");
        complexFiles.forEach(([file, score]) => {
            console.log(`     - ${file} (complexity: ${score}/10)`);
        });
    }
    console.log();

    // Recommendations
    console.log("💡 Recommendations:");
    const totalIssues =
        stats.missingFrontmatter.length +
        stats.outdatedDocs.length +
        stats.missingTOC.length +
        Object.keys(stats.brokenLinks).length;

    if (totalIssues === 0) {
        console.log("   ✅ Documentation looks great! No issues found.");
    } else {
        console.log(
            `   📝 ${totalIssues} issues found that should be addressed:`
        );
        if (stats.missingFrontmatter.length > 0) {
            console.log("     - Add frontmatter to files missing it");
        }
        if (stats.outdatedDocs.length > 0) {
            console.log("     - Review and update outdated documentation");
        }
        if (stats.missingTOC.length > 0) {
            console.log("     - Add table of contents to longer documents");
        }
        if (Object.keys(stats.brokenLinks).length > 0) {
            console.log("     - Fix broken internal links");
        }
    }

    console.log(
        `\n🎯 Overall Documentation Health: ${
            totalIssues < 5
                ? "🟢 Excellent"
                : totalIssues < 15
                  ? "🟡 Good"
                  : "🔴 Needs Attention"
        }`
    );
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        const stats = await analyzeDocumentation();
        displayReport(stats);
    } catch (error) {
        console.error("❌ Analysis failed:", error);
        process.exit(1);
    }
}

export { analyzeDocumentation, displayReport };
