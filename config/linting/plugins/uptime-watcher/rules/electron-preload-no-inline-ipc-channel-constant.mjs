/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-preload-no-inline-ipc-channel-constant
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule preventing preload code from defining inline IPC channel string
 * constants.
 *
 * @remarks
 * The preload layer should import canonical channel constants from shared
 * types (e.g. `@shared/types/preload`) instead of redefining channel strings.
 * This prevents drift and keeps AI changes on the established contract
 * codepath.
 */
export const electronPreloadNoInlineIpcChannelConstantRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/preload/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} expression
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.Expression | null}
         */
        function unwrapTsExpression(expression) {
            if (!expression) {
                return null;
            }

            if (
                expression.type === "TSAsExpression" ||
                expression.type === "TSSatisfiesExpression" ||
                expression.type === "TSTypeAssertion"
            ) {
                return unwrapTsExpression(expression.expression);
            }

            return expression;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} expression
         */
        function isInlineStringLiteral(expression) {
            const unwrapped = unwrapTsExpression(expression);
            if (!unwrapped) {
                return false;
            }

            if (
                unwrapped.type === "Literal" &&
                typeof unwrapped.value === "string"
            ) {
                return true;
            }

            return (
                unwrapped.type === "TemplateLiteral" &&
                unwrapped.expressions.length === 0
            );
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                if (node.id.type !== "Identifier") {
                    return;
                }

                // Heuristic: most channel constants are ALL_CAPS with CHANNEL
                // In the name.
                if (!/CHANNEL/v.test(node.id.name)) {
                    return;
                }

                if (!isInlineStringLiteral(node.init)) {
                    return;
                }

                context.report({
                    messageId: "noInlineChannelConstant",
                    node: node.id,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow defining inline *_CHANNEL string constants in electron/preload; use shared channel constants instead.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-preload-no-inline-ipc-channel-constant.md",
        },
        schema: [],
        messages: {
            noInlineChannelConstant:
                "Do not define IPC channel string constants here. Import canonical channel constants from @shared/types/preload (or another shared registry).",
        },
    },
};
