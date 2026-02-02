/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: shared-no-outside-imports
 */

import * as path from "node:path";

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SHARED_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing shared layer modules from depending on renderer or
 * Electron runtime code.
 */
export const sharedNoOutsideImportsRule = {
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
            (normalizedFilename !== NORMALIZED_SHARED_DIR &&
                !normalizedFilename.startsWith(`${NORMALIZED_SHARED_DIR}/`))
        ) {
            return {};
        }

        const importerDirectory = path.dirname(rawFilename);

        /**
         * Reports a violation when a shared module references an external
         * layer.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - Node
         *   to highlight.
         * @param {string} moduleName - The offending module specifier.
         */
        function report(node, moduleName) {
            context.report({
                data: { module: moduleName },
                messageId: "noExternalImports",
                node,
            });
        }

        /**
         * Determines whether a module specifier refers to a disallowed target.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - AST
         *   node to highlight if violation occurs.
         * @param {string} moduleName - Module specifier to inspect.
         */
        function handleModuleSpecifier(node, moduleName) {
            // Allow shared alias imports.
            if (moduleName.startsWith("@shared")) {
                return;
            }

            // Disallow importing renderer/electron layers via aliases or bare
            // Top-level folder imports.
            if (
                moduleName === "@app" ||
                moduleName.startsWith("@app/") ||
                moduleName === "@electron" ||
                moduleName.startsWith("@electron/") ||
                moduleName.startsWith("src/") ||
                moduleName.startsWith("electron/")
            ) {
                report(node, moduleName);
                return;
            }

            // For non-relative (package) imports we don't enforce anything
            // Here.
            if (!moduleName.startsWith(".")) {
                return;
            }

            const resolved = normalizePath(
                path.resolve(importerDirectory, moduleName)
            );

            // Allow relative imports that stay within shared.
            if (
                resolved === NORMALIZED_SHARED_DIR ||
                resolved.startsWith(`${NORMALIZED_SHARED_DIR}/`)
            ) {
                return;
            }

            report(node, moduleName);
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
                "disallow shared layer modules from importing renderer or Electron runtime code",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/shared-no-outside-imports.md",
        },
        schema: [],
        messages: {
            noExternalImports:
                'Shared modules must not import from "{{module}}". Shared code should remain platform agnostic.',
        },
    },
};
