/**
 * Custom validation for Uptime Watcher documentation patterns
 */
import * as path from "node:path";
import { statSync } from "node:fs";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";

/**
 * @typedef {import("mdast").Root} Root
 *
 * @typedef {import("mdast").Heading} Heading
 *
 * @typedef {import("mdast").Code} Code
 *
 * @typedef {import("mdast").Link} Link
 *
 * @typedef {import("mdast").Text} Text
 *
 * @typedef {import("mdast").Paragraph} Paragraph
 *
 * @typedef {import("vfile").VFile} VFile
 *
 * @typedef {import("unist").Position} Position
 */

/** @typedef {import("unist").Node} UnistNode */

/**
 * Unicode-based emoji detection.
 *
 * Uses the {@link https://unicode.org/reports/tr51/ | Extended_Pictographic}
 * property, which is what modern tooling (including Storybook) relies on for
 * emoji-aware tokenization.
 *
 * @private
 *
 * @type {RegExp}
 */
const EMOJI_CODEPOINT_REGEX = /^(?:\p{Extended_Pictographic})$/u;

/**
 * Check if a single Unicode symbol is an emoji.
 *
 * The input is expected to be a single Unicode symbol (which may span multiple
 * UTF-16 code units).
 *
 * @param {string} symbol - Single Unicode symbol to check
 *
 * @returns {boolean} True if the symbol is classified as an emoji
 */
function isEmoji(symbol) {
    if (symbol.length === 0) return false;
    return EMOJI_CODEPOINT_REGEX.test(symbol);
}

/**
 * Check if a string starts with a capital letter or emoji
 *
 * @param {string} text - Text to check
 *
 * @returns {boolean} True if starts with capital letter or emoji
 */
function startsWithCapitalOrEmoji(text) {
    if (!text || text.length === 0) return false;

    // Remove any markdown formatting first
    const cleanText = text.replace(/^\*\*([^*]+)\*\*/, "$1").trim();

    if (cleanText.length === 0) return false;

    // Use full Unicode symbols so surrogate pairs (e.g. emoji) are handled
    const [firstSymbol = ""] = Array.from(cleanText);

    // Check if first symbol is emoji
    if (isEmoji(firstSymbol)) {
        return true;
    }

    // Check if starts with capital letter
    return /^[A-Z]/.test(cleanText);
}

/**
 * Create a proper remark message with position information
 *
 * @typedef {Position | UnistNode | null | undefined} LintLocation
 */

/**
 * Create a proper remark message with position information
 *
 * @param {VFile} file - Virtual file
 * @param {string} message - Error message
 * @param {LintLocation} location - Node or position
 * @param {string} ruleId - Rule identifier
 */
function createMessage(file, message, location, ruleId) {
    // vfile.message has multiple overloads; cast location to the broader
    // allowed type to keep JSDoc consumers happy while preserving runtime
    // behaviour.
    const msg = /** @type {any} */ (file).message(
        message,
        /** @type {any} */ (location ?? undefined)
    );
    msg.ruleId = ruleId;
    msg.source = "remark-lint";
    return msg;
}

/**
 * Check if file is in ignored patterns for certain rules
 *
 * @param {string} filePath - File path
 * @param {string[]} patterns - Patterns to check against
 *
 * @returns {boolean} True if file matches any pattern
 */
function isIgnoredFile(filePath, patterns) {
    if (!filePath) return false;
    const normalizedPath = filePath.replace(/\\/g, "/");
    return patterns.some((pattern) => normalizedPath.includes(pattern));
}

const INTERNAL_LINK_CODE_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".cts",
    ".mts",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".yaml",
    ".yml",
    ".sql",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".ps1",
    ".psm1",
    ".psd1",
    ".sh",
    ".bash",
    ".zsh",
]);

/**
 * Determine if a relative link points at a directory instead of a markdown
 * file.
 *
 * @param {string} relativeUrl - Relative URL extracted from the markdown link
 * @param {string} sourceFilePath - Absolute path for the current markdown file
 *
 * @returns {boolean} True when the link resolves to a directory
 */
function isDirectoryReference(relativeUrl, sourceFilePath) {
    const sanitizedUrl = relativeUrl.split("#")[0];

    if (!sanitizedUrl || sanitizedUrl.startsWith("#")) {
        return false;
    }

    if (sanitizedUrl.endsWith("/")) {
        return true;
    }

    if (!sourceFilePath) {
        return false;
    }

    const sourceDirectory = path.dirname(sourceFilePath);
    const resolvedTarget = path.resolve(sourceDirectory, sanitizedUrl);

    try {
        return statSync(resolvedTarget).isDirectory();
    } catch {
        return false;
    }
}

