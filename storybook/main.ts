import "./shims/nodeWebStorage";

import type { AddonOptionsVite } from "@storybook/addon-coverage";
import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

import { mergeConfig } from "vite";

import {
    createStorybookBaseViteConfig,
    createStorybookPlugins,
    createStorybookReactPluginOptions,
    storybookCoverageExcludeGlobs,
    storybookCoverageIncludeGlobs,
} from "./viteSharedConfig";

/**
 * Storybook 9 migration reference:
 *
 * - {@link https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-support-for-legacy-packages}
 * - `@storybook/addon-actions` ➜ `storybook/actions`
 * - `@storybook/addon-essentials` ➜ built into core (no explicit addon required)
 * - `@storybook/addon-interactions`, `@storybook/addon-measure`,
 *   `@storybook/addon-outline`, and `@storybook/addon-viewport` ➜ consolidated
 *   into Storybook core (features exposed without extra addons)
 */

const coverageOptions: AddonOptionsVite = {
    istanbul: {
        exclude: Array.from(storybookCoverageExcludeGlobs),
        extension: [
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
        ],
        include: Array.from(storybookCoverageIncludeGlobs),
        requireEnv: true,
    },
};

const config: StorybookConfig = {
    addons: [
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-links",
        "@storybook/addon-themes",
        {
            name: "@storybook/addon-coverage",
            options: coverageOptions,
        },
        "@storybook/addon-designs",
        "@storybook/addon-vitest",
        "msw-storybook-addon",
    ],
    docs: {
        // 👇 See the table below for the list of supported options
        defaultName: "Documentation",
    },
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    stories: ["./stories/**/*.mdx", "./stories/**/*.stories.@(ts|tsx)"],
    viteFinal: (existingConfig) => {
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

        const reactPluginOptions = createStorybookReactPluginOptions();

        const sharedPlugins = createStorybookPlugins({
            reactOptions: reactPluginOptions,
        });

        const sharedPluginNames = new Set(
            sharedPlugins
                .map((plugin) =>
                    plugin && typeof plugin === "object" && "name" in plugin
                        ? (plugin.name as string | undefined)
                        : undefined
                )
                .filter((name): name is string => typeof name === "string")
        );

        const baseViteConfig = createStorybookBaseViteConfig();

        const plugins: PluginOption[] = [
            ...preservedPlugins.filter((plugin) => {
                if (!plugin || typeof plugin !== "object") {
                    return Boolean(plugin);
                }

                const name = "name" in plugin ? plugin.name : undefined;

                if (typeof name !== "string") {
                    return true;
                }

                return !sharedPluginNames.has(name);
            }),
            ...sharedPlugins,
        ];

        return mergeConfig(
            {
                ...existingConfig,
                plugins,
            },
            baseViteConfig
        );
    },
};

export default config;
