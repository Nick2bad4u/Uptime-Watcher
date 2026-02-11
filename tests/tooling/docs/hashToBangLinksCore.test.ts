import { describe, expect, it } from "vitest";

import {
    convertHashLinksToBangLinksInInlineTagText,
    convertHashLinksToBangLinksInParts,
} from "../../../docs/docusaurus/typedoc-plugins/hashToBangLinksCore.mjs";

describe(convertHashLinksToBangLinksInInlineTagText, () => {
    it("rewrites module#Export to module!Export", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("src/foo#Bar"))
            .toBe("src/foo!Bar");
    });

    it("preserves a | label suffix", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("src/foo#Bar | Label"))
            .toBe("src/foo!Bar | Label");
    });

    it("preserves leading/trailing whitespace around the core", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("   src/foo#Bar   | Label"))
            .toBe("   src/foo!Bar   | Label");
    });

    it("does not rewrite URL fragments", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("https://example.com/a#b"))
            .toBe("https://example.com/a#b");
    });

    it("does not rewrite non-:// URL-like schemes", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("mailto:me@example.com#x"))
            .toBe("mailto:me@example.com#x");
        expect(convertHashLinksToBangLinksInInlineTagText("data:text/plain#x"))
            .toBe("data:text/plain#x");
        expect(convertHashLinksToBangLinksInInlineTagText("urn:example:animal:ferret:nose#x"))
            .toBe("urn:example:animal:ferret:nose#x");
    });

    it("does not rewrite non-module-looking references", () => {
        // A plain identifier `Foo#bar` is likely intended as TypeDoc instance-member navigation.
        expect(convertHashLinksToBangLinksInInlineTagText("Foo#bar")).toBe("Foo#bar");
    });

    it("rewrites node: specifiers", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("node:fs#promises"))
            .toBe("node:fs!promises");
    });

    it("does not rewrite when the # has no right-hand side", () => {
        expect(convertHashLinksToBangLinksInInlineTagText("src/foo#"))
            .toBe("src/foo#");
    });
});

describe(convertHashLinksToBangLinksInParts, () => {
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

        convertHashLinksToBangLinksInParts(parts);

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

        convertHashLinksToBangLinksInParts(parts);

        expect(parts[0]!.text).toBe("mailto:me@example.com#x");
    });
});
