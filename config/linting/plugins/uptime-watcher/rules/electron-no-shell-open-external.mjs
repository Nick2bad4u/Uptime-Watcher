/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-shell-open-external
 */

import { normalizePath } from "../_internal/path-utils.mjs";

const ALLOWED_FILE_SUFFIX = "/electron/services/shell/openExternalUtils.ts";

/**
 * ESLint rule disallowing direct usage of `shell.openExternal`.
 *
 * @remarks
 * `shell.openExternal()` is a security-sensitive API. This repo centralizes it
 * in `electron/services/shell/openExternalUtils.ts` where URL normalization and
 * allow-list rules can be enforced consistently.
 */
export const electronNoShellOpenExternalRule = {
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
            normalizedFilename.includes("/electron/benchmarks/") ||
            normalizedFilename.endsWith(ALLOWED_FILE_SUFFIX)
        ) {
            return {};
        }

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
            CallExpression(node) {
                const callee = node.callee;
                if (callee?.type !== "MemberExpression") {
                    return;
                }

                const object = callee.object;
                if (object?.type !== "Identifier" || object.name !== "shell") {
                    return;
                }

                const methodName = getMemberPropertyName(callee);
                if (methodName !== "openExternal") {
                    return;
                }

                context.report({
                    messageId: "disallowed",
                    node: callee.property ?? callee,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description: "disallow direct shell.openExternal usage",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-shell-open-external.md",
        },
        schema: [],
        messages: {
            disallowed:
                "Do not call shell.openExternal directly. Use electron/services/shell/openExternalUtils.ts instead.",
        },
    },
};
