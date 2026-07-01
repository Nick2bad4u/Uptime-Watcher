// @ts-check

/*
 * TypeDoc renderer plugin: prefix bare intra-doc Markdown file links with `./`.
 *
 * Docusaurus only rewrites Markdown links to other doc files when they are explicit file paths
 * (typically starting with `./` or `../`).
 *
 * TypeDoc's markdown output frequently contains links like:
 *   - `electron/Foo/index.md`
 *   - `shared/bar/Baz.md`
 *
 * Without the leading `./`, Docusaurus treats those as URL paths, cannot resolve them to files,
 * and reports them as broken/unresolved.
 */

import { PageEvent } from "typedoc";

import { prefixBareMarkdownFileLinksInMarkdown } from "./prefixDocLinksCore.mjs";

/**
 * Renderer hook: runs after a page has been rendered.
 *
 * @param {import("typedoc").PageEvent} page
 */
function onPageEnd(page) {
    if (typeof page.contents !== "string") {
        return;
    }

    // Markdown output only.
    if (!page.url.endsWith(".md") && !page.url.endsWith(".mdx")) {
        return;
    }

    page.contents = prefixBareMarkdownFileLinksInMarkdown(page.contents);
}

/**
 * TypeDoc plugin entrypoint.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.renderer.on(PageEvent.END, onPageEnd);
}
