/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-webcontents-execute-javascript
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule disallowing `webContents.executeJavaScript()` in Electron
 * sources.
 *
 * @remarks
 * `executeJavaScript` runs code in the renderer context from the main process.
 * It is security-sensitive, makes behavior harder to reason about, and often
 * bypasses your preload IPC contract. Prefer explicit IPC (validated
 * payloads).
 */
export const electronNoWebcontentsExecuteJavascriptRule = {
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

                const methodName = getMemberPropertyName(callee);
                if (methodName !== "executeJavaScript") {
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
            description: "disallow webContents.executeJavaScript usage",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-webcontents-execute-javascript.md",
        },
        schema: [],
        messages: {
            disallowed:
                "Do not call executeJavaScript from Electron. Use validated IPC through the preload bridge.",
        },
    },
};
