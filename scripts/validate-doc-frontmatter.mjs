#!/usr/bin/env node

/**
 * Front-matter validator for Markdown documentation.
 *
 * Scans documentation directories and validates the YAML front-matter block of
 * each Markdown file against the shared JSON Schema
 * `config/schemas/doc-frontmatter.schema.json`.
 *
 * The validator is intentionally lightweight and tailored to the
 * `doc-frontmatter` schema – it does not attempt to implement a full JSON
 * Schema engine. Instead, it enforces:
 *
 * - Presence of a front-matter block at the top of each file
 * - Required fields: `schema`, `author`, `doc_category`, `doc_title`, `created`,
 *   `last_reviewed`, `summary`, `tags`
 * - Allowed keys only (no deprecated/unknown fields)
 * - Basic type and format checks (arrays vs strings, date formats, enums)
 * - `schema` value points at the doc-frontmatter schema file.
 */

import { readFile, readdir } from "node:fs/promises";
import * as path from "node:path";
const __dirname = import.meta.dirname;
const ROOT_DIRECTORY = path.resolve(__dirname, "..");

/** @type {readonly string[]} */
const DOC_DIRECTORIES = [
    "docs/Guides",
    "docs/Architecture",
    "docs/Testing",
];

/**
 * Certain Markdown files are intentionally generated or use a different
 * metadata format and are excluded from front-matter validation.
 *
 * @type {readonly string[]}
 */
const IGNORED_PATH_SUBSTRINGS = [
    "docs/Architecture/generated/IPC_CHANNEL_INVENTORY.md",
];

const FRONTMATTER_SCHEMA_PATH = path.resolve(
    ROOT_DIRECTORY,
    "config/schemas/doc-frontmatter.schema.json"
);

/**
 * @typedef {Record<string, unknown>} JsonObject
 */

/**
 * @param {string} filePath
 */
function isIgnoredPath(filePath) {
    const normalized = filePath.replaceAll("\\", "/");
    return IGNORED_PATH_SUBSTRINGS.some((substring) =>
        normalized.endsWith(substring)
    );
}

/**
 * Recursively collects Markdown files under the given directory.
 *
 * @param {string} startDirectory
 *
 * @returns {Promise<string[]>}
 */
