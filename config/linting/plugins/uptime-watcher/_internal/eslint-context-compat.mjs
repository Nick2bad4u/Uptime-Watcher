/**
 * ESLint rule-context compatibility helpers.
 *
 * @remarks
 * ESLint v10 removed several `context.*` methods that were deprecated in v9
 * (e.g. `context.getFilename()` and `context.getSourceCode()`).
 *
 * This module provides tiny helpers so our internal plugin can be compatible
 * across ESLint v9 and v10 without littering every rule with version checks.
 */

/** @typedef {import("eslint").SourceCode} SourceCode */

/**
 * Returns the current file name associated with a linted file.
 *
 * @param {
 *     | { filename?: unknown; getFilename?: (() => unknown) | undefined }
 *     | undefined
 *     | null} context
 *
 * @returns {string}
 */
export function getContextFilename(context) {
    const candidate = context?.filename;
    if (typeof candidate === "string") {
        return candidate;
    }

    const getter = context?.getFilename;
    if (typeof getter === "function") {
        const value = getter();
        return typeof value === "string" ? value : "<input>";
    }

    return "<input>";
}

/**
 * Returns the {@link SourceCode} instance for the current file.
 *
 * @param {
 *     | { sourceCode?: unknown; getSourceCode?: (() => unknown) | undefined }
 *     | undefined
 *     | null} context
 *
 * @returns {SourceCode}
 */
export function getContextSourceCode(context) {
    // In real ESLint rule execution, SourceCode is always available.
    // ESLint v10 removed `context.getSourceCode()`, so we prefer the
    // `context.sourceCode` property when present.
    return /** @type {SourceCode} */ (
        context?.sourceCode ?? context?.getSourceCode?.()
    );
}
