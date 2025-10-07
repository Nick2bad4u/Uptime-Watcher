/**
 * Vitest configuration for Storybook component tests executed via the
 * `@storybook/addon-vitest` plugin.
 */

import type { PluginOption } from "vite";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import {
    defineConfig,
    type UserConfigExport,
    type ViteUserConfig,
} from "vitest/config";

const projectRoot = import.meta.dirname;
const require = createRequire(import.meta.url);

type BabelPlugin =
    | ((...parameters: readonly unknown[]) => unknown)
    | Readonly<Record<string, unknown>>;

type ReactPluginOptions = NonNullable<Parameters<typeof react>[0]>;

type StorybookTestOptions = Parameters<typeof storybookTest>[0];

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

const reactCompilerPlugins = loadReactCompilerPlugins();

const reactPluginOptions: ReactPluginOptions = {
    jsxRuntime: "automatic",
    ...(reactCompilerPlugins.length > 0
        ? { babel: { plugins: Array.from(reactCompilerPlugins) } }
        : {}),
};

const storybookPluginOptions: StorybookTestOptions = {
    configDir: ".storybook",
    storybookScript: "npm run storybook",
    storybookUrl: "http://localhost:6006",
};

const storybookCoverageDirectory = path.resolve(
    projectRoot,
    "coverage/storybook"
);
const sonarReportOutputPath = path.join(
    storybookCoverageDirectory,
    "sonar-report.xml"
);
const vitestJsonOutputPath = path.join(
    storybookCoverageDirectory,
    "test-results.json"
);

const ensureCoverageDirectory = async (): Promise<void> => {
    if (!storybookCoverageDirectory.startsWith(projectRoot)) {
        throw new Error(
            "Storybook coverage directory must reside within the project root."
        );
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Path validated to stay within the project root.
    await mkdir(storybookCoverageDirectory, { recursive: true });
};

const createStorybookVitestConfig = async (): Promise<ViteUserConfig> => {
    await ensureCoverageDirectory();

    return {
        cacheDir: "./.cache/vitest/storybook",
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
                "@storybook/addon-coverage",
                "@storybook/addon-docs",
                "@storybook/addon-vitest",
                "@storybook/react",
                "chart.js",
                "chartjs-adapter-date-fns",
                "chartjs-plugin-zoom",
                "electron-log/renderer",
                "msw-storybook-addon",
                "react",
                "react-chartjs-2",
                "react-dom",
                "react-dom/client",
                "react-icons/fa",
                "react-icons/fi",
                "react-icons/md",
                "react/compiler-runtime",
                "storybook/actions",
                "storybook/internal/channels",
                "validator",
                "zustand",
                "zustand/middleware",
                "zod",
            ],
        },
        plugins: [
            tsconfigPaths(),
            react(reactPluginOptions) as PluginOption,
            storybookTest(storybookPluginOptions),
        ],
        publicDir: "public",
        resolve: {
            alias: {
                "@app": path.resolve(projectRoot, "src"),
                "@assets": path.resolve(projectRoot, "assets"),
                "@electron": path.resolve(projectRoot, "electron"),
                "@shared": path.resolve(projectRoot, "shared"),
            },
            extensions: [
                ".mjs",
                ".js",
                ".mts",
                ".ts",
                ".jsx",
                ".tsx",
                ".json",
                ".cjs",
                ".cts",
            ],
        },
        test: {
            browser: {
                enabled: true,
                headless: true,
                instances: [
                    {
                        browser: "chromium",
                    },
                ],
                provider: "playwright",
            },
            coverage: {
                enabled: false,
                exclude: [
                    "**/*.stories.*",
                    "**/*.test.*",
                    "**/*.spec.*",
                    "**/*.bench.*",
                    "**/*.d.ts",
                    "electron/**",
                    "storybook/**",
                ],
                experimentalAstAwareRemapping: false,
                include: ["src/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}"],
                provider: "v8",
                reporter: [
                    "text",
                    "json-summary",
                    "lcov",
                ],
                reportsDirectory: storybookCoverageDirectory,
            },
            css: {
                modules: {
                    classNameStrategy: "stable",
                },
            },
            environment: "browser",
            globals: true,
            isolate: true,
            name: {
                color: "magenta",
                label: "Storybook",
            },
            outputFile: {
                json: vitestJsonOutputPath,
            },
            reporters: [
                "dot",
                "hanging-process",
                [
                    "vitest-sonar-reporter",
                    {
                        outputFile: sonarReportOutputPath,
                        silent: true,
                    },
                ],
            ],
            setupFiles: ["./storybook/vitest.setup.ts"],
            snapshotSerializers: [],
            typecheck: {
                enabled: false,
            },
        },
    };
};

const storybookVitestConfig: UserConfigExport = defineConfig(
    createStorybookVitestConfig
);

export default storybookVitestConfig;