async function collectMarkdownFiles(startDirectory) {
    const results = [];
    const stack = [startDirectory];

    while (stack.length > 0) {
        const current = stack.pop();
        if (current === undefined) {
            continue;
        }

        const entries = await readdir(current, { withFileTypes: true });

        for (const entry of entries) {
            const entryName = entry.name;
            const entryPath = path.join(current, entryName);

            if (entry.isDirectory()) {
                stack.push(entryPath);
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            if (!entryName.toLowerCase().endsWith(".md")) {
                continue;
            }

            if (isIgnoredPath(entryPath)) {
                continue;
            }

            results.push(entryPath);
        }
    }

    return results;
}

/**
 * Extracts the YAML front-matter block from a Markdown document.
 *
 * @param {string} content
 * @param {string} filePath
 *
 * @returns {{ yamlText: string; bodyOffset: number }}
 */
function extractFrontMatter(content, filePath) {
    const lines = content.split(/\r?\n/);

    let startIndex = 0;
    while (startIndex < lines.length) {
        const currentLine = lines[startIndex];
        if (typeof currentLine !== "string" || currentLine.trim() !== "") {
            break;
        }
        startIndex += 1;
    }

    const firstLine = lines[startIndex];
    if (firstLine === undefined || firstLine.trim() !== "---") {
        throw new TypeError(
            `Missing front-matter '---' delimiter at top of file: ${filePath}`
        );
    }

    let endIndex = -1;
    for (let index = startIndex + 1; index < lines.length; index += 1) {
        const line = lines[index];
        if (typeof line === "string" && line.trim() === "---") {
            endIndex = index;
            break;
        }
    }

    if (endIndex === -1) {
        throw new TypeError(
            `Unterminated front-matter block (missing closing '---') in: ${filePath}`
        );
    }

    const yamlText = lines.slice(startIndex + 1, endIndex).join("\n");
    return { yamlText, bodyOffset: endIndex + 1 };
}

/**
 * Very small YAML subset parser tailored to the front-matter structure used in
 * this repository.
 *
 * Supported constructs:
 *
 * - `key: value` string pairs (single line, with or without quotes)
 * - `key:` followed by `- item` array entries
 * - `key: >-` followed by indented lines as a folded multiline string.
 *
 * Nested objects, anchors, and advanced YAML features are intentionally not
 * supported.
 *
 * @param {string} yamlText
 * @param {string} filePath
 *
 * @returns {JsonObject}
 */
function parseFrontMatterYaml(yamlText, filePath) {
    /** @type {JsonObject} */
    const result = {};

    const lines = yamlText.split(/\r?\n/);

    /** @type {string | null} */
    let currentKey = null;
    /** @type {string | null} */
    let multilineKey = null;
    /** @type {string[]} */
    let multilineBuffer = [];

    const finalizeMultiline = () => {
        if (multilineKey !== null) {
            const value = multilineBuffer.join("\n").trimEnd();
            result[multilineKey] = value;
            multilineKey = null;
            multilineBuffer = [];
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.replace(/\r?$/, "");

        if (multilineKey !== null) {
            const trimmed = line.trim();
            if (trimmed === "" && multilineBuffer.length === 0) {
                // Skip leading blank lines in block scalar
                continue;
            }

            // Terminate multiline block if we see what looks like a new key at
            // the first column (no indentation) followed by a colon.
            if (/^\S.*?:\s*.*$/.test(line)) {
                finalizeMultiline();
                // Fall through and handle this line as a potential key below.
            } else {
                multilineBuffer.push(line.replace(/^\s*/, ""));
                continue;
            }
        }

        const trimmed = line.trim();

        if (trimmed === "" || trimmed.startsWith("#")) {
            continue;
        }

        const keyMatch = /^(?<key>[\w$]+):\s*(?<value>.*)$/.exec(trimmed);
        if (keyMatch) {
            const groups = keyMatch.groups;
            const rawKey = groups?.["key"];
            if (typeof rawKey !== "string") {
                throw new TypeError(
                    `Unable to parse front-matter line '${trimmed}' in ${filePath}: missing 'key' capture group.`
                );
            }

            const key = rawKey;
            const rawValue = groups?.["value"] ?? "";
            currentKey = key;

            if (rawValue === "" || rawValue === null) {
                // Placeholder; value might be provided via subsequent array
                // items or a block scalar.
                if (!(key in result)) {
                    result[key] = undefined;
                }
                continue;
            }

            if (rawValue === ">-" || rawValue === ">") {
                multilineKey = key;
                multilineBuffer = [];
                continue;
            }

            let value = rawValue;
            if (typeof value === "string") {
                if (
                    (value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))
                ) {
                    value = value.slice(1, -1);
                }
                result[key] = value;
            } else {
                throw new TypeError(
                    `Expected string value for key '${key}' in ${filePath}, received ${typeof value}.`
                );
            }
            continue;
        }

        const arrayMatch = /^-\s*(?<value>.*)$/.exec(trimmed);
        if (arrayMatch) {
            const groups = arrayMatch.groups;
            const rawItem = groups?.["value"] ?? "";
            if (currentKey === null) {
                throw new TypeError(
                    `Array item without preceding key in front matter of ${filePath}`
                );
            }

            let itemValue = rawItem;
            if (typeof itemValue === "string") {
                if (
                    (itemValue.startsWith('"') && itemValue.endsWith('"')) ||
                    (itemValue.startsWith("'") && itemValue.endsWith("'"))
                ) {
                    itemValue = itemValue.slice(1, -1);
                }

                const existing = result[currentKey];
                if (Array.isArray(existing)) {
                    existing.push(itemValue);
                } else if (existing === undefined) {
                    result[currentKey] = [itemValue];
                } else {
                    throw new TypeError(
                        `Mixed scalar and sequence values for key '${currentKey}' in ${filePath}`
                    );
                }

                continue;
            }

            throw new TypeError(
                `Expected string array entry for key '${currentKey}' in ${filePath}, received ${typeof rawItem}.`
            );
        }

        // At this point we have a non-empty, non-comment line that is not a
        // simple key or list item and not part of a block scalar. Treat this
        // as an error to avoid silently accepting malformed YAML.
        throw new TypeError(
            `Unrecognized front-matter line '${line}' in ${filePath}; only simple key/value, sequences, and >- blocks are supported.`
        );
    }

    finalizeMultiline();

    return result;
}

/**
 * @param {JsonObject} schema
 * @param {JsonObject} data
 * @param {string} filePath
 *
 * @returns {string[]} List of validation error messages for this file.
 */
function validateAgainstSchema(schema, data, filePath) {
    /** @type {string[]} */
    const errors = [];

    if (data === null || typeof data !== "object" || Array.isArray(data)) {
        errors.push(
            "Front matter must be a YAML mapping (object) at top level."
        );
        return errors;
    }

    const properties = /** @type {Record<string, unknown>} */ (
        schema["properties"] ?? {}
    );
    const allowedKeys = new Set(Object.keys(properties));
    const required = Array.isArray(schema["required"])
        ? new Set(schema["required"])
        : new Set();

    // Unknown keys
    for (const key of Object.keys(data)) {
        if (!allowedKeys.has(key)) {
            errors.push(`Unknown front-matter key '${key}'.`);
        }
    }

    // Missing required keys
    for (const requiredKey of required) {
        if (!(requiredKey in data)) {
            errors.push(`Missing required front-matter key '${requiredKey}'.`);
        }
    }

    // Per-property checks
    for (const [key, rawDefinition] of Object.entries(properties)) {
        const definition = /**
                            * @type {{
                            *     type?: string;
                            *     enum?: string[];
                            *     minLength?: number;
                            *     pattern?: string;
                            *     minItems?: number;
                            *     items?: { type?: string };
                            * }}
                            */ (rawDefinition);

        const value = data[key];
        if (value === undefined || value === null) {
            continue;
        }

        if (definition.type === "string") {
            if (typeof value !== "string") {
                errors.push(
                    `Key '${key}' must be a string, received ${typeof value}.`
                );
                continue;
            }

            if (
                typeof definition.minLength === "number" &&
                value.length < definition.minLength
            ) {
                errors.push(
                    `Key '${key}' must have length >= ${definition.minLength}.`
                );
            }

            if (typeof definition.pattern === "string") {
                const pattern = new RegExp(definition.pattern);
                if (!pattern.test(value)) {
                    errors.push(
                        `Key '${key}' must match pattern ${definition.pattern}.`
                    );
                }
            }

            if (
                Array.isArray(definition.enum) &&
                !definition.enum.includes(value)
            ) {
                errors.push(
                    `Key '${key}' must be one of ${definition.enum.join(", ")}.`
                );
            }
        } else if (definition.type === "array") {
            if (!Array.isArray(value)) {
                errors.push(`Key '${key}' must be an array.`);
                continue;
            }

            if (
                typeof definition.minItems === "number" &&
                value.length < definition.minItems
            ) {
                errors.push(
                    `Key '${key}' must contain at least ${definition.minItems} item(s).`
                );
            }

            if (definition.items && definition.items.type === "string") {
                for (const item of value) {
                    if (typeof item !== "string") {
                        errors.push(
                            `All entries in '${key}' must be strings; found ${typeof item}.`
                        );
                        break;
                    }
                }
            }
        }
    }

    // Additional check for schema reference to catch path mistakes.
    const schemaRef =
        typeof data["schema"] === "string" ? data["schema"] : null;

    if (schemaRef === null) {
        errors.push(
            "Front matter must include a string 'schema' property pointing to config/schemas/doc-frontmatter.schema.json."
        );
    } else if (
        !schemaRef.endsWith("config/schemas/doc-frontmatter.schema.json")
    ) {
        errors.push(
            `'schema' should reference config/schemas/doc-frontmatter.schema.json (received '${schemaRef}').`
        );
    }

    return errors.map((message) => `${filePath}: ${message}`);
}

/**
 * @param {string} markdownPath
 * @param {JsonObject} schema
 *
 * @returns {Promise<string[]>}
 */
async function validateFile(markdownPath, schema) {
    const content = await readFile(markdownPath, "utf8");

    const { yamlText } = extractFrontMatter(content, markdownPath);
    const frontMatter = parseFrontMatterYaml(yamlText, markdownPath);

    return validateAgainstSchema(schema, frontMatter, markdownPath);
}

/**
 * Validate docs front matter against the shared JSON schema.
 *
 * @returns {Promise<void>} Resolves after reporting any violations.
 */
async function main() {
    const schemaRaw = await readFile(FRONTMATTER_SCHEMA_PATH, "utf8");
    const schema = /** @type {JsonObject} */ (JSON.parse(schemaRaw));

    /** @type {string[]} */
    const errors = [];

    for (const directory of DOC_DIRECTORIES) {
        const absoluteDirectory = path.resolve(ROOT_DIRECTORY, directory);
        const markdownFiles = await collectMarkdownFiles(absoluteDirectory);

        for (const file of markdownFiles) {
            try {
                const fileErrors = await validateFile(file, schema);
                errors.push(...fileErrors);
            } catch (error) {
                errors.push(
                    `${file}: Failed to parse/validate front matter: ${String(error)}`
                );
            }
        }
    }

    if (errors.length > 0) {
        console.error("Front-matter validation failed:\n");
        for (const errorMessage of errors) {
            console.error(`• ${errorMessage}`);
        }

        console.error(
            `\nTotal front-matter issues: ${errors.length}. Please fix the problems above.`
        );
        process.exit(1);
    }

    console.log(
        "Front-matter validation passed – all docs match the shared schema."
    );
}

try {
    await main();
} catch (error) {
    console.error("Front-matter validation failed due to an unexpected error.");
    console.error(error);
    process.exit(1);
}
