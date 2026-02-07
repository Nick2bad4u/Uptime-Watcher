/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-dialog-require-automation-bypass
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";

const DIALOG_METHOD_NAMES = new Set([
    "showErrorBox",
    "showMessageBox",
    "showMessageBoxSync",
    "showOpenDialog",
    "showOpenDialogSync",
    "showSaveDialog",
    "showSaveDialogSync",
]);

/**
 * ESLint rule requiring Electron dialog usage to include a Playwright/headless
 * escape hatch.
 *
 * @remarks
 * Native dialogs are a common source of test flakiness/hangs in E2E
 * automation. We require any Electron main-process module that calls
 * `dialog.*` to also contain a guard that bypasses the dialog when running
 * under automation.
 *
 * The rule requires an explicit `readProcessEnv("PLAYWRIGHT_TEST"|"HEADLESS")`
 * call in the module.
 */
export const electronDialogRequireAutomationBypassRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     getSourceCode: () => any;
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

        /** @type {any[]} */
        const dialogCalls = [];

        let hasAutomationGuard = false;

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
         * @param {any} callee
         *
         * @returns {null | string}
         */
        const getDialogMethodName = (callee) => {
            if (callee?.type !== "MemberExpression") {
                return null;
            }

            const object = callee.object;
            if (object?.type !== "Identifier" || object.name !== "dialog") {
                return null;
            }

            const propertyName = getMemberPropertyName(callee);
            if (!propertyName || !DIALOG_METHOD_NAMES.has(propertyName)) {
                return null;
            }

            return propertyName;
        };

        return {
            /** @param {any} node */
            CallExpression(node) {
                // Track explicit automation guard usage (avoid false positives
                // From comments/strings).
                if (
                    node.callee?.type === "Identifier" &&
                    node.callee.name === "readProcessEnv" &&
                    node.arguments?.[0]?.type === "Literal" &&
                    (node.arguments[0].value === "PLAYWRIGHT_TEST" ||
                        node.arguments[0].value === "HEADLESS")
                ) {
                    hasAutomationGuard = true;
                }

                const methodName = getDialogMethodName(node.callee);
                if (!methodName) {
                    return;
                }

                dialogCalls.push({
                    methodName,
                    node,
                });
            },

            "Program:exit"() {
                if (dialogCalls.length === 0) {
                    return;
                }

                if (hasAutomationGuard) {
                    return;
                }

                for (const call of dialogCalls) {
                    context.report({
                        data: {
                            methodName: call.methodName,
                        },
                        messageId: "missingAutomationBypass",
                        node: call.node.callee,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require an automation escape hatch when using Electron dialog APIs",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-dialog-require-automation-bypass.md",
        },
        schema: [],
        messages: {
            missingAutomationBypass:
                "Electron dialog call (dialog.{{methodName}}) must be guarded for automation. Add a readProcessEnv('PLAYWRIGHT_TEST'|'HEADLESS') check to avoid blocking Playwright runs.",
        },
    },
};
