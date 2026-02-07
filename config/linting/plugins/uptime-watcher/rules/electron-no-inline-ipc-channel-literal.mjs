/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-inline-ipc-channel-literal
 */

import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule requiring IPC channel constants for handler registration.
 *
 * @remarks
 * Prevents new, inline channel strings from being introduced in handler
 * registration calls.
 *
 * In this codebase, canonical channel constants live in `@shared/types/preload`
 * as `*_CHANNELS` mappings.
 */
export const electronNoInlineIpcChannelLiteralRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { messageId: string; node: any }) => void;
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

        // The IPC utils module is the lower-level infrastructure and may need
        // To use literals in internal examples or test-only helpers.
        if (normalizedFilename.endsWith("/electron/services/ipc/utils.ts")) {
            return {};
        }

        /**
         * @param {
         *     | import("@typescript-eslint/utils").TSESTree.Expression
         *     | import("@typescript-eslint/utils").TSESTree.SpreadElement
         *     | null
         *     | undefined} argument
         */
        function isInlineStringLiteral(argument) {
            if (!argument) {
                return false;
            }

            if (
                argument.type === "Literal" &&
                typeof argument.value === "string"
            ) {
                return true;
            }

            if (
                argument.type === "TemplateLiteral" &&
                argument.expressions.length === 0
            ) {
                return true;
            }

            return false;
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                if (node.callee.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                const firstArgument = node.arguments[0];
                if (!isInlineStringLiteral(firstArgument)) {
                    return;
                }

                context.report({
                    messageId: "useSharedChannelConstant",
                    node: firstArgument,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow inline string literals as IPC channel names in registerStandardizedIpcHandler calls.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-inline-ipc-channel-literal.md",
        },
        schema: [],
        messages: {
            useSharedChannelConstant:
                "Do not inline IPC channel strings. Use a shared *_CHANNELS constant (from @shared/types/preload) or another imported channel constant.",
        },
    },
};
