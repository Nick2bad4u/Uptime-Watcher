/**
 * Type declarations for the runtime TypeDoc plugin helper module.
 */

/**
 * Rewrites `module#Export` to `module!Export` for module-source-like references.
 *
 * @param inlineTagText - The inline-tag payload stored by TypeDoc.
 */
export declare function convertHashLinksToBangLinksInInlineTagText(
    inlineTagText: string
): string;

/**
 * Mutates a TypeDoc comment in-place, rewriting repo-style `path#Symbol` links
 * into TypeDoc declaration references (`path!Symbol`).
 *
 * @param comment - A TypeDoc Comment object.
 */
export declare function convertHashLinksToBangLinksInComment(
    comment: unknown
): void;

/**
 * Mutates an array of TypeDoc comment display parts in-place.
 */
export declare function convertHashLinksToBangLinksInParts(
    parts: Array<Record<string, unknown>>
): void;
