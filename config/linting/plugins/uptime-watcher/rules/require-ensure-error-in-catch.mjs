/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 *
 * @file Rule: require-ensure-error-in-catch
 */

import {
    getContextFilename,
    getContextSourceCode,
} from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule requiring caught `unknown` errors to be normalized before
 * accessing properties.
 */
export const requireEnsureErrorInCatchRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     sourceCode: any;
     *     getSourceCode: () => any;
     *     report: (arg0: {
     *         data: { name: any };
     *         messageId: string;
     *         node: import("@typescript-eslint/utils").TSESTree.Node;
     *     }) => void;
     * }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(getContextFilename(context));

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.includes("/src/") &&
                !normalizedFilename.includes("/electron/") &&
                !normalizedFilename.includes("/shared/"))
        ) {
            return {};
        }

        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const sourceCode = getContextSourceCode(context),
            { visitorKeys } = sourceCode;

        /**
         * @param {unknown} node
         * @param {string} caughtName
         */
        function isEnsureErrorCall(node, caughtName) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return false;
            }

            if (node.type !== "CallExpression") {
                return false;
            }

            const call =
                /** @type {import("@typescript-eslint/utils").TSESTree.CallExpression} */ (
                    node
                );

            if (call.callee.type !== "Identifier") {
                return false;
            }

            if (call.callee.name !== "ensureError") {
                return false;
            }

            const firstArgument = call.arguments?.[0];
            return Boolean(
                firstArgument?.type === "Identifier" &&
                firstArgument.name === caughtName
            );
        }

        /**
         * @param {unknown} node
         * @param {string} caughtName
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.MemberExpression}
         */
        function isDirectPropertyAccess(node, caughtName) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return false;
            }

            if (node.type !== "MemberExpression") {
                return false;
            }

            const member =
                /** @type {import("@typescript-eslint/utils").TSESTree.MemberExpression} */ (
                    node
                );

            if (member.object.type !== "Identifier") {
                return false;
            }

            if (member.object.name !== caughtName) {
                return false;
            }

            // If computed, we cannot reliably reason about the property.
            return !member.computed;
        }

        /**
         * @typedef {{
         *     ensureErrorCall: boolean;
         *     firstPropertyAccess: import("@typescript-eslint/utils").TSESTree.MemberExpression | null;
         *     name: string;
         * }} EnsureErrorState
         */

        /**
         * @param {unknown} node
         * @param {EnsureErrorState} state
         */
        function walk(node, state) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return;
            }

            const typedNode =
                /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                    node
                );

            if (
                !state.ensureErrorCall &&
                isEnsureErrorCall(typedNode, state.name)
            ) {
                state.ensureErrorCall = true;
            }

            if (
                !state.firstPropertyAccess &&
                isDirectPropertyAccess(typedNode, state.name)
            ) {
                state.firstPropertyAccess = typedNode;
            }

            const keys = visitorKeys[typedNode.type] ?? [];
            for (const key of keys) {
                const value = /** @type {Record<string, unknown>} */ (
                    /** @type {unknown} */ (typedNode)
                )[key];
                if (!value) {
                    continue;
                }
                if (Array.isArray(value)) {
                    for (const child of value) {
                        walk(child, state);
                    }
                    continue;
                }
                walk(value, state);
            }
        }

        return {
            /**
             * @param {{ param: any; body: any }} node
             */
            CatchClause(node) {
                const { param } = node;
                if (!param || param.type !== "Identifier") {
                    return;
                }

                const caughtName = param.name,
                    state = /** @type {EnsureErrorState} */ ({
                        ensureErrorCall: false,
                        firstPropertyAccess: null,
                        name: caughtName,
                    });

                walk(node.body, state);

                if (state.firstPropertyAccess && !state.ensureErrorCall) {
                    context.report({
                        data: { name: caughtName },
                        messageId: "requireEnsureError",
                        node: state.firstPropertyAccess,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require ensureError() before accessing properties on caught errors",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/require-ensure-error-in-catch.md",
        },
        schema: [],
        messages: {
            requireEnsureError:
                "Caught error '{{name}}' is used with property access; normalize it first with ensureError({{name}}).",
        },
    },
};