/**
 * Check whether a relative URL resolves to an existing file on disk.
 *
 * @param {string} relativeUrl - Relative URL from the markdown file
 * @param {string} sourceFilePath - Absolute or relative path to the markdown
 *   file being linted
 *
 * @returns {boolean} True when the URL resolves to a concrete file
 */
function resolvesToFileTarget(relativeUrl, sourceFilePath) {
    if (!sourceFilePath) {
        return false;
    }

    const sanitizedUrl = relativeUrl.split("#")[0];
    if (!sanitizedUrl || sanitizedUrl.endsWith("/")) {
        return false;
    }

    const sourceDirectory = path.dirname(sourceFilePath);
    const resolvedTarget = path.resolve(sourceDirectory, sanitizedUrl);

    try {
        return statSync(resolvedTarget).isFile();
    } catch {
        return false;
    }
}

/**
 * Determine if a relative link references an allowed non-markdown file.
 *
 * @param {string} relativeUrl - Relative URL without the hash segment
 * @param {string} sourceFilePath - Source markdown file path
 *
 * @returns {boolean} True when the link targets an allowed file type
 */
function hasAllowedInternalLinkTarget(relativeUrl, sourceFilePath) {
    if (!relativeUrl) {
        return false;
    }

    const extension = path.extname(relativeUrl).toLowerCase();
    if (extension === ".md" || extension === ".mdx") {
        return true;
    }

    if (INTERNAL_LINK_CODE_EXTENSIONS.has(extension)) {
        return resolvesToFileTarget(relativeUrl, sourceFilePath);
    }

    return false;
}

/**
 * Determine whether a GitHub link should prefer relative formatting.
 *
 * Only blob/tree/edit/raw paths within the repository are considered
 * convertible.
 *
 * @param {string} urlString - URL taken from the markdown link
 *
 * @returns {boolean} True when the link can be replaced with a relative path
 */
function shouldPreferRelativeGitHubLink(urlString) {
    try {
        const parsed = new URL(urlString);
        const hostname = parsed.hostname.toLowerCase();

        if (!hostname.endsWith("github.com")) {
            return false;
        }

        const segments = parsed.pathname.split("/").filter(Boolean);
        if (segments.length < 3) {
            return false;
        }

        const [
            owner = "",
            repo = "",
            resource = "",
        ] = segments;
        if (
            owner.toLowerCase() !== "nick2bad4u" ||
            repo.toLowerCase() !== "uptime-watcher"
        ) {
            return false;
        }

        const convertibleResources = new Set([
            "blob",
            "tree",
            "edit",
            "raw",
        ]);
        return convertibleResources.has(resource.toLowerCase());
    } catch {
        return false;
    }
}

/**
 * Remark plugin to validate Uptime Watcher specific documentation patterns.
 *
 * @type {import("unified").Plugin<[], Root>}
 */
