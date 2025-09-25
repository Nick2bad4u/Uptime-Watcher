/**
 * Vitest configuration for frontend tests. Dedicated config file to help VS
 * Code testing extension recognize frontend tests. Settings match the test
 * configuration from vite.config.ts.
 */

import {
    defineConfig,
    mergeConfig,
    type UserConfigFnObject,
} from "vitest/config";

import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
    mergeConfig(
        viteConfig(configEnv),
        defineConfig({
            cacheDir: "./.cache/vitest/", // Separate cache to avoid conflicts
            test: {
                name: {
                    color: "cyan",
                    label: "Frontend",
                }, // Custom project name and color for Vitest
            },
        })
    )
) satisfies UserConfigFnObject as UserConfigFnObject;
