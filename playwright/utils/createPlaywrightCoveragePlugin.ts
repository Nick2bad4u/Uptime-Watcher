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
    /** Glob patterns that must be excluded from instrumentation. */
    readonly exclude: readonly string[];
    /** Glob patterns that must be instrumented. */
    readonly include: readonly string[];
    /** Project root passed to the Istanbul plugin for accurate path resolution. */
    readonly projectRoot: string;
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
}: PlaywrightCoveragePluginOptions): Promise<null | PluginOption> {
    if (!enabled) {
        return null;
    }

    const { default: istanbul } = await import(
        /* WebpackChunkName: "vite-plugin-istanbul" */
        "vite-plugin-istanbul"
    );

    return istanbul({
        cwd: projectRoot,
        exclude: [...exclude],
        extension: [".ts", ".tsx"],
        forceBuildInstrument: true,
        include: [...include],
    });
}
