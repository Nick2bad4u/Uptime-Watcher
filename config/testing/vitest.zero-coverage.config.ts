/**
 * Specialized Vitest configuration optimized for zero-coverage detection runs.
 *
 * @remarks
 * The standard test configuration enforces aggressive coverage thresholds and
 * eagerly instruments the entire source tree (`coverage.all = true`). That is
 * ideal for CI, but makes it impractical to execute a single spec in isolation
 * when scouting for stale files. This config disables the global thresholds,
 * limits coverage collection to the files actually touched by each test, and
 * emits lightweight JSON reports so the detector script can parse the results
 * quickly.
 */

import {
    defineConfig,
    mergeConfig,
    type UserConfigFnObject,
} from "vitest/config";

import baseViteConfig from "../../vite.config";

// Use isolated caches so zero-coverage probes do not contend with the primary Vite/Vitest pipeline.
const zeroCoverageViteCacheDir = "./.cache/vite-zero-coverage/";

export default defineConfig((env) =>
    mergeConfig(
        baseViteConfig(env),
        defineConfig({
            cacheDir: zeroCoverageViteCacheDir,
            test: {
                name: {
                    color: "magenta",
                    label: "ZeroCoverage",
                },
                coverage: {
                    all: false,
                    allowExternal: true,
                    clean: true,
                    cleanOnRerun: true,
                    provider: "v8",
                    reportOnFailure: false,
                    reporter: ["json"],
                    reportsDirectory: "./coverage/zero-coverage",
                    skipFull: false,
                    thresholds: {
                        autoUpdate: false,
                        branches: 0,
                        functions: 0,
                        lines: 0,
                        statements: 0,
                    },
                },
            },
        })
    )
) satisfies UserConfigFnObject;
