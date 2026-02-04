/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: renderer-no-direct-electron-log
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule restricting direct usage of electron-log/renderer.
 *
 * @remarks
 * Renderer logging should be centralized through `src/services/logger.ts` (and
 * the IPC helper fallback) to avoid a proliferation of custom logging setups.
 */
export const rendererNoDirectElectronLogRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { data: { module: any }; messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Allow canonical logger modules.
        if (
            normalizedFilename.endsWith("/src/services/logger.ts") ||
            normalizedFilename.endsWith(
                "/src/services/utils/createIpcServiceHelpers.ts"
            )
        ) {
            return {};
        }

        const forbiddenModules = new Set([
            "electron-log",
            "electron-log/renderer",
        ]);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const moduleName = node.source.value;
                if (!forbiddenModules.has(moduleName)) {
                    return;
                }

                context.report({
                    data: { module: moduleName },
                    messageId: "useRendererLogger",
                    node: node.source,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow importing electron-log/renderer outside the renderer logger modules.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-direct-electron-log.md",
        },
        schema: [],
        messages: {
            useRendererLogger:
                "Do not import {{module}} here. Use src/services/logger.ts (or inject a logger) to keep logging centralized.",
        },
    },
};
