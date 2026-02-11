import { describe, expect, it } from "vitest";

import { prefixBareMarkdownFileLinksInMarkdown } from "../../../docs/docusaurus/typedoc-plugins/prefixDocLinksCore.mjs";

describe(prefixBareMarkdownFileLinksInMarkdown, () => {
    it("prefixes bare .md links with ./", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("See [x](foo.md)."))
            .toBe("See [x](./foo.md).");
    });

    it("does not change already-relative links", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](./foo.md) [y](../bar.md)"))
            .toBe("[x](./foo.md) [y](../bar.md)");
    });

    it("does not change absolute/schemed links", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](https://example.com/a.md)"))
            .toBe("[x](https://example.com/a.md)");
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](vscode:foo.md)"))
            .toBe("[x](vscode:foo.md)");
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](/foo.md)"))
            .toBe("[x](/foo.md)");
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](#section)"))
            .toBe("[x](#section)");
    });

    it("preserves link titles and only prefixes the destination", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](foo.md \"Title\")"))
            .toBe("[x](./foo.md \"Title\")");
    });

    it("handles parentheses inside destinations", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("[x](foo(bar).md)"))
            .toBe("[x](./foo(bar).md)");
    });

    it("handles escaped parentheses inside destinations", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown(String.raw`[x](foo\(bar\).md)`))
            .toBe(String.raw`[x](./foo\(bar\).md)`);
    });

    it("keeps CRLF newlines when input is CRLF", () => {
        const input = "[a](foo.md)\r\n[b](bar.md)\r\n";
        const output = prefixBareMarkdownFileLinksInMarkdown(input);
        expect(output).toBe("[a](./foo.md)\r\n[b](./bar.md)\r\n");
    });

    it("does not rewrite inside fenced code blocks", () => {
        const input = [
            "```",
            "[x](foo.md)",
            "```",
            "[y](bar.md)",
        ].join("\n");

        const expected = [
            "```",
            "[x](foo.md)",
            "```",
            "[y](./bar.md)",
        ].join("\n");

        expect(prefixBareMarkdownFileLinksInMarkdown(input)).toBe(expected);
    });

    it("does not rewrite inside inline code spans", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("`[x](foo.md)` [y](bar.md)"))
            .toBe("`[x](foo.md)` [y](./bar.md)");
    });

    it("does not rewrite random text containing ]( without a matching [label]", () => {
        expect(prefixBareMarkdownFileLinksInMarkdown("not-a-link ](foo.md)"))
            .toBe("not-a-link ](foo.md)");
    });
});
