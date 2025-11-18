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
            poolOptions: {
                threads: {
                    isolate: true,
                    maxThreads: 1,
                    minThreads: 1,
                    singleThread: true,
                    useAtomics: false,
                },
            },
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
