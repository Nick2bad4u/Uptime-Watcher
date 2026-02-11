// @ts-check
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- This file intentionally uses JSDoc types that trigger TSDoc warnings in this repo; disable the rule for the whole file.
/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types, tsdoc/syntax -- This is runtime code used by a TypeDoc plugin; we use JSDoc for typing without introducing TSDoc parsing issues. */

/**
 * @typedef {import('typedoc').Comment} Comment
 * @typedef {import('typedoc').CommentDisplayPart} CommentDisplayPart
 */

/** @type {ReadonlySet<string>} */
const URL_LIKE_SCHEMES = new Set([
    "blob",
    "data",
    "file",
    "mailto",
    "tel",
    "urn",
]);

/**
 * @param {string} moduleSource
 */
function isUrlLike(moduleSource) {
    // Cheap and safe heuristic: enough to avoid rewriting `https://...#...` anchors.
    if (moduleSource.includes("://")) {
        return true;
    }

    // Detect common URI schemes that do not use `://`, while avoiding false
    // positives such as Windows paths (e.g. `C:\\path\\to\\file`).
    const firstColon = moduleSource.indexOf(":");
    if (firstColon <= 0) {
        return false;
    }

    const scheme = moduleSource.slice(0, firstColon);

    // Windows drive letter followed by `:` (e.g. `C:`) with a path segment is
    // not a URL.
    if (/^[A-Za-z]$/u.test(scheme) && /[\\/]/u.test(moduleSource.slice(firstColon + 1))) {
        return false;
    }

    const lowerScheme = scheme.toLowerCase();

    // Restrict to well-known URL-like schemes so that specifiers such as
    // `node:fs` continue to be treated as module-like, not URL-like.
    return URL_LIKE_SCHEMES.has(lowerScheme);
}

/**
 * Determines whether a `#` in a link target is likely being used as a module/export separator
 * (repo convention) rather than as a TypeDoc declaration-reference instance member separator.
 *
 * @param {string} moduleSource
 */
function isModuleSourceLike(moduleSource) {
    return (
        moduleSource.includes("/") ||
        moduleSource.includes("\\") ||
        moduleSource.startsWith("@") ||
        moduleSource.includes("-") ||
        // Supports things like `node:fs` or other specifiers.
        moduleSource.includes(":")
    );
}

/**
 * Rewrites `module#path` -> `module!path` for module-source-like references.
 * Preserves whitespace and any `| label` suffix.
 *
 * @param {string} inlineTagText The inline-tag payload stored by TypeDoc.
 */
export function convertHashLinksToBangLinksInInlineTagText(inlineTagText) {
    const pipeIndex = inlineTagText.indexOf("|");
    const beforePipe =
        pipeIndex === -1 ? inlineTagText : inlineTagText.slice(0, pipeIndex);

    const trimmedStart = beforePipe.trimStart();
    const leadingWs = beforePipe.slice(0, beforePipe.length - trimmedStart.length);

    const trimmedEnd = beforePipe.trimEnd();
    const trailingWs = beforePipe.slice(trimmedEnd.length);

    const trimmed = beforePipe.slice(leadingWs.length, beforePipe.length - trailingWs.length);

    const hashIndex = trimmed.indexOf("#");
    if (hashIndex === -1) {
        return inlineTagText;
    }

    const moduleSource = trimmed.slice(0, hashIndex);
    if (isUrlLike(moduleSource)) {
        return inlineTagText;
    }
    if (!isModuleSourceLike(moduleSource)) {
        return inlineTagText;
    }

    const afterHash = trimmed.slice(hashIndex + 1);
    if (!afterHash) {
        return inlineTagText;
    }

    const rewrittenCore = `${moduleSource}!${afterHash}`;

    const rebuiltBeforePipe = `${leadingWs}${rewrittenCore}${trailingWs}`;
    return pipeIndex === -1
        ? rebuiltBeforePipe
        : `${rebuiltBeforePipe}${inlineTagText.slice(pipeIndex)}`;
}

/**
 * @param {CommentDisplayPart[]} parts
 */
export function convertHashLinksToBangLinksInParts(parts) {
    for (const part of parts) {
        if (
            part.kind === "inline-tag" &&
            (part.tag === "@link" ||
                part.tag === "@linkcode" ||
                part.tag === "@linkplain")
        ) {
            const rewritten = convertHashLinksToBangLinksInInlineTagText(part.text);
            if (rewritten !== part.text) {
                part.text = rewritten;
                // Ensure TypeDoc re-resolves this link based on updated text.
                delete part.target;
                delete part.tsLinkText;
            }
        }
    }
}

/**
 * @param {Comment} comment
 */
export function convertHashLinksToBangLinksInComment(comment) {
    convertHashLinksToBangLinksInParts(comment.summary);
    for (const tag of comment.blockTags) {
        convertHashLinksToBangLinksInParts(tag.content);
    }
}
