/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-browserwindow-require-preload
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";

/**
 * ESLint rule requiring `BrowserWindow` `webPreferences.preload`.
 *
 * @remarks
 * In this repo, preload is the audited capability boundary (contextBridge).
 * Creating a BrowserWindow without a preload script tends to lead to insecure
 * fallbacks and ad-hoc IPC usage.
 */
export const electronBrowserwindowRequirePreloadRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (descriptor: { node: any; messageId: string }) => void;
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
         * @param {any} property
         *
         * @returns {null | string}
         */
        const getPropertyKeyName = (property) => {
            if (!property) {
                return null;
            }

            const key = property.key;

            if (property.computed) {
                if (key?.type === "Literal" && typeof key.value === "string") {
                    return key.value;
                }

                return null;
            }

            if (key?.type === "Identifier") {
                return key.name;
            }

            if (key?.type === "Literal" && typeof key.value === "string") {
                return key.value;
            }

            return null;
        };

        /**
         * @param {any} objectExpression
         * @param {string} key
         *
         * @returns {any | null}
         */
        const getObjectProperty = (objectExpression, key) => {
            if (
                !objectExpression ||
                objectExpression.type !== "ObjectExpression"
            ) {
                return null;
            }

            for (const property of objectExpression.properties ?? []) {
                if (property?.type !== "Property") {
                    continue;
                }

                const name = getPropertyKeyName(property);
                if (name === key) {
                    return property;
                }
            }

            return null;
        };

        return {
            /** @param {any} node */
            NewExpression(node) {
                const callee = node.callee;
                if (
                    callee?.type !== "Identifier" ||
                    callee.name !== "BrowserWindow"
                ) {
                    return;
                }

                const options = node.arguments?.[0];
                if (!options || options.type !== "ObjectExpression") {
                    return;
                }

                const webPreferencesProperty = getObjectProperty(
                    options,
                    "webPreferences"
                );
                if (!webPreferencesProperty) {
                    // Let the secure-webPreferences rule handle this case.
                    return;
                }

                const webPreferencesValue = webPreferencesProperty.value;
                if (
                    !webPreferencesValue ||
                    webPreferencesValue.type !== "ObjectExpression"
                ) {
                    // If webPreferences is not an object literal, another rule
                    // Already reports it.
                    return;
                }

                const preloadProperty = getObjectProperty(
                    webPreferencesValue,
                    "preload"
                );
                if (!preloadProperty) {
                    context.report({
                        messageId: "missingPreload",
                        node: webPreferencesValue,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description: "require BrowserWindow webPreferences.preload",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-browserwindow-require-preload.md",
        },
        schema: [],
        messages: {
            missingPreload:
                "BrowserWindow webPreferences must set a preload script (webPreferences.preload).",
        },
    },
};
