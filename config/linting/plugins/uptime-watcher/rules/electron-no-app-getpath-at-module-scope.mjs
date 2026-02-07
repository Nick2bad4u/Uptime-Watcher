/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-app-getpath-at-module-scope
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";

const DISALLOWED_METHOD_NAMES = new Set([
    "getAppPath",
    "getName",
    "getPath",
]);

/**
 * ESLint rule disallowing `app.getPath()` / `app.getAppPath()` /
 * `app.getName()` at module scope.
 *
 * @remarks
 * Module-scope evaluation happens at import time and can run before
 * `app.whenReady()`. Keeping these calls inside functions prevents startup-time
 * crashes and improves testability.
 */
export const electronNoAppGetpathAtModuleScopeRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (descriptor: {
     *         node: any;
     *         messageId: string;
     *         data?: Record<string, unknown>;
     *     }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context);
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        let functionDepth = 0;

        /**
         * @param {any} node
         *
         * @returns {null | string}
         */
        const getMemberPropertyName = (node) => {
            if (!node) {
                return null;
            }

            if (node.computed) {
                const property = node.property;
                if (
                    property?.type === "Literal" &&
                    typeof property.value === "string"
                ) {
                    return property.value;
                }

                return null;
            }

            const property = node.property;
            if (property?.type === "Identifier") {
                return property.name;
            }

            return null;
        };

        return {
            /** @param {any} node */
            FunctionDeclaration(node) {
                if (node) {
                    functionDepth += 1;
                }
            },
            "FunctionDeclaration:exit"() {
                functionDepth = Math.max(0, functionDepth - 1);
            },
            /** @param {any} node */
            FunctionExpression(node) {
                if (node) {
                    functionDepth += 1;
                }
            },
            "FunctionExpression:exit"() {
                functionDepth = Math.max(0, functionDepth - 1);
            },
            /** @param {any} node */
            ArrowFunctionExpression(node) {
                if (node) {
                    functionDepth += 1;
                }
            },
            "ArrowFunctionExpression:exit"() {
                functionDepth = Math.max(0, functionDepth - 1);
            },

            /** @param {any} node */
            CallExpression(node) {
                const callee = node.callee;
                if (callee?.type !== "MemberExpression") {
                    return;
                }

                const object = callee.object;
                if (object?.type !== "Identifier" || object.name !== "app") {
                    return;
                }

                const methodName = getMemberPropertyName(callee);
                if (!methodName || !DISALLOWED_METHOD_NAMES.has(methodName)) {
                    return;
                }

                if (functionDepth > 0) {
                    return;
                }

                context.report({
                    data: { methodName },
                    messageId: "disallowed",
                    node: callee.property ?? callee,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow app.getPath/app.getAppPath/app.getName at module scope in Electron sources",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-app-getpath-at-module-scope.md",
        },
        schema: [],
        messages: {
            disallowed:
                "app.{{methodName}} must not be called at module scope. Move it inside a function that runs after app.whenReady().",
        },
    },
};
