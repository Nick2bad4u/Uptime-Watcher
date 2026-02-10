/**
 * @fileoverview
 * TypeDoc plugin which rewrites a repo-specific `path#Export` convention into
 * TypeDoc's declaration-reference module source syntax: `path!Export`.
 *
 * Why:
 * - In TypeDoc declaration references, `#` means "instance member" navigation.
 * - `!` separates the *module source* from the component path.
 * - So `src/foo#bar` is interpreted as: navigate to `src/foo` in the current scope,
 *   then find instance member `bar` — which almost never exists.
 *
 * This repository intentionally uses `path#Symbol` because VS Code can resolve it
 * as a workspace link. TypeDoc cannot.
 *
 * This plugin runs during conversion and adjusts link texts before TypeDoc's own
 * link resolver executes, so we get valid internal links in generated docs while
 * keeping the source comments unchanged for the IDE.
 */

import { Converter } from "typedoc";

/**
 * @typedef {import('typedoc').Comment} Comment
 * @typedef {import('typedoc').CommentDisplayPart} CommentDisplayPart
 */

/**
 * @param {string} moduleSource
 */
function isUrlLike(moduleSource) {
    // Cheap and safe heuristic: enough to avoid rewriting `https://...#...` anchors.
    return moduleSource.includes("://");
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
function convertHashLinksToBangLinksInInlineTagText(inlineTagText) {
    const pipeIndex = inlineTagText.indexOf("|");
    const beforePipe = pipeIndex === -1 ? inlineTagText : inlineTagText.slice(0, pipeIndex);

    const trimmed = beforePipe.trim();
    const hashIndex = trimmed.indexOf("#");
    if (hashIndex === -1) return inlineTagText;

    const moduleSource = trimmed.slice(0, hashIndex);
    if (isUrlLike(moduleSource)) return inlineTagText;
    if (!isModuleSourceLike(moduleSource)) return inlineTagText;

    const afterHash = trimmed.slice(hashIndex + 1);
    if (!afterHash) return inlineTagText;

    const rewrittenCore = `${moduleSource}!${afterHash}`;

    const trimmedStart = beforePipe.trimStart();
    const leadingWs = beforePipe.slice(0, beforePipe.length - trimmedStart.length);

    const trimmedEnd = beforePipe.trimEnd();
    const trailingWs = beforePipe.slice(trimmedEnd.length);

    const rebuiltBeforePipe = `${leadingWs}${rewrittenCore}${trailingWs}`;
    return pipeIndex === -1
        ? rebuiltBeforePipe
        : `${rebuiltBeforePipe}${inlineTagText.slice(pipeIndex)}`;
}

/**
 * @param {CommentDisplayPart[]} parts
 */
function convertHashLinksToBangLinksInParts(parts) {
    for (const part of parts) {
        if (part.kind === "inline-tag" && (part.tag === "@link" || part.tag === "@linkcode" || part.tag === "@linkplain")) {
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
function convertHashLinksToBangLinksInComment(comment) {
    convertHashLinksToBangLinksInParts(comment.summary);
    for (const tag of comment.blockTags) {
        convertHashLinksToBangLinksInParts(tag.content);
    }
}

/**
 * TypeDoc plugin entrypoint.
 *
 * @param {import('typedoc').Application} app
 */
export function load(app) {
    // Run before TypeDoc's built-in LinkResolverPlugin (priority -300).
    app.converter.on(
        Converter.EVENT_RESOLVE_END,
        (context) => {
            const { project } = context;
            for (const reflection of Object.values(project.reflections)) {
                if (reflection?.comment) {
                    convertHashLinksToBangLinksInComment(reflection.comment);
                }
            }
        },
        50
    );
}
