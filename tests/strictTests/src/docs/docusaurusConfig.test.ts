/**
 * @file Regression tests for the Docusaurus configuration ESM adjustments.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("docusaurus.config.ts (strict coverage)", () => {
    const configModulePath = "../../../../docs/docusaurus/docusaurus.config.ts";

    it("resolves client modules using stable ESM paths", async () => {
        const { default: config } = await import(configModulePath);

        const workspaceRoot = fileURLToPath(
            new URL("../../../../", import.meta.url)
        );
        const expectedModernEnhancementsPath = path.resolve(
            workspaceRoot,
            "docs/docusaurus/src/js/modernEnhancements.ts"
        );

        expect(config.clientModules).toEqual([expectedModernEnhancementsPath]);
    });

    it("registers themes via bare-specifier entries without CommonJS fallbacks", async () => {
        const { default: config } = await import(configModulePath);

        expect(config.themes).toEqual([
            "@docusaurus/theme-live-codeblock",
            "@docusaurus/theme-mermaid",
            [
                "@easyops-cn/docusaurus-search-local",
                {
                    blogDir: "blog",
                    blogRouteBasePath: "blog",
                    docsDir: "docs",
                    docsRouteBasePath: "docs",
                    hashed: true,
                    indexBlog: true,
                    indexDocs: true,
                    indexPages: false,
                    language: ["en"],
                    removeDefaultStopWordFilter: false,
                    useAllContextsWithNoSearchContext: false,
                },
            ],
        ]);
    });
});
