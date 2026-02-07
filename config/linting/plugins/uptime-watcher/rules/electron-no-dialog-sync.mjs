/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-dialog-sync
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";

const SYNC_DIALOG_METHOD_NAMES = new Set([
    "showMessageBoxSync",
    "showOpenDialogSync",
    "showSaveDialogSync",
]);

/**
 * ESLint rule disallowing sync Electron dialog APIs.
 *
 * @remarks
 * Sync dialog APIs block the Electron main thread and are a frequent source of
 * automation flakiness (OS-level modal dialogs). Prefer the async variants.
 */
export const electronNoDialogSyncRule = {
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
                if (object?.type !== "Identifier" || object.name !== "dialog") {
                    return;
                }

                const methodName = getMemberPropertyName(callee);
                if (!methodName || !SYNC_DIALOG_METHOD_NAMES.has(methodName)) {
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
            description: "disallow sync Electron dialog APIs",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-dialog-sync.md",
        },
        schema: [],
        messages: {
            disallowed:
                "dialog.{{methodName}} is not allowed because sync dialogs block the main thread. Prefer the async dialog APIs.",
        },
    },
};
