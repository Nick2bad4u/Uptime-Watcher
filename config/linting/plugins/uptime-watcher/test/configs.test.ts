import { describe, expect, it } from "vitest";

import uptimeWatcherPlugin from "../../uptime-watcher.mjs";

interface FlatConfigLike {
    files?: unknown;
    ignores?: unknown;
    name?: unknown;
    plugins?: Record<string, unknown>;
    rules?: Record<string, unknown>;
}

function getPluginConfigs(plugin: unknown): null | Record<string, unknown> {
    if (!isObject(plugin)) {
        return null;
    }

    const configsKey = "configs" as const;
    const configs = plugin[configsKey];
    if (!isObject(configs)) {
        return null;
    }

    return configs;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Lightweight shape checks for `plugin.configs.*`.
 *
 * @remarks
 * These tests exist to prevent accidental regressions when we refactor the
 * internal plugin (for example: returning the wrong type for array-based
 * configs, or forgetting to register the plugin on a config item).
 */
describe("uptime-watcher plugin configs", () => {
    const configs = getPluginConfigs(uptimeWatcherPlugin);

    it("exports the expected config keys", () => {
        expect(configs).toBeDefined();

        const keys = Object.keys(configs ?? {});

        // Keep this intentionally narrow: we only assert the presets we promise
        // To consumers.
        expect(keys).toEqual(
            expect.arrayContaining([
                "all",
                "default",
                "recommended",
                "flat/all",
                "flat/default",
                "flat/recommended",
                "repo",
                "repo/core",
                "repo/drift-guards",
            ])
        );
    });

    it("repo presets are arrays of flat-config items", () => {
        const repoKey = "repo" as const;
        const coreKey = "repo/core" as const;
        const driftKey = "repo/drift-guards" as const;

        const repo = configs?.[repoKey];
        const core = configs?.[coreKey];
        const drift = configs?.[driftKey];

        expect(Array.isArray(repo)).toBe(true);
        expect(Array.isArray(core)).toBe(true);
        expect(Array.isArray(drift)).toBe(true);

        if (!Array.isArray(repo)) {
            throw new TypeError("Expected configs.repo to be an array");
        }

        for (const config of repo as FlatConfigLike[]) {
            expect(config).toEqual(
                expect.objectContaining({
                    plugins: expect.objectContaining({
                        "uptime-watcher": expect.anything(),
                    }),
                })
            );
        }
    });

    it("flat/all and flat/recommended are single flat-config items", () => {
        const flatAllKey = "flat/all" as const;
        const flatRecommendedKey = "flat/recommended" as const;

        const flatAll = configs?.[flatAllKey];
        const flatRecommended = configs?.[flatRecommendedKey];

        expect(Array.isArray(flatAll)).toBe(false);
        expect(Array.isArray(flatRecommended)).toBe(false);

        expect(flatAll).toEqual(
            expect.objectContaining({
                plugins: expect.objectContaining({
                    "uptime-watcher": expect.anything(),
                }),
            })
        );
        expect(flatRecommended).toEqual(
            expect.objectContaining({
                plugins: expect.objectContaining({
                    "uptime-watcher": expect.anything(),
                }),
            })
        );
    });
});
