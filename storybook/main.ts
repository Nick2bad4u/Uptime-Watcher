import type { AddonOptionsVite } from "@storybook/addon-coverage";
import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

import viteReact from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

/**
 * Storybook 9 migration reference:
 *
 * - {@link https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-support-for-legacy-packages}
 *   `@storybook/addon-actions` ➜ `storybook/actions`
 *   `@storybook/addon-essentials` ➜ built into core (no explicit addon
 *   required)
 */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

type BabelPlugin =
    | ((...parameters: readonly unknown[]) => unknown)
    | Readonly<Record<string, unknown>>;

type ReactPluginOptions = NonNullable<Parameters<typeof viteReact>[0]>;

const isBabelPlugin = (value: unknown): value is BabelPlugin => {
    if (typeof value === "function") {
        return true;
    }

    if (typeof value === "object" && value !== null) {
        return true;
    }

    return false;
};

const loadReactCompilerPlugins = (): readonly BabelPlugin[] => {
    try {
        const pluginModule: unknown = require("babel-plugin-react-compiler");

        if (isBabelPlugin(pluginModule)) {
            return [pluginModule];
        }

        if (typeof pluginModule === "object" && pluginModule !== null) {
            const moduleWithDefault = pluginModule as { default?: unknown };
            const defaultExport = moduleWithDefault.default;

            if (isBabelPlugin(defaultExport)) {
                return [defaultExport];
            }
        }
    } catch {
        return [];
    }

    return [];
};

// Keep globs aligned with vitest.storybook.config.ts coverage filters.
const coverageIncludeGlobs = [
    "src/**/*.{ts,tsx}",
    "shared/**/*.{ts,tsx}",
] as const;

const coverageExcludeGlobs = [
    "electron/**",
    "shared/test/**",
    "src/test/**",
    "storybook/**",
    "**/*.stories.*",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.bench.*",
    "**/*.d.ts",
] as const;

const coverageOptions: AddonOptionsVite = {
    istanbul: {
        exclude: Array.from(coverageExcludeGlobs),
        extension: [
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
        ],
        include: Array.from(coverageIncludeGlobs),
        requireEnv: true,
    },
};

const config: StorybookConfig = {
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-themes",
        {
            name: "@storybook/addon-coverage",
            options: coverageOptions,
        },
        "@storybook/addon-vitest",
        "msw-storybook-addon",
    ],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    stories: [
        {
            directory: "../storybook/stories",
            files: "**/*.mdx",
        },
        {
            directory: "../storybook/stories",
            files: "**/*.stories.@(ts|tsx)",
        },
    ],
    viteFinal: (existingConfig) => {
        const reactCompilerPlugins = loadReactCompilerPlugins();

        const toArray = (
            plugins: PluginOption | PluginOption[] | undefined
        ): PluginOption[] => {
            if (!plugins) {
                return [];
            }

            if (Array.isArray(plugins)) {
                return plugins.flatMap((plugin) => toArray(plugin));
            }

            return [plugins];
        };

        const preservedPlugins = toArray(existingConfig.plugins).filter(
            (plugin) => {
                if (!plugin || typeof plugin !== "object") {
                    return Boolean(plugin);
                }

                const name = "name" in plugin ? plugin.name : undefined;

                return (
                    name !== "vite:react-babel" && name !== "vite:react-refresh"
                );
            }
        );

        const reactPluginOptions: ReactPluginOptions = {
            jsxRuntime: "automatic",
            ...(reactCompilerPlugins.length > 0
                ? { babel: { plugins: Array.from(reactCompilerPlugins) } }
                : {}),
        };

        const plugins: PluginOption[] = [
            ...preservedPlugins,
            viteReact(reactPluginOptions),
        ];

        return mergeConfig(
            {
                ...existingConfig,
                plugins,
            },
            {
                css: {
                    devSourcemap: true,
                    modules: {
                        generateScopedName: "[name]__[local]___[hash:base64:5]",
                        localsConvention: "camelCase",
                    },
                },
                optimizeDeps: {
                    include: [
                        "@storybook/addon-a11y",
                        "@storybook/addon-docs",
                        "@storybook/addon-coverage",
                        "@storybook/addon-vitest",
                        "msw-storybook-addon",
                        "react",
                        "react-dom",
                    ],
                },
                resolve: {
                    alias: {
                        "@app": path.resolve(dirname, "../src"),
                        "@electron": path.resolve(dirname, "../electron"),
                        "@shared": path.resolve(dirname, "../shared"),
                    },
                },
            }
        );
    },
};

export default config;
