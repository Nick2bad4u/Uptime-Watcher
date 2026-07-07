import { describe, expect, it } from "vitest";

import {
    convertHashLinksToBangLinksInComment,
} from "../../../docs/docusaurus/typedoc-plugins/hashToBangLinksCore.mjs";

const rewriteInlineTagText = (text: string): string => {
    const comment = {
        blockTags: [],
        summary: [
            {
                kind: "inline-tag",
                tag: "@link",
                text,
            },
        ],
    };

    convertHashLinksToBangLinksInComment(comment);

    return comment.summary[0]!.text;
};

describe(convertHashLinksToBangLinksInComment, () => {
    it("rewrites module#Export to module!Export", () => {
        expect(rewriteInlineTagText("src/foo#Bar")).toBe("src/foo!Bar");
    });

    it("preserves a | label suffix", () => {
        expect(rewriteInlineTagText("src/foo#Bar | Label")).toBe(
            "src/foo!Bar | Label"
        );
    });

    it("preserves leading/trailing whitespace around the core", () => {
        expect(rewriteInlineTagText("   src/foo#Bar   | Label")).toBe(
            "   src/foo!Bar   | Label"
        );
    });

    it("does not rewrite URL fragments", () => {
        expect(rewriteInlineTagText("https://example.com/a#b")).toBe(
            "https://example.com/a#b"
        );
    });

    it("does not rewrite non-:// URL-like schemes", () => {
        expect(rewriteInlineTagText("mailto:me@example.com#x")).toBe(
            "mailto:me@example.com#x"
        );
        expect(rewriteInlineTagText("data:text/plain#x")).toBe(
            "data:text/plain#x"
        );
        expect(rewriteInlineTagText("urn:example:animal:ferret:nose#x")).toBe(
            "urn:example:animal:ferret:nose#x"
        );
    });

    it("does not rewrite non-module-looking references", () => {
        // A plain identifier `Foo#bar` is likely intended as TypeDoc instance-member navigation.
        expect(rewriteInlineTagText("Foo#bar")).toBe("Foo#bar");
    });

    it("rewrites node: specifiers", () => {
        expect(rewriteInlineTagText("node:fs#promises")).toBe(
            "node:fs!promises"
        );
    });

    it("does not rewrite when the # has no right-hand side", () => {
        expect(rewriteInlineTagText("src/foo#")).toBe("src/foo#");
    });

    it("rewrites inline-tag @link parts and clears resolved link fields", () => {
        /** @type {any[]} */
        const parts = [
            {
                kind: "inline-tag",
                tag: "@link",
                text: "src/foo#Bar",
                target: { some: "target" },
                tsLinkText: "resolved",
            },
            {
                kind: "text",
                text: " (not touched)",
            },
        ];
        const comment = {
            blockTags: [],
            summary: parts,
        };

        convertHashLinksToBangLinksInComment(comment);

        expect(parts[0]!.text).toBe("src/foo!Bar");
        expect("target" in parts[0]!).toBeFalsy();
        expect("tsLinkText" in parts[0]!).toBeFalsy();
        expect(parts[1]!.text).toBe(" (not touched)");
    });

    it("does not rewrite URL-like inline-tag parts", () => {
        /** @type {any[]} */
        const parts = [
            {
                kind: "inline-tag",
                tag: "@link",
                text: "mailto:me@example.com#x",
            },
        ];
        const comment = {
            blockTags: [],
            summary: parts,
        };

        convertHashLinksToBangLinksInComment(comment);

        expect(parts[0]!.text).toBe("mailto:me@example.com#x");
    });

    it("rewrites block tag content", () => {
        const comment = {
            blockTags: [
                {
                    content: [
                        {
                            kind: "inline-tag",
                            tag: "@linkcode",
                            text: "src/foo#Bar",
                        },
                    ],
                },
            ],
            summary: [],
        };

        convertHashLinksToBangLinksInComment(comment);

        expect(comment.blockTags[0]!.content[0]!.text).toBe("src/foo!Bar");
    });
});
