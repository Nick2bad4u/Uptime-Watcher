/**
 * Shared Vite configuration utilities for Storybook tooling.
 *
 * @packageDocumentation
 */

import type { PluginOption, UserConfig } from "vite";

import viteReact from "@vitejs/plugin-react";
import { mkdir } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";

/**
 * React plugin configuration options used across Storybook tooling.
 */
export type ReactPluginOptions = NonNullable<Parameters<typeof viteReact>[0]>;

/**
 * Subset of the Vite user configuration that is shared between Storybook tools.
 */
export type StorybookBaseConfig = Pick<
    UserConfig,
    "css" | "optimizeDeps" | "resolve"
>;

/**
 * Options for building shared Storybook base configuration segments.
 */
export interface StorybookBaseConfigOptions {
    /**
     * Extra path aliases that should be merged into the shared alias map.
     */
    readonly additionalAliases?: Record<string, string>;
    /**
     * Additional dependency identifiers to include in Vite's dependency
     * optimizer.
     */
    readonly additionalOptimizeDeps?: readonly string[];
    /**
     * Additional dependency identifiers that should be skipped by Vite's
     * dependency optimizer.
     */
    readonly additionalOptimizeDepsExclude?: readonly string[];
    /**
     * Optional override for the default resolve.extensions list.
     */
    readonly extensions?: readonly string[];
}

/**
 * Options for composing shared Vite plugin arrays for Storybook environments.
 */
export interface StorybookPluginOptions {
    /** Additional Vite plugins that should be appended after the shared ones. */
    readonly additionalPlugins?: readonly PluginOption[];
    /** Optional override for the React plugin configuration. */
    readonly reactOptions?: ReactPluginOptions;
}

/**
 * Lazily evaluated Node.js require helper used for optional peer dependencies.
 */
const formatUnknownError = (error: unknown): string => {
    if (typeof error === "string") {
        return error;
    }

    if (Error.isError(error)) {
        return error.message;
    }

    return inspect(error, { depth: 2 });
};

const createConfigError = (message: string, error: unknown): Error =>
    new Error(`${message}: ${formatUnknownError(error)}`, { cause: error });

const resolveStorybookModuleDirectory = (): string => {
    try {
        if (typeof import.meta.dirname === "string") {
            return import.meta.dirname;
        }

        return path.dirname(fileURLToPath(import.meta.url));
    } catch (error: unknown) {
        throw createConfigError(
            "Failed to resolve Storybook shared config directory",
            error
        );
    }
};

/** Directory containing this shared configuration module. */
const moduleDirectory = resolveStorybookModuleDirectory();

/**
 * Absolute path to the repository root used by Storybook tooling.
 */
const storybookProjectRoot: string = path.resolve(moduleDirectory, "..");

/**
 * Directory where Storybook coverage artifacts are stored.
 */
export const storybookCoverageDirectory: string = path.resolve(
    storybookProjectRoot,
    "coverage/storybook"
);

/**
 * File glob patterns that should be included when collecting Storybook
 * coverage.
 */
export const storybookCoverageIncludeGlobs: readonly string[] = Object.freeze([
    "src/**/*.{ts,tsx}",
    "shared/**/*.{ts,tsx}",
]);

/**
 * File glob patterns that should be excluded when collecting Storybook
 * coverage.
 */
export const storybookCoverageExcludeGlobs: readonly string[] = Object.freeze([
    "electron/**",
    "shared/test/**",
    "src/test/**",
    "storybook/**",
    "**/*.stories.*",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.bench.*",
    "**/*.d.ts",
]);

/**
 * Default dependency optimization include list shared by Storybook tooling.
 */
const storybookOptimizeDepsInclude: readonly string[] = Object.freeze([
    "@storybook/addon-a11y",
    "@storybook/addon-coverage",
    "@storybook/addon-designs",
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
    "@storybook/react",
    "electron-log/renderer",
    "msw-storybook-addon",
    "react",
    "react-chartjs-2",
    "react-dom",
    "react-dom/client",
    "react/compiler-runtime",
    "validator",
    "zustand",
    "zustand/react/shallow",
    "zustand/middleware",
    "zod",
]);

const storybookResolveExtensions: readonly string[] = Object.freeze([
    ".mjs",
    ".js",
    ".mts",
    ".ts",
    ".jsx",
    ".tsx",
    ".json",
    ".cjs",
    ".cts",
]);

/**
 * Creates the shared React plugin configuration for Storybook Vite builds.
 */
export const createStorybookReactPluginOptions = (): ReactPluginOptions => ({
    jsxRuntime: "automatic",
});

/**
 * Builds the shared Vite plugin array used by Storybook tooling.
 *
 * @param options - Optional plugin composition overrides.
 *
 * @returns Vite plugins configured for Storybook usage.
 */
export const createStorybookPlugins = (
    options?: StorybookPluginOptions
): PluginOption[] => {
    const additionalPlugins = options?.additionalPlugins ?? [];
    const reactOptions =
        options?.reactOptions ?? createStorybookReactPluginOptions();

    return [viteReact(reactOptions), ...additionalPlugins];
};

/**
 * Creates the shared Vite base configuration segments for Storybook builds.
 *
 * @param options - Optional overrides for optimization and aliasing.
 *
 * @returns Partial Vite configuration shared across Storybook workflows.
 */
export const createStorybookBaseViteConfig = (
    options?: StorybookBaseConfigOptions
): StorybookBaseConfig => {
    const optimizeDepsInclude = new Set<string>([
        ...(options?.additionalOptimizeDeps ?? []),
        ...storybookOptimizeDepsInclude,
    ]);
    const optimizeDepsExclude = new Set<string>([
        "@shared/constants",
        "@shared/types",
        "@shared/utils",
        "@shared/validation",
        "lightningcss",
        "playwright",
        "playwright-core",
        ...(options?.additionalOptimizeDepsExclude ?? []),
    ]);

    const alias: Record<string, string> = {
        "@app": path.resolve(storybookProjectRoot, "src"),
        "@assets": path.resolve(storybookProjectRoot, "assets"),
        "@electron": path.resolve(storybookProjectRoot, "electron"),
        "@shared": path.resolve(storybookProjectRoot, "shared"),
    };

    if (options?.additionalAliases) {
        Object.assign(alias, options.additionalAliases);
    }

    const extensions = options?.extensions ?? storybookResolveExtensions;

    return {
        css: {
            devSourcemap: true,
            modules: {
                generateScopedName: "[name]__[local]___[hash:base64:5]",
                localsConvention: "camelCase",
            },
        },
        optimizeDeps: {
            exclude: [...optimizeDepsExclude],
            include: [...optimizeDepsInclude],
            rolldownOptions: {
                resolve: {
                    conditionNames: [
                        "module",
                        "browser",
                        "node",
                    ],
                },
            },
        },
        resolve: {
            alias,
            extensions: [...extensions],
            tsconfigPaths: true,
        },
    };
};

/**
 * Ensures the Storybook coverage directory exists on disk before writing files.
 */
export const ensureStorybookCoverageDirectory = async (): Promise<void> => {
    if (!storybookCoverageDirectory.startsWith(storybookProjectRoot)) {
        throw new Error(
            "Storybook coverage directory must remain inside the project root."
        );
    }

    await mkdir(storybookCoverageDirectory, { recursive: true });
};
