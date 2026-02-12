/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: renderer-no-ipc-renderer-usage
 */

import {
    getContextFilename,
    getContextSourceCode,
} from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule forbidding ipcRenderer usage in renderer application code.
 *
 * @remarks
 * Renderer IPC must flow through the preload bridge (`window.electronAPI`) and
 * the service wrappers in `src/services/*`. Direct ipcRenderer usage creates
 * parallel codepaths that bypass validation, readiness checks, and error
 * normalization.
 */
export const rendererNoIpcRendererUsageRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     getSourceCode: () => any;
     *     sourceCode?: any;
     *     report: (descriptor: {
     *         messageId: string;
     *         node: any;
     *         data?: Record<string, unknown>;
     *     }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context),
            normalizedFilename = normalizePath(rawFilename),
            sourceCode = getContextSourceCode(context);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /** @type {Set<string>} */
        const electronModuleBindings = new Set();

        /**
         * @param {string} name
         * @param {any} node
         */
        function hasLocalBinding(name, node) {
            let scope = sourceCode.getScope(
                /** @type {import("estree").Node} */ (node)
            );

            while (true) {
                const variable = scope.set.get(name);
                if (variable && variable.defs.length > 0) {
                    return true;
                }

                const upper = scope.upper;
                if (!upper) {
                    return false;
                }

                scope = upper;
            }
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node
         */
        function report(node) {
            context.report({
                messageId: "noIpcRenderer",
                node,
            });
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression} expression
         */
        function isRequireElectronCall(expression) {
            return (
                expression.type === "CallExpression" &&
                expression.callee.type === "Identifier" &&
                expression.callee.name === "require" &&
                expression.arguments.length === 1 &&
                expression.arguments[0]?.type === "Literal" &&
                expression.arguments[0].value === "electron"
            );
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} member
         * @param {string | number | bigint | boolean | RegExp | null} name
         */
        function isPropertyNamed(member, name) {
            if (member.computed) {
                return (
                    member.property.type === "Literal" &&
                    member.property.value === name
                );
            }

            return (
                member.property.type === "Identifier" &&
                member.property.name === name
            );
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                // Detect destructuring `require("electron")` that pulls
                // `ipcRenderer`.
                if (
                    node.callee.type !== "Identifier" ||
                    node.callee.name !== "require" ||
                    node.arguments.length !== 1
                ) {
                    return;
                }

                const [first] = node.arguments;
                if (
                    !first ||
                    first.type !== "Literal" ||
                    first.value !== "electron"
                ) {
                    return;
                }

                const { parent } = node;
                if (
                    parent &&
                    parent.type === "VariableDeclarator" &&
                    parent.id &&
                    parent.id.type === "ObjectPattern" &&
                    parent.id.properties.some((property) => {
                        if (property.type !== "Property") {
                            return false;
                        }

                        if (property.computed) {
                            return false;
                        }

                        return (
                            property.key.type === "Identifier" &&
                            property.key.name === "ipcRenderer"
                        );
                    })
                ) {
                    report(node);
                }
            },

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
                if (moduleName !== "electron") {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type === "ImportSpecifier") {
                        const importedName =
                            specifier.imported.type === "Identifier"
                                ? specifier.imported.name
                                : typeof specifier.imported.value === "string"
                                  ? specifier.imported.value
                                  : null;

                        if (importedName === "ipcRenderer") {
                            report(specifier);
                        }
                        continue;
                    }

                    // Track default/namespace imports for later member checks
                    // Like `electron.ipcRenderer`.
                    if (
                        specifier.type === "ImportDefaultSpecifier" ||
                        specifier.type === "ImportNamespaceSpecifier"
                    ) {
                        electronModuleBindings.add(specifier.local.name);
                    }
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} node
             */
            MemberExpression(node) {
                // IpcRenderer.invoke(...)
                if (node.object.type === "Identifier") {
                    if (
                        node.object.name === "ipcRenderer" &&
                        !hasLocalBinding("ipcRenderer", node)
                    ) {
                        report(node.object);
                        return;
                    }

                    // Electron.ipcRenderer (where `electron` came from
                    // Require/import)
                    if (
                        electronModuleBindings.has(node.object.name) &&
                        isPropertyNamed(node, "ipcRenderer")
                    ) {
                        report(node.property);
                        return;
                    }
                }

                // Require("electron").ipcRenderer
                if (
                    isPropertyNamed(node, "ipcRenderer") &&
                    node.object.type === "CallExpression" &&
                    isRequireElectronCall(node.object)
                ) {
                    report(node.property);
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                if (!node.init || node.id.type !== "Identifier") {
                    return;
                }

                if (!isRequireElectronCall(node.init)) {
                    return;
                }

                electronModuleBindings.add(node.id.name);
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow ipcRenderer usage in src/*; use the preload bridge and services instead.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-ipc-renderer-usage.md",
        },
        schema: [],
        messages: {
            noIpcRenderer:
                "Do not use ipcRenderer in renderer code. Use window.electronAPI via src/services/* instead.",
        },
    },
};
