/**
 * Vitest configuration for frontend tests.
 * Dedicated config file to help VS Code testing extension recognize frontend tests.
 * Settings match the test configuration from vite.config.ts.
 */

import { defineConfig, mergeConfig, type UserConfigFnObject } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
    mergeConfig(
        viteConfig(configEnv),
        defineConfig({
            test: {
                // ...other test options as needed
            },
        })
    )
) satisfies UserConfigFnObject as UserConfigFnObject;
