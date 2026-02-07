/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-renderer-import
 */

import * as path from "node:path";

import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import {
    NORMALIZED_ELECTRON_DIR,
    NORMALIZED_SRC_DIR,
} from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule ensuring Electron runtime code never depends on renderer bundles.
 */
export const electronNoRendererImportRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { data: { module: any }; messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        const importerDirectory = path.dirname(rawFilename);

        /**
         * @param {string} moduleName
         */
        function referencesRenderer(moduleName) {
            if (moduleName === "@app" || moduleName.startsWith("@app/")) {
                return true;
            }

            if (moduleName.startsWith("src/")) {
                return true;
            }

            if (!moduleName.startsWith(".")) {
                return false;
            }

            const resolved = normalizePath(
                path.resolve(importerDirectory, moduleName)
            );

            return (
                resolved === NORMALIZED_SRC_DIR ||
                resolved.startsWith(`${NORMALIZED_SRC_DIR}/`)
            );
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node
         * @param {string} moduleName
         */
        function handleModuleSpecifier(node, moduleName) {
            if (!referencesRenderer(moduleName)) {
                return;
            }

            context.report({
                data: { module: moduleName },
                messageId: "noRendererImport",
                node,
            });
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                if (
                    node.callee.type === "Identifier" &&
                    node.callee.name === "require" &&
                    node.arguments.length > 0
                ) {
                    const [firstArgument] = node.arguments;
                    if (
                        firstArgument?.type === "Literal" &&
                        typeof firstArgument.value === "string"
                    ) {
                        handleModuleSpecifier(
                            firstArgument,
                            firstArgument.value
                        );
                    }
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleModuleSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportExpression} node
             */
            ImportExpression(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleModuleSpecifier(node.source, node.source.value);
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow Electron runtime modules from importing renderer bundles",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-renderer-import.md",
        },
        schema: [],
        messages: {
            noRendererImport:
                'Electron runtime code must not import from "{{module}}". Use shared contracts or preload bridges instead.',
        },
    },
};
