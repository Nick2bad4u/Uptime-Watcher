// eslint-disable-next-line import-x/no-unassigned-import, import-x/extensions -- ensure web storage shim registers before Storybook config executes
import "./shims/nodeWebStorage.ts";

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
    // eslint-disable-next-line import-x/extensions -- storybook wants an extension
} from "./viteSharedConfig.ts";

/**
 * Storybook 9 migration reference:
 *
 * - {@link https://github.com/storybookjs/storybook/blob/next/MIGRATION.md | Storybook migration guide entry covering retired packages}
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

/**
 * Determines whether we're running in test mode (Vitest) vs. dev mode (browser
 * UI).
 */
const isTestMode = (): boolean =>
    /* eslint-disable n/no-process-env -- used to detect test mode */
    process.env["VITEST"] === "true" ||
    process.env["NODE_ENV"] === "test" ||
    process.argv.includes("--test");

const isCoverageMode = (): boolean => process.env["VITE_COVERAGE"] === "true";

/* eslint-enable n/no-process-env -- turn back on */

/**
 * Primary Storybook configuration for the React/Vite renderer.
 *
 * @remarks
 * This config is shared between the modern `storybook/` layout and the previous
 * `.storybook` shim to keep addons and Vite settings aligned.
 */
const config: StorybookConfig = {
    addons: [
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-links",
        "@storybook/addon-themes",
        "storybook-addon-jsx",
        ...(isCoverageMode()
            ? ([
                  {
                      name: "@storybook/addon-coverage",
                      options: coverageOptions,
                  },
              ] as const)
            : []),
        "@storybook/addon-designs",
        // Only load @storybook/addon-vitest during test runs, not in the browser UI
        // This prevents "store not ready" errors when clicking test buttons in the UI
        ...(isTestMode() ? ["@storybook/addon-vitest" as const] : []),
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
    stories: ["./stories/**/*.stories.tsx"],
    viteFinal: (existingConfig, options) => {
        // We deploy Storybook under a sub-path of the GitHub Pages site
        // (`/Uptime-Watcher/storybook/`). Using a relative base keeps the build
        // portable and prevents absolute `/assets/...` URLs from breaking.
        const shouldUseRelativeBase = options.configType === "PRODUCTION";

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
                ...(shouldUseRelativeBase ? { base: "./" } : {}),
                plugins,
            },
            baseViteConfig
        );
    },
};

export default config;
