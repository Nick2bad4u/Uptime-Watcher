/**
 * Remark plugin ensuring critical documentation snippets remain present.
 *
 * @remarks
 * Prevents accidental drift in IPC contract documentation by verifying that
 * specified markdown files include key reference strings.
 */

import * as path from "node:path";

/**
 * Normalizes a file path to use POSIX separators for consistent matching.
 *
 * @param {string} filePath - Path to normalize.
 *
 * @returns {string} Normalized POSIX-style path.
 */
const normalizePath = (filePath) => filePath.replace(/\\/gu, "/");

/**
 * @typedef {object} RequiredSnippetEntry
 *
 * @property {string} pattern - File path suffix to match.
 * @property {readonly string[]} snippets - Snippets that must appear.
 */

/**
 * @typedef {object} RequireSnippetsOptions
 *
 * @property {readonly RequiredSnippetEntry[]} [entries]
 */

/** @type {import("unified").Plugin<[RequireSnippetsOptions?]>} */
const remarkRequireSnippets = (options = {}) => {
    const entries = Array.isArray(options.entries) ? options.entries : [];

    return (_tree, file) => {
        if (!entries.length) {
            return;
        }

        const originalPath =
            (Array.isArray(file.history) &&
                file.history[file.history.length - 1]) ||
            file.path ||
            "";
        const normalized = normalizePath(
            path.relative(process.cwd(), originalPath)
        );

        const entry = entries.find((candidate) =>
            normalized.endsWith(normalizePath(candidate.pattern))
        );

        if (!entry) {
            return;
        }

        const contents = String(file);

        for (const snippet of entry.snippets) {
            if (!contents.includes(snippet)) {
                const message = file.message(
                    `Document must reference "${snippet}" to keep IPC contract docs synchronized.`,
                    undefined,
                    "remark-require-snippets:missing-snippet"
                );
                message.fatal = true;
            }
        }
    };
};

export default remarkRequireSnippets;
