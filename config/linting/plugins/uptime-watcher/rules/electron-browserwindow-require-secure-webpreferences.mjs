/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-browserwindow-require-secure-webpreferences
 */

import { normalizePath } from "../_internal/path-utils.mjs";

const REQUIRED_WEB_PREFERENCES = [
    { key: "contextIsolation", expected: true },
    { key: "nodeIntegration", expected: false },
    { key: "sandbox", expected: true },
    { key: "webviewTag", expected: false },
];

/**
 * ESLint rule requiring secure BrowserWindow webPreferences.
 *
 * @remarks
 * In this repo, BrowserWindow creation should always use hardened defaults.
 * This rule prevents regressions where someone accidentally enables Node
 * integration or disables context isolation / sandbox.
 */
export const electronBrowserwindowRequireSecureWebpreferencesRule = {
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
        const getPropertyName = (node) => {
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

            const property = node.key;
            if (property?.type === "Identifier") {
                return property.name;
            }

            if (
                property?.type === "Literal" &&
                typeof property.value === "string"
            ) {
                return property.value;
            }

            return null;
        };

        /**
         * @param {any} value
         *
         * @returns {null | boolean}
         */
        const getBooleanLiteralValue = (value) => {
            if (!value) {
                return null;
            }

            if (value.type === "Literal" && typeof value.value === "boolean") {
                return value.value;
            }

            if (
                value.type === "BooleanLiteral" &&
                typeof value.value === "boolean"
            ) {
                return value.value;
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

                const name = getPropertyName(property);
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

                const firstArg = node.arguments?.[0];
                if (!firstArg || firstArg.type !== "ObjectExpression") {
                    return;
                }

                const webPreferencesProperty = getObjectProperty(
                    firstArg,
                    "webPreferences"
                );
                if (!webPreferencesProperty) {
                    context.report({
                        messageId: "missingWebPreferences",
                        node: firstArg,
                    });
                    return;
                }

                const webPreferencesValue = webPreferencesProperty.value;
                if (
                    !webPreferencesValue ||
                    webPreferencesValue.type !== "ObjectExpression"
                ) {
                    context.report({
                        messageId: "nonLiteralWebPreferences",
                        node:
                            webPreferencesProperty.value ??
                            webPreferencesProperty,
                    });
                    return;
                }

                for (const required of REQUIRED_WEB_PREFERENCES) {
                    const prop = getObjectProperty(
                        webPreferencesValue,
                        required.key
                    );
                    if (!prop) {
                        context.report({
                            data: {
                                key: required.key,
                                expected: String(required.expected),
                            },
                            messageId: "missingSetting",
                            node: webPreferencesValue,
                        });
                        continue;
                    }

                    const actual = getBooleanLiteralValue(prop.value);
                    if (actual !== required.expected) {
                        context.report({
                            data: {
                                key: required.key,
                                expected: String(required.expected),
                            },
                            messageId: "incorrectSetting",
                            node: prop.value ?? prop,
                        });
                    }
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require hardened BrowserWindow webPreferences (contextIsolation, sandbox, nodeIntegration, webviewTag)",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-browserwindow-require-secure-webpreferences.md",
        },
        schema: [],
        messages: {
            missingWebPreferences:
                "BrowserWindow options must include a webPreferences object with secure defaults.",
            nonLiteralWebPreferences:
                "BrowserWindow webPreferences must be an inline object literal so secure settings can be audited.",
            missingSetting:
                "BrowserWindow webPreferences must set {{key}} to {{expected}}.",
            incorrectSetting:
                "BrowserWindow webPreferences must set {{key}} to {{expected}}.",
        },
    },
};
