/**
 * Shared Vite configuration utilities for Storybook tooling.
 *
 * @packageDocumentation
 */

import type { PluginOption, UserConfig } from "vite";

import viteReact from "@vitejs/plugin-react";
// eslint-disable-next-line import-x/no-nodejs-modules -- Node filesystem access is required to ensure coverage output directories exist.
import { mkdir } from "node:fs/promises";
// eslint-disable-next-line import-x/no-nodejs-modules -- Node module utilities are required for optional dependency resolution.
import { createRequire } from "node:module";
// eslint-disable-next-line import-x/no-nodejs-modules -- Path resolution executes within the Node.js runtime for build tooling.
import * as path from "node:path";
// eslint-disable-next-line import-x/no-nodejs-modules -- URL helpers are required to compute project-relative paths.
import { fileURLToPath } from "node:url";
// eslint-disable-next-line import-x/no-nodejs-modules -- Utility inspection assists with rich error diagnostics during build-time operations.
import { inspect } from "node:util";
/* eslint-disable-next-line import-x/no-rename-default -- Shared Storybook helpers rely on root-level vite-tsconfig-paths dependency. */
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Narrow type representing the Babel plugin shape expected by the React plugin.
 */
export type BabelPlugin =
    | ((...parameters: readonly unknown[]) => unknown)
    | Readonly<Record<string, unknown>>;

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

    if (error instanceof Error) {
        return error.message;
    }

    return inspect(error, { depth: 2 });
};

const createConfigError = (message: string, error: unknown): Error =>
    new Error(`${message}: ${formatUnknownError(error)}`, { cause: error });

type SafeRequire = (specifier: string) => unknown;

const createSafeRequire = (): SafeRequire => {
    try {
        const nodeRequire = createRequire(import.meta.url);
        return (specifier: string): unknown => nodeRequire(specifier);
    } catch (error: unknown) {
        throw createConfigError(
            "Failed to create Storybook require shim",
            error
        );
    }
};

const resolveStorybookModuleDirectory = (): string => {
    try {
        if (typeof import.meta.dirname === "string") {
            return import.meta.dirname;
        }

        // eslint-disable-next-line unicorn/prefer-import-meta-properties -- Fallback for environments lacking import.meta.dirname support.
        return path.dirname(fileURLToPath(import.meta.url));
    } catch (error: unknown) {
        throw createConfigError(
            "Failed to resolve Storybook shared config directory",
            error
        );
    }
};

const requireModule = createSafeRequire();

/** Directory containing this shared configuration module. */
const moduleDirectory = resolveStorybookModuleDirectory();

/**
 * Absolute path to the repository root used by Storybook tooling.
 */
export const storybookProjectRoot: string = path.resolve(moduleDirectory, "..");

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
export const storybookOptimizeDepsInclude: readonly string[] = Object.freeze([
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

export const storybookResolveExtensions: readonly string[] = Object.freeze([
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
 * Determines whether a value satisfies the {@link BabelPlugin} contract.
 *
 * @param value - Value to inspect.
 *
 * @returns True when the value can be consumed as a Babel plugin.
 */
const isBabelPlugin = (value: unknown): value is BabelPlugin =>
    typeof value === "function" ||
    (typeof value === "object" && value !== null);

/**
 * Loads optional React compiler plugins if they are available.
 *
 * @returns A list containing the compiler plugin when installed, otherwise an
 *   empty array.
 */
export const loadReactCompilerPlugins = (): readonly BabelPlugin[] => {
    try {
        const pluginModule = requireModule("babel-plugin-react-compiler");

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

/**
 * Creates a React plugin configuration that reuses the shared compiler probes.
 *
 * @returns Configuration object for the React Vite plugin.
 */
export const createStorybookReactPluginOptions = (): ReactPluginOptions => {
    const compilerPlugins = loadReactCompilerPlugins();

    return compilerPlugins.length > 0
        ? {
              babel: {
                  plugins: Array.from(compilerPlugins),
              },
              jsxRuntime: "automatic",
          }
        : {
              jsxRuntime: "automatic",
          };
};

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

    return [
        tsconfigPaths(),
        viteReact(reactOptions),
        ...additionalPlugins,
    ];
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
            esbuildOptions: {
                conditions: [
                    "module",
                    "browser",
                    "node",
                ],
            },
            exclude: Array.from(optimizeDepsExclude),
            include: Array.from(optimizeDepsInclude),
        },
        resolve: {
            alias,
            extensions: Array.from(extensions),
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

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Path was validated to reside within the project root above.
    await mkdir(storybookCoverageDirectory, { recursive: true });
};
