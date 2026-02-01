/**
 * @file Rule: renderer-no-browser-dialogs
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to make the internal
 * ESLint plugin easier to maintain and evolve.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

const FORBIDDEN_BROWSER_DIALOG_NAMES = new Set(["alert", "confirm", "prompt"]);

/**
 * ESLint rule discouraging usage of native browser dialogs in favour of the
 * dedicated confirmation dialog infrastructure.
 */
export const rendererNoBrowserDialogsRule = {
    /**
     * @param {{ getFilename: () => any; sourceCode: any; getSourceCode: () => any; report: (arg0: { data: { dialog: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
         normalizedFilename = normalizePath(rawFilename),
         sourceCode = context.sourceCode ?? context.getSourceCode();

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /**
         * @param {any} name
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
        function getForbiddenDialogFromCallee(callee, node) {
            const unwrapped = unwrapChain(callee);

            if (unwrapped.type === "Identifier") {
                if (
                    FORBIDDEN_BROWSER_DIALOG_NAMES.has(unwrapped.name) &&
                    !hasLocalBinding(unwrapped.name, node)
                ) {
                    return unwrapped.name;
                }
                return null;
            }

            if (unwrapped.type !== "MemberExpression") {
                return null;
            }

            const propertyName = getMemberPropertyName(unwrapped);
            if (!propertyName || !FORBIDDEN_BROWSER_DIALOG_NAMES.has(propertyName)) {
                return null;
            }

            const object = unwrapChain(unwrapped.object);
            if (object.type === "Identifier" && (
                    object.name === "window" ||
                    object.name === "globalThis" ||
                    object.name === "global"
                )) {
                    return propertyName;
                }

            return null;
        }

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const dialog = getForbiddenDialogFromCallee(node.callee, node);
                if (!dialog) {
                    return;
                }

                context.report({
                    data: { dialog },
                    messageId: "avoidBrowserDialog",
                    node,
                });
            },
        };
    },

    meta: {
        type: "suggestion",
        docs: {
            description:
                "disallow alert/confirm/prompt in renderer code so UX flows use the shared dialog system",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-browser-dialogs.md",
        },
        schema: [],
        messages: {
            avoidBrowserDialog:
                'Replace browser dialog "{{dialog}}" with the shared confirmation dialog utilities.',
        },
    },
};
