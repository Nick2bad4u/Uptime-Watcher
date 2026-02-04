/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-open-devtools-require-dev-only
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule requiring `openDevTools()` calls to live in dev-only code paths.
 *
 * @remarks
 * Opening DevTools in production is noisy, can leak information, and is usually
 * unintended. This rule is intentionally conservative: it allows
 * `*.openDevTools()` only inside functions/methods whose name includes "dev".
 */
export const electronOpenDevtoolsRequireDevOnlyRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (descriptor: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /** @type {boolean[]} */
        const devOnlyStack = [];

        /**
         * @param {unknown} value
         *
         * @returns {value is string}
         */
        const isString = (value) => typeof value === "string";

        /**
         * @param {unknown} name
         *
         * @returns {boolean}
         */
        const isDevOnlyName = (name) =>
            isString(name) && name.toLowerCase().includes("dev");

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

        /**
         * @returns {boolean}
         */
        const isInDevOnlyScope = () => devOnlyStack.some(Boolean);

        return {
            /** @param {any} node */
            FunctionDeclaration(node) {
                devOnlyStack.push(isDevOnlyName(node?.id?.name));
            },
            "FunctionDeclaration:exit"() {
                devOnlyStack.pop();
            },

            /** @param {any} node */
            FunctionExpression(node) {
                devOnlyStack.push(isDevOnlyName(node?.id?.name));
            },
            "FunctionExpression:exit"() {
                devOnlyStack.pop();
            },

            ArrowFunctionExpression() {
                // Arrow functions are anonymous; conservatively treat them as
                // Non-dev. If you want dev-only arrows, name the containing
                // Method/function.
                devOnlyStack.push(false);
            },
            "ArrowFunctionExpression:exit"() {
                devOnlyStack.pop();
            },

            /** @param {any} node */
            MethodDefinition(node) {
                const key = node?.key;
                const name =
                    key?.type === "Identifier"
                        ? key.name
                        : key?.type === "Literal"
                          ? key.value
                          : null;

                devOnlyStack.push(isDevOnlyName(name));
            },
            "MethodDefinition:exit"() {
                devOnlyStack.pop();
            },

            /** @param {any} node */
            CallExpression(node) {
                const callee = node.callee;
                if (callee?.type !== "MemberExpression") {
                    return;
                }

                const methodName = getMemberPropertyName(callee);
                if (methodName !== "openDevTools") {
                    return;
                }

                if (isInDevOnlyScope()) {
                    return;
                }

                context.report({
                    messageId: "mustBeDevOnly",
                    node: callee.property ?? callee,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require openDevTools() calls to be in dev-only code paths",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-open-devtools-require-dev-only.md",
        },
        schema: [],
        messages: {
            mustBeDevOnly:
                "openDevTools() must only be called from dev-only code paths (put it in a method/function whose name includes 'dev').",
        },
    },
};
