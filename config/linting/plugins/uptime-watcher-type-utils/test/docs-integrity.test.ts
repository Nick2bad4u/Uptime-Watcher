import { existsSync, readdirSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import uptimeWatcherTypeUtilsPlugin from "../plugin.mjs";
import { repoPath } from "./_internal/ruleTester";

const pluginRuleIds = Object.keys(
    uptimeWatcherTypeUtilsPlugin.rules ?? {}
).toSorted((left, right) => left.localeCompare(right));
const docsRoot = repoPath(
    "config",
    "linting",
    "plugins",
    "uptime-watcher-type-utils",
    "docs",
    "rules"
);

describe("type-utils rule docs integrity", () => {
    it("has one docs file per rule id", () => {
        const docsRuleIds = readdirSync(docsRoot)
            .filter((entry) => entry.endsWith(".md"))
            .map((entry) => entry.slice(0, -3))
            .toSorted((left, right) => left.localeCompare(right));

        expect(docsRuleIds).toEqual(pluginRuleIds);
    });

    it("contains each docs file referenced by rule meta.docs.url", () => {
        for (const ruleId of pluginRuleIds) {
            const rule = (uptimeWatcherTypeUtilsPlugin.rules ?? {})[ruleId];
            const docsUrl = rule?.meta?.docs?.url;

            expect(typeof docsUrl).toBe("string");
            if (typeof docsUrl !== "string") {
                continue;
            }

            const marker =
                "config/linting/plugins/uptime-watcher-type-utils/docs/rules/";
            const markerIndex = docsUrl.indexOf(marker);

            expect(markerIndex).toBeGreaterThanOrEqual(0);
            if (markerIndex === -1) {
                continue;
            }

            const relativePath = docsUrl.slice(markerIndex);
            const docsPath = repoPath(relativePath);

            expect(existsSync(docsPath)).toBe(true);
        }
    });

    it("ensures docs URLs use repo main branch path", () => {
        const expectedPrefix =
            "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher-type-utils/docs/rules/";

        for (const ruleId of pluginRuleIds) {
            const rule = (uptimeWatcherTypeUtilsPlugin.rules ?? {})[ruleId];
            const docsUrl = rule?.meta?.docs?.url;

            expect(typeof docsUrl).toBe("string");
            if (typeof docsUrl !== "string") {
                continue;
            }

            expect(docsUrl.startsWith(expectedPrefix)).toBe(true);

            const expectedFileName = `${ruleId}.md`;
            expect(path.basename(docsUrl)).toBe(expectedFileName);
        }
    });
});
