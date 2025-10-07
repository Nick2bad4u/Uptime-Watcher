/**
 * Coverage instrumentation helper consumed by Vite when Playwright collection
 * runs.
 */

import type { PluginOption } from "vite";

/**
 * Describes the configuration required to construct the Playwright coverage
 * plugin.
 */
export interface PlaywrightCoveragePluginOptions {
    /** When `true`, Istanbul instrumentation is inserted into the bundle build. */
    readonly enabled: boolean;
    /** Project root passed to the Istanbul plugin for accurate path resolution. */
    readonly projectRoot: string;
    /** Glob patterns that must be instrumented. */
    readonly include: readonly string[];
    /** Glob patterns that must be excluded from instrumentation. */
    readonly exclude: readonly string[];
}

/**
 * Dynamically imports and instantiates the Istanbul plugin when Playwright
 * coverage is enabled.
 *
 * @param options - Instrumentation rules and execution flags.
 *
 * @returns Vite plugin instance when coverage is active; otherwise `null`.
 */
export async function createPlaywrightCoveragePlugin({
    enabled,
    exclude,
    include,
    projectRoot,
}: PlaywrightCoveragePluginOptions): Promise<PluginOption | null> {
    if (!enabled) {
        return null;
    }

    const { default: istanbul } = await import(
        /* webpackChunkName: "vite-plugin-istanbul" */
        "vite-plugin-istanbul"
    );

    return istanbul({
        cwd: projectRoot,
        exclude: Array.from(exclude),
        extension: [".ts", ".tsx"],
        forceBuildInstrument: true,
        include: Array.from(include),
    });
}
