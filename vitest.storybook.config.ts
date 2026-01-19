/**
 * Vitest configuration for Storybook story tests.
 *
 * @remarks
 * `@storybook/addon-vitest`'s Vite plugin currently relies on micromatch to
 * decide which modules to transform. On Windows, the plugin builds glob
 * patterns using backslashes, which micromatch does **not** match, resulting
 * in story modules never being transformed into runnable tests.
 *
 * To keep Storybook story tests working on Windows, we apply Storybook's
 * `vitestTransform` ourselves for story files under `storybook/stories/**`.
 */

import type { Plugin } from "vite";

import { playwright } from "@vitest/browser-playwright";
import * as path from "node:path";
import { vitestTransform } from "storybook/internal/csf-tools";
import {
    defineConfig,
    type ViteUserConfig,
    type ViteUserConfigExport,
} from "vitest/config";

import {
    createStorybookBaseViteConfig,
    createStorybookPlugins,
    createStorybookReactPluginOptions,
    ensureStorybookCoverageDirectory,
    storybookCoverageDirectory,
} from "./storybook/viteSharedConfig";

const reactPluginOptions = createStorybookReactPluginOptions();

const sonarReportOutputPath = path.join(
    storybookCoverageDirectory,
    "sonar-report.xml"
);

const vitestJsonOutputPath = path.join(
    storybookCoverageDirectory,
    "test-results.json"
);

const normalizeViteId = (id: string): string => id.split("?")[0] ?? id;

interface VitestTransformResultLike {
    readonly code: string;
    readonly map: unknown;
}

const isVitestTransformResultLike = (
    value: unknown
): value is VitestTransformResultLike => {
    if (value === null || typeof value !== "object") {
        return false;
    }

    const record = value as Record<string, unknown>;
    return typeof record["code"] === "string" && "map" in record;
};


const createStorybookStoriesTransformPlugin = (): Plugin => {
    const configDir = path.resolve(process.cwd(), ".storybook");

    return {
        enforce: "pre",
        name: "uptime-watcher:storybook-vitest-transform",
        async transform(code, id) {
            const fileName = normalizeViteId(id);
            const normalizedForMatch = fileName.replaceAll("\\\\", "/");

            if (
                !normalizedForMatch.includes("/storybook/stories/") ||
                !normalizedForMatch.endsWith(".stories.tsx")
            ) {
                return null;
            }

            const rawResult: unknown = await vitestTransform({
                code,
                configDir,
                fileName,
                previewLevelTags: [],
                stories: ["../storybook/stories/**/*.stories.tsx"],
                // Run all stories by default; individual stories can opt out
                // via tags/parameters.
                tagsFilter: {
                    exclude: [],
                    include: [],
                    skip: [],
                },
            });

            if (!isVitestTransformResultLike(rawResult)) {
                throw new TypeError(
                    "Unexpected Storybook vitestTransform output shape"
                );
            }

            return {
                code: rawResult.code,
            };
        },
    };
};

const createStorybookVitestConfig = async (): Promise<ViteUserConfig> => {
    await ensureStorybookCoverageDirectory();

    const baseViteConfig = createStorybookBaseViteConfig();
    const electronLogRendererStubPath = path.resolve(
        process.cwd(),
        "storybook/shims/electronLogRenderer.stub.ts"
    );

    return {
        ...baseViteConfig,
        cacheDir: "./.cache/vitest/storybook",
        optimizeDeps: {
            ...baseViteConfig.optimizeDeps,
            include: [
                ...(baseViteConfig.optimizeDeps?.include ?? []),
                // Storybook + vitest addon internals used by portable stories.
                "@storybook/addon-vitest/internal/test-utils",
                "storybook/actions",
                "storybook/test",
                "storybook/theming",
                "storybook/viewport",
                // Utility deps pulled in by Storybook/theming/actions.
                "fast-deep-equal",
                // Charts used by analytics stories.
                "chart.js",
                "chartjs-adapter-date-fns",
                "chartjs-plugin-zoom",
                // Icons referenced by various stories.
                "react-icons/bi",
                "react-icons/bs",
                "react-icons/fi",
                "react-icons/go",
                "react-icons/hi2",
                "react-icons/io5",
                "react-icons/md",
                "react-icons/ri",
                "react-icons/si",
                "react-icons/tb",
                "react-icons/vsc",
            ],
        },
        plugins: createStorybookPlugins({
            additionalPlugins: [createStorybookStoriesTransformPlugin()],
            reactOptions: reactPluginOptions,
        }),
        publicDir: "public",
        resolve: {
            ...baseViteConfig.resolve,
            alias: {
                ...baseViteConfig.resolve?.alias,
                "electron-log/renderer": electronLogRendererStubPath,
            },
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
                provider: playwright(),
            },
            coverage: {
                provider: "v8",
                reporter: [
                    "text",
                    "json",
                    "lcov",
                ],
                reportsDirectory: storybookCoverageDirectory,
            },
            fileParallelism: false,
            globals: true,
            include: ["storybook/stories/**/*.stories.tsx"],
            isolate: true,
            maxWorkers: 1,
            name: "storybook",
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
        },
    };
};

/**
 * Vitest configuration export for Storybook story tests.
 */
const storybookVitestConfig: ViteUserConfigExport = defineConfig(
    createStorybookVitestConfig
);

export default storybookVitestConfig;
