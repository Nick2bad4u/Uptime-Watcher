/**
 * Specialized Vite configuration used when collecting Playwright renderer
 * coverage. Extends the base Vite config and injects the Istanbul
 * instrumentation plugin so that bundled renderer assets produce coverage
 * artifacts during Playwright runs.
 */

import type {
    PluginOption,
    UserConfig,
    UserConfigExport,
    UserConfigFn,
} from "vite";

import * as path from "node:path";
import { defineConfig } from "vite";
import { defaultExclude } from "vitest/config";

import { createPlaywrightCoveragePlugin } from "./playwright/utils/createPlaywrightCoveragePlugin";
import baseViteConfig from "./vite.config";

const dirname = import.meta.dirname;

const ensurePluginArray = (value: UserConfig["plugins"]): PluginOption[] => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value as PluginOption[];
    }

    return [value as PluginOption];
};

/**
 * Vite configuration used when running Playwright tests with coverage
 * instrumentation enabled.
 */
const playwrightCoverageConfig: UserConfigExport = defineConfig(async (env) => {
    const baseConfigFn = baseViteConfig as UserConfigFn;
    const resolvedBaseConfig = await baseConfigFn(env);

    const instrumentationPlugin = await createPlaywrightCoveragePlugin({
        enabled: true,
        exclude: [
            ...defaultExclude,
            "src/test/**",
            "playwright/**",
            "**/*.d.ts",
        ],
        include: [
            "src/**/*.ts",
            "src/**/*.tsx",
            "electron/**/*.ts",
            "shared/**/*.ts",
        ],
        projectRoot: path.resolve(dirname),
    });

    const plugins = ensurePluginArray(resolvedBaseConfig.plugins);

    if (instrumentationPlugin) {
        plugins.push(instrumentationPlugin);
    }

    return {
        ...resolvedBaseConfig,
        plugins,
    } satisfies UserConfig;
});

export default playwrightCoverageConfig;
