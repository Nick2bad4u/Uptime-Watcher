/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to make the internal
 * ESLint plugin easier to maintain and evolve.
 *
 * @file Rule: renderer-no-electron-import
 */

import * as path from "node:path";

import { normalizePath } from "../_internal/path-utils.mjs";
import {
    NORMALIZED_ELECTRON_DIR,
    NORMALIZED_SRC_DIR,
} from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing renderer bundles from importing the Electron runtime
 * directly.
 */
export const rendererNoElectronImportRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (descriptor: {
     *         messageId: string;
     *         node: import("@typescript-eslint/utils").TSESTree.Node;
     *         data?: Record<string, unknown>;
     *     }) => void;
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

        const importerDirectory = path.dirname(rawFilename);

        /**
         * Determines whether the provided module specifier references Electron
         * directly.
         *
         * @param {string} moduleName - Module specifier under evaluation.
         *
         * @returns {boolean} True when the specifier targets the Electron
         *   runtime package.
         */
        function isDirectElectronModule(moduleName) {
            if (moduleName === "electron" || moduleName === "node:electron") {
                return true;
            }

            return (
                moduleName.startsWith("electron/") ||
                moduleName.startsWith("node:electron/") ||
                moduleName.startsWith("@electron/")
            );
        }

        /**
         * Checks if a relative specifier resolves into the Electron backend
         * directory.
         *
         * @param {string} moduleName - Module specifier from an import or
         *   require call.
         *
         * @returns {boolean} True when the resolved path lives inside the
         *   electron source tree.
         */
        function resolvesToElectronDirectory(moduleName) {
            if (!moduleName.startsWith(".")) {
                return false;
            }

            const resolved = normalizePath(
                path.resolve(importerDirectory, moduleName)
            );
            return (
                resolved === NORMALIZED_ELECTRON_DIR ||
                resolved.startsWith(`${NORMALIZED_ELECTRON_DIR}/`)
            );
        }

        /**
         * Reports an invalid Electron dependency usage.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - AST
         *   node to highlight.
         * @param {string} moduleName - Name of the offending module specifier.
         *
         * @returns {void}
         */
        function reportViolation(node, moduleName) {
            context.report({
                data: { module: moduleName },
                messageId: "forbiddenElectronImport",
                node,
            });
        }

        /**
         * Evaluates a static module specifier and raises a lint violation when
         * it references Electron.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - Node
         *   owning the literal specifier.
         * @param {string} moduleName - Literal module specifier value.
         *
         * @returns {void}
         */
        function handleStaticSpecifier(node, moduleName) {
            if (
                isDirectElectronModule(moduleName) ||
                resolvesToElectronDirectory(moduleName)
            ) {
                reportViolation(node, moduleName);
            }
        }

        return {
            /**
             * @param {{
             *     callee: { type: string; name: string };
             *     arguments: string | any[];
             * }} node
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
                        handleStaticSpecifier(
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
                    handleStaticSpecifier(node.source, node.source.value);
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
                    handleStaticSpecifier(node.source, node.source.value);
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow renderer code from importing Electron packages or backend modules directly.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-electron-import.md",
        },
        schema: [],
        messages: {
            forbiddenElectronImport:
                'Renderer modules must not import from "{{module}}". Use preload bridges or shared contracts instead.',
        },
    },
};
