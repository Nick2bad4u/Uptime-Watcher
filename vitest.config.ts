/**
 * Vitest configuration for frontend tests. Dedicated config file to help VS
 * Code testing extension recognize frontend tests. Settings match the test
 * configuration from vite.config.ts.
 */

import {
    defineConfig,
    mergeConfig,
    type ViteUserConfig,
    type ViteUserConfigFnObject,
} from "vitest/config";

import viteConfig from "./vite.config";

export default defineConfig((configEnv) => {
    const mergedConfig = mergeConfig(
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
    ) as ViteUserConfig;

    // Frontend runs should execute only the frontend test project.
    // The base Vite config defines a multi-project workspace for broader
    // validation tasks, but inheriting it here causes `test:frontend` to pull
    // in additional projects and can leave background handles alive.
    if (mergedConfig.test && "projects" in mergedConfig.test) {
        delete mergedConfig.test.projects;
    }

    return mergedConfig;
}) satisfies ViteUserConfigFnObject as ViteUserConfigFnObject;
