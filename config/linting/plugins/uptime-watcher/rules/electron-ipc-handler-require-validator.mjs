/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-ipc-handler-require-validator
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule requiring that registerStandardizedIpcHandler calls provide a
 * request-validator argument.
 */
export const electronIpcHandlerRequireValidatorRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/services/ipc/handlers/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /** @type {Set<string>} */
        const registrarFunctionNames = new Set();

        return {
            /**
             * Track registrar functions created via:
             *   const register = createStandardizedIpcRegistrar(...)
             *
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                const id = node.id;
                const init = node.init;

                if (id?.type !== "Identifier") {
                    return;
                }

                if (init?.type !== "CallExpression") {
                    return;
                }

                const callee = init.callee;
                if (callee?.type !== "Identifier") {
                    return;
                }

                if (callee.name !== "createStandardizedIpcRegistrar") {
                    return;
                }

                registrarFunctionNames.add(id.name);
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                if (node.callee?.type === "Identifier") {
                    if (node.callee.name !== "registerStandardizedIpcHandler") {
                        // Also enforce registrar usage in handler modules.
                        if (registrarFunctionNames.has(node.callee.name) && (node.arguments ?? []).length < 3) {
                                context.report({
                                    messageId: "missingValidator",
                                    node: node.callee,
                                });
                            }

                        return;
                    }

                    if ((node.arguments ?? []).length < 3) {
                        context.report({
                            messageId: "missingValidator",
                            node: node.callee,
                        });
                    }


                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require providing a validator argument when registering IPC handlers via registerStandardizedIpcHandler",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-ipc-handler-require-validator.md",
        },
        schema: [],
        messages: {
            missingValidator:
                "IPC handlers must include a request validator to validate payloads at the boundary.",
        },
    },
};
