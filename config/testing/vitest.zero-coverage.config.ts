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
    type ViteUserConfig,
    type ViteUserConfigFnObject,
} from "vitest/config";

import baseViteConfig from "../../vite.config";

// Use isolated caches so zero-coverage probes do not contend with the primary Vite/Vitest pipeline.
const zeroCoverageViteCacheDir = "./.cache/vite-zero-coverage/";

type VitestTestConfig = NonNullable<ViteUserConfig["test"]>;
type CoverageOptionsWithAll = NonNullable<VitestTestConfig["coverage"]> & {
    /**
     * Runtime-supported Vitest coverage option omitted from the published
     * `CoverageOptions` type in the currently installed Vitest release.
     */
    all: boolean;
};

const zeroCoverageOverrides = {
    cacheDir: zeroCoverageViteCacheDir,
    test: {
        coverage: {
            all: false,
            allowExternal: true,
            clean: true,
            cleanOnRerun: true,
            provider: "v8",
            reporter: ["json"],
            reportOnFailure: false,
            reportsDirectory: "./coverage/zero-coverage",
            skipFull: false,
            thresholds: {
                autoUpdate: false,
                branches: 0,
                functions: 0,
                lines: 0,
                statements: 0,
            },
        } as CoverageOptionsWithAll,
        name: {
            color: "magenta",
            label: "ZeroCoverage",
        },
    },
} satisfies ViteUserConfig;

/**
 * Vitest configuration tuned for zero-coverage detection runs.
 *
 * @remarks
 * This configuration disables global coverage thresholds and limits
 * instrumentation to files touched by each spec so that the
 * `scripts/run-fast-check-fuzzing.ts` utilities can cheaply discover untested
 * modules.
 */
const zeroCoverageConfig: ViteUserConfigFnObject = defineConfig((env) =>
    mergeConfig(
        (() => {
            const configOrPromise =
                typeof baseViteConfig === "function"
                    ? baseViteConfig(env)
                    : baseViteConfig;

            if (configOrPromise instanceof Promise) {
                throw new TypeError(
                    "Async Vite config exports are not supported in vitest.zero-coverage.config.ts."
                );
            }

            return configOrPromise;
        })(),
        zeroCoverageOverrides
    )
);

export default zeroCoverageConfig;
