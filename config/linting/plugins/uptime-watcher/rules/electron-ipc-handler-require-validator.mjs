/**
 * @file Rule: electron-ipc-handler-require-validator
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule requiring that registerStandardizedIpcHandler calls provide a
 * request-validator argument.
 */
export const electronIpcHandlerRequireValidatorRule = {
    /**
     * @param {{ getFilename: () => any; report: (arg0: { node: any; messageId: string; }) => void; }} context
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

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                if (node.callee?.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                if ((node.arguments ?? []).length < 3) {
                    context.report({
                        messageId: "missingValidator",
                        node: node.callee,
                    });
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
                "registerStandardizedIpcHandler must include a validator argument (or explicit null) to keep runtime validation consistent.",
        },
    },
};
