/**
 * Type declarations for the runtime TypeDoc plugin helper module.
 */

/**
 * Mutates a TypeDoc comment in-place, rewriting repo-style `path#Symbol` links
 * into TypeDoc declaration references (`path!Symbol`).
 *
 * @param comment - A TypeDoc Comment object.
 */
export declare function convertHashLinksToBangLinksInComment(
    comment: unknown
): void;
