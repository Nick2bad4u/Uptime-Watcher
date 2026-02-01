/**
 * @file Rule: renderer-no-window-open
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to make the custom plugin
 * easier to maintain and incrementally modularize.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// repo path constants live in ../_internal/repo-paths.mjs

const FORBIDDEN_WINDOW_OPEN_OBJECTS = new Set(["window", "globalThis", "global"]);

/**
 * ESLint rule forbidding `window.open` usage in renderer code.
 *
 * @remarks
 * Renderer code should not bypass the main-process boundary for external
 * navigation. Use `SystemService.openExternal()` so URL validation and OS
 * integration remain centralized.
 */
export const rendererNoWindowOpenRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow window.open in renderer code so external navigation stays behind the main-process boundary",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#renderer-no-window-open",
        },
        schema: [],
        messages: {
            avoidWindowOpen:
                "Do not use window.open in renderer code. Use SystemService.openExternal() instead.",
        },
    },

    /**
     * @param {{ getFilename: () => any; sourceCode: any; getSourceCode: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);
        const sourceCode = context.sourceCode ?? context.getSourceCode();

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /**
         * @param {string} name
         * @param {any} node
         */
        function hasLocalBinding(name, node) {
            let scope = sourceCode.getScope(node);
            while (scope) {
                const variable = scope.set.get(name);
                if (variable && variable.defs.length > 0) {
                    return true;
                }
                scope = scope.upper;
            }
            return false;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Node} expression
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.Node}
         */
        function unwrapChain(expression) {
            return expression.type === "ChainExpression"
                ? unwrapChain(expression.expression)
                : expression;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} memberExpression
         */
        function getMemberPropertyName(memberExpression) {
            if (memberExpression.computed) {
                if (
                    memberExpression.property.type === "Literal" &&
                    typeof memberExpression.property.value === "string"
                ) {
                    return memberExpression.property.value;
                }
                return null;
            }

            if (memberExpression.property.type === "Identifier") {
                return memberExpression.property.name;
            }

            return null;
        }

        /**
         * @param {any} callee
         * @param {any} node
         */
        function isForbiddenWindowOpenCallee(callee, node) {
            const unwrapped = unwrapChain(callee);

            if (unwrapped.type === "Identifier") {
                if (unwrapped.name === "open" && !hasLocalBinding("open", node)) {
                    return true;
                }
                return false;
            }

            if (unwrapped.type !== "MemberExpression") {
                return false;
            }

            const propertyName = getMemberPropertyName(unwrapped);
            if (propertyName !== "open") {
                return false;
            }

            const object = unwrapChain(unwrapped.object);
            if (object.type === "Identifier") {
                return FORBIDDEN_WINDOW_OPEN_OBJECTS.has(object.name);
            }

            return false;
        }

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                if (!isForbiddenWindowOpenCallee(node.callee, node)) {
                    return;
                }

                context.report({
                    messageId: "avoidWindowOpen",
                    node,
                });
            },
        };
    },
};