const validateUptimeWatcherDocs = () => {
    return (tree, file) => {
        const filePath = file.path || "";

        // Front-matter normalization and validation
        visit(tree, "yaml", (/** @type {import("mdast").YAML} */ node) => {
            const rawYaml = typeof node.value === "string" ? node.value : "";
            if (!rawYaml) return;

            // Auto-fix blank lines between array-typed keys and their first item
            const fixedYaml = rawYaml.replace(
                /((?:^|\n)(?:tags|topics|audience):[^\n]*\n)[ \t]*\n([ \t]*- )/gu,
                "$1$2"
            );

            if (fixedYaml !== rawYaml) {
                node.value = fixedYaml;
            }

            const normalizedPath = filePath.replace(/\\/g, "/");
            const isDocFile =
                normalizedPath.includes("docs/Guides/") ||
                normalizedPath.includes("docs/Architecture/") ||
                normalizedPath.includes("docs/Testing/");

            if (!isDocFile) {
                return;
            }

            /** @type {Set<string>} */
            const keys = new Set();
            const lines = fixedYaml.split(/\r?\n/);

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#")) continue;

                const keyMatch = /^(?<key>[\w$]+):\s*/u.exec(trimmed);
                const key = keyMatch?.groups?.["key"];
                if (key) {
                    keys.add(key);
                }
            }

            /** @type {Set<string>} */
            const allowedKeys = new Set([
                "$schema",
                "schema",
                "author",
                "category",
                "created",
                "last_reviewed",
                "summary",
                "tags",
                "title",
                "topics",
                "audience",
                "status",
            ]);

            /** @type {string[]} */
            const unknownKeys = [];
            for (const key of keys) {
                if (!allowedKeys.has(key)) {
                    unknownKeys.push(key);
                }
            }

            if (unknownKeys.length > 0) {
                createMessage(
                    file,
                    `Front-matter contains deprecated or unknown key(s): ${unknownKeys.join(
                        ", "
                    )}. Update to match config/schemas/doc-frontmatter.schema.json.`,
                    node,
                    "frontmatter-schema"
                );
            }

            const schemaMatch =
                /\b(?:schema|\$schema):\s*["']?(?<ref>[^"'\n]+)["']?/u.exec(
                    fixedYaml
                );
            const schemaRef = schemaMatch?.groups?.["ref"];

            if (!schemaRef) {
                createMessage(
                    file,
                    "Front matter should include a 'schema' field pointing to config/schemas/doc-frontmatter.schema.json.",
                    node,
                    "frontmatter-schema-ref"
                );
            } else if (
                !schemaRef.endsWith(
                    "config/schemas/doc-frontmatter.schema.json"
                )
            ) {
                createMessage(
                    file,
                    `'schema' should reference config/schemas/doc-frontmatter.schema.json (received '${schemaRef}').`,
                    node,
                    "frontmatter-schema-ref"
                );
            }
        });

        visit(tree, "heading", (node) => {
            const text = toString(node);

            // Check for proper heading structure patterns
            if (node.depth === 1 && !startsWithCapitalOrEmoji(text)) {
                createMessage(
                    file,
                    `Top-level heading should start with capital letter or emoji: "${text}"`,
                    node,
                    "heading-capitalization"
                );
            }

            // Check for excessive nesting
            if (node.depth > 6) {
                createMessage(
                    file,
                    `Heading nesting too deep (level ${node.depth}). Maximum recommended: 6`,
                    node,
                    "heading-depth-limit"
                );
            }

            // Check for consecutive headings of same level without content
            if (node.depth > 1) {
                const siblings = tree.children;
                const currentIndex = siblings.indexOf(node);
                const nextSibling = siblings[currentIndex + 1];

                const skipHeadingSpacing = isIgnoredFile(filePath, [
                    "ADR_006_STANDARDIZED_CACHE_CONFIGURATION.md",
                    "TECHNOLOGY_EVOLUTION.md",
                    "SUPPORT.md",
                ]);

                if (
                    !skipHeadingSpacing &&
                    nextSibling &&
                    nextSibling.type === "heading" &&
                    nextSibling.depth === node.depth
                ) {
                    createMessage(
                        file,
                        "Consider adding content between consecutive headings of same level",
                        node,
                        "heading-spacing"
                    );
                }
            }

            // Enforce consistent terminology
            const incorrectTerms = {
                "uptime watcher": "Uptime Watcher",
                electron: "Electron",
                typescript: "TypeScript",
                javascript: "JavaScript",
                nodejs: "Node.js",
                "node js": "Node.js",
                github: "GitHub",
                vscode: "VS Code",
                "visual studio code": "VS Code",
                api: "API",
                json: "JSON",
                html: "HTML",
                css: "CSS",
                sql: "SQL",
                xml: "XML",
                yaml: "YAML",
                npm: "npm",
                git: "Git",
                docker: "Docker",
                webpack: "Webpack",
                babel: "Babel",
                eslint: "ESLint",
                prettier: "Prettier",
            };

            const skipTerminologyChecks = isIgnoredFile(filePath, [
                "ESLINT-INSPECTOR-DEPLOYMENT-SUMMARY.md",
                "DOCUSAURUS_SETUP_GUIDE.md",
                "NEW_MONITOR_TYPE_IMPLEMENTATION.md",
                "TECHNOLOGY_EVOLUTION.md",
            ]);

            Object.entries(incorrectTerms).forEach(([wrong, correct]) => {
                if (skipTerminologyChecks) return;
                const lowerText = text.toLowerCase();
                if (lowerText.includes(wrong) && !text.includes(correct)) {
                    // Only flag if the wrong term appears as a whole word
                    const wordBoundaryRegex = new RegExp(
                        `\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                        "i"
                    );
                    if (wordBoundaryRegex.test(text)) {
                        createMessage(
                            file,
                            `Use "${correct}" instead of "${wrong}" in heading`,
                            node,
                            "terminology-consistency"
                        );
                    }
                }
            });

            // Check for overly long headings (keep this strict globally)
            if (text.length > 80) {
                createMessage(
                    file,
                    `Heading is too long (${text.length} characters). Consider shortening to under 80 characters`,
                    node,
                    "heading-length"
                );
            }
        });

        visit(tree, "code", (node) => {
            const skipLongCodeCheck = isIgnoredFile(filePath, [
                "docs/Architecture/ADRs/",
                "docs/Architecture/Templates/",
                "DEVTOOLS_SNIPPETS.md",
                "API_DOCUMENTATION.md",
            ]);

            // Only check substantial code blocks for language specification
            if (node.lang === null && node.value && node.value.length > 20) {
                const hasCodePatterns =
                    /[{}();]|function|class|import|export|const|let|var|if|for|while/.test(
                        node.value
                    );
                if (hasCodePatterns) {
                    createMessage(
                        file,
                        "Code blocks with programming content should specify language",
                        node,
                        "code-language-required"
                    );
                }
            }

            // Check for overly long code blocks
            if (
                !skipLongCodeCheck &&
                node.value &&
                node.value.split("\n").length > 100
            ) {
                createMessage(
                    file,
                    `Code block is very long (${node.value.split("\n").length} lines). Consider breaking into smaller examples`,
                    node,
                    "code-block-length"
                );
            }

            // More lenient check for TypeScript examples - only flag if using 'any' excessively
            const skipAnyUsageCheck = isIgnoredFile(filePath, [
                "DEVELOPMENT_PATTERNS_GUIDE.md",
                "docs/Architecture/Templates/",
            ]);

            if (
                !skipAnyUsageCheck &&
                (node.lang === "typescript" || node.lang === "ts") &&
                node.value
            ) {
                const anyCount = (node.value.match(/\bany\b/g) || []).length;
                const hasDisableComment =
                    node.value.includes("// eslint-disable") ||
                    node.value.includes("// @ts-ignore") ||
                    node.value.includes("// Allow any for") ||
                    node.value.includes("// TODO: type this properly");

                // Only flag if there are multiple 'any' usages without explanation
                if (anyCount > 2 && !hasDisableComment) {
                    createMessage(
                        file,
                        `Consider reducing "any" type usage in TypeScript examples (found ${anyCount} instances)`,
                        node,
                        "typescript-any-usage"
                    );
                }
            }

            // Check for common security anti-patterns in code examples
            if (node.value) {
                const securityPatterns = [
                    {
                        pattern: /password\s*=\s*['"]\w+['"]/,
                        message: "Avoid hardcoded passwords in examples",
                    },
                    {
                        pattern: /api[_-]?key\s*=\s*['"]\w+['"]/,
                        message: "Avoid hardcoded API keys in examples",
                    },
                    {
                        pattern: /secret\s*=\s*['"]\w+['"]/,
                        message: "Avoid hardcoded secrets in examples",
                    },
                    {
                        pattern: /eval\s*\(/,
                        message: "Avoid using eval() in examples",
                    },
                    {
                        pattern: /innerHTML\s*=/,
                        message:
                            "Consider safer alternatives to innerHTML for XSS prevention",
                    },
                ];

                securityPatterns.forEach(({ pattern, message }) => {
                    if (pattern.test(node.value)) {
                        createMessage(file, message, node, "security-pattern");
                    }
                });
            }
        });

        visit(tree, "link", (node) => {
            if (!node.url) return;

            // Check for proper internal link formatting
            if (node.url.startsWith("./") || node.url.startsWith("../")) {
                const urlWithoutHash = node.url.split("#")[0];
                if (
                    urlWithoutHash &&
                    !node.url.includes("#") &&
                    !hasAllowedInternalLinkTarget(urlWithoutHash, filePath) &&
                    !isDirectoryReference(urlWithoutHash, filePath)
                ) {
                    createMessage(
                        file,
                        `Internal link should reference .md file: ${node.url}`,
                        node,
                        "internal-link-format"
                    );
                }
            }

            // Warn about external links that should be relative
            if (shouldPreferRelativeGitHubLink(node.url)) {
                createMessage(
                    file,
                    "Use relative links for internal GitHub references",
                    node,
                    "relative-link-preferred"
                );
            }

            // Check for broken localhost links
            if (
                node.url.includes("localhost") &&
                !isIgnoredFile(filePath, [
                    "test",
                    "example",
                    "demo",
                ])
            ) {
                createMessage(
                    file,
                    "Avoid localhost links in documentation (use examples or placeholders)",
                    node,
                    "localhost-link"
                );
            }

            // Flag missing link text
            const linkText = toString(node);
            if (!linkText || linkText === node.url) {
                createMessage(
                    file,
                    "Links should have descriptive text instead of bare URLs",
                    node,
                    "link-text-required"
                );
            }
        });

        visit(tree, "image", (node) => {
            // Check for missing alt text
            if (!node.alt || node.alt.trim() === "") {
                createMessage(
                    file,
                    "Images should have descriptive alt text for accessibility",
                    node,
                    "image-alt-required"
                );
            }

            // Check for generic alt text
            const genericAltTexts = [
                "image",
                "picture",
                "photo",
                "screenshot",
            ];
            if (
                node.alt &&
                genericAltTexts.includes(node.alt.toLowerCase().trim())
            ) {
                createMessage(
                    file,
                    "Images should have specific, descriptive alt text",
                    node,
                    "image-alt-descriptive"
                );
            }
        });

        visit(tree, "list", (node) => {
            // Check for very long lists
            if (node.children && node.children.length > 20) {
                createMessage(
                    file,
                    `List is very long (${node.children.length} items). Consider breaking into sections`,
                    node,
                    "list-length"
                );
            }
        });

        visit(tree, "table", (node) => {
            // Check for tables without headers
            if (node.children && node.children.length > 0) {
                const firstRow = node.children[0];
                if (
                    firstRow &&
                    !firstRow.children.some((cell) => cell.type === "tableCell")
                ) {
                    createMessage(
                        file,
                        "Tables should have header rows for accessibility",
                        node,
                        "table-header-required"
                    );
                }
            }
        });

        // Check document-level patterns
        visit(tree, "root", () => {
            const content = toString(tree);

            // Ensure architecture docs mention design patterns (more flexible)
            if (filePath.includes("Architecture") && content.length > 500) {
                const hasDesignContent =
                    /\b(pattern|design|architecture|structure|approach|principle)\b/i.test(
                        content
                    );
                if (!hasDesignContent) {
                    createMessage(
                        file,
                        "Architecture documentation should discuss design patterns or architectural approaches",
                        tree,
                        "architecture-content-required"
                    );
                }
            }

            // Ensure guide documents have practical examples (more flexible)
            if (
                filePath.includes("Guides") &&
                content.length > 1000 &&
                !isIgnoredFile(filePath, [
                    "DOCUMENTATION_INDEX.md",
                    "validation-strategy.md",
                ])
            ) {
                const hasCodeBlocks = tree.children.some(
                    (child) => child.type === "code"
                );
                const hasCodeInline = /`[^`]+`/.test(content);
                const hasExamples =
                    /\b(example|demo|sample|usage|how to|tutorial|walkthrough)\b/i.test(
                        content
                    );

                if (!hasCodeBlocks && !hasCodeInline && !hasExamples) {
                    createMessage(
                        file,
                        "Guide documentation should include code examples or practical demonstrations",
                        tree,
                        "guide-examples-required"
                    );
                }
            }

            // Check for TODO/FIXME comments in documentation (less strict: ignore key index and template files)
            const todoIgnorePatterns = [
                "agents.md",
                "AI_CONTEXT.md",
                "DOCUSAURUS_SETUP_GUIDE.md",
                "NEW_MONITOR_TYPE_IMPLEMENTATION.md",
                "TOOLS_AND_COMMANDS_GUIDE.md",
                "CODEGEN_TEMPLATE_USAGE.md",
                "README.md",
            ];

            if (
                !isIgnoredFile(filePath, todoIgnorePatterns) &&
                /\b(TODO|FIXME|HACK|XXX)\b/i.test(content)
            ) {
                createMessage(
                    file,
                    "Documentation contains TODO/FIXME comments that should be resolved",
                    tree,
                    "todo-comments"
                );
            }

            // Ensure README files have proper structure (less strict for some internal docs)
            const readmeStructureIgnorePatterns = [
                "README.md",
                "docs/Architecture/README.md",
                "docs/docusaurus/README.md",
                "docs/Guides/README.md",
            ];

            if (
                filePath.includes("README.md") &&
                !isIgnoredFile(filePath, readmeStructureIgnorePatterns)
            ) {
                const hasInstallation =
                    /\b(install|installation|setup)\b/i.test(content);
                const hasUsage = /\b(usage|how to use|getting started)\b/i.test(
                    content
                );

                if (!hasInstallation || !hasUsage) {
                    createMessage(
                        file,
                        "README files should include installation and usage sections",
                        tree,
                        "readme-structure"
                    );
                }
            }

            // Check for very short documents that might be incomplete
            if (
                content.length < 100 &&
                !isIgnoredFile(filePath, ["index", "template"])
            ) {
                createMessage(
                    file,
                    "Document appears to be very short. Consider adding more content",
                    tree,
                    "document-length"
                );
            }
        });
    };
};

export default validateUptimeWatcherDocs;
