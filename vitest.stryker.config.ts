import type { UserConfig } from "vite";

import { defineConfig, mergeConfig } from "vitest/config";

import baseConfig from "./vitest.config";

/**
 * Vitest configuration variant used by Stryker mutation testing runs.
 */
const config = defineConfig((configEnv) => {
    const resolvedBase = baseConfig(configEnv);

    const overrides = {
        cacheDir: "./.cache/vitest/.vitest-stryker",
        test: {
            attachmentsDir: "./.cache/vitest/.vitest-attachments-stryker",
            cacheDir: "./.cache/vitest/.vitest-stryker",
            coverage: {
                enabled: false,
            },
            // Vitest v4 removed `test.poolOptions`. For mutation runs we force single-worker execution.
            fileParallelism: false,
            maxWorkers: 1,
            reporters: ["default"],
            typecheck: {
                enabled: false,
            },
            watch: false,
        },
    } as unknown as UserConfig;

    return mergeConfig(resolvedBase, overrides);
}) as ReturnType<typeof defineConfig>;

export default config;
