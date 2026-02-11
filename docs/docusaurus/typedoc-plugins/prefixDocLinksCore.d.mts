/**
 * Type declarations for the runtime TypeDoc plugin helper module.
 *
 * @remarks
 * This file exists so TypeScript consumers (tests/tooling) can import the
 * `.mjs` module without TS7016.
 */

/**
 * Prefixes bare intra-doc Markdown file links with `./`.
 */
export declare function prefixBareMarkdownFileLinksInMarkdown(
    input: string
): string;
