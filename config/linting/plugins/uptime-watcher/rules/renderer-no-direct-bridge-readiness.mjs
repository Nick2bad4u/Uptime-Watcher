/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: renderer-no-direct-bridge-readiness
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule enforcing a single renderer bridge-readiness codepath.
 *
 * @remarks
 * Renderer code should not call `waitForElectronBridge` directly. Instead it
 * should use `getIpcServiceHelpers` (which calls into the readiness utilities)
 * so initialization, retry/backoff, and diagnostics stay consistent.
 */
export const rendererNoDirectBridgeReadinessRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { data: { callee: any }; messageId: string; node: any
     *     }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Allow the utilities that implement the canonical readiness codepath.
        if (
            normalizedFilename.includes("/src/services/utils/") ||
            normalizedFilename.endsWith(
                "/src/services/utils/createIpcServiceHelpers.ts"
            )
        ) {
            return {};
        }

        /** @type {Set<string>} */
        const /** @type {Set<string>} */
            notReadyErrorLocals = new Set(),
            waitForElectronBridgeLocals = new Set();

        /**
         * @param {any} node
         * @param {string} callee
         */
        function report(node, callee) {
            context.report({
                data: { callee },
                messageId: "preferServiceHelpers",
                node,
            });
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const { callee } = node;
                if (callee.type === "Identifier") {
                    if (callee.name === "waitForElectronBridge") {
                        report(callee, "waitForElectronBridge");
                        return;
                    }

                    if (waitForElectronBridgeLocals.has(callee.name)) {
                        report(callee, callee.name);
                    }
                }

                if (
                    callee.type === "MemberExpression" &&
                    !callee.computed &&
                    callee.property.type === "Identifier" &&
                    callee.property.name === "waitForElectronBridge"
                ) {
                    report(callee.property, "waitForElectronBridge");
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                for (const specifier of node.specifiers) {
                    if (specifier.type !== "ImportSpecifier") {
                        continue;
                    }

                    const importedName =
                        specifier.imported.type === "Identifier"
                            ? specifier.imported.name
                            : typeof specifier.imported.value === "string"
                              ? specifier.imported.value
                              : null;

                    if (!importedName) {
                        continue;
                    }

                    if (importedName === "waitForElectronBridge") {
                        waitForElectronBridgeLocals.add(specifier.local.name);
                    }

                    if (importedName === "ElectronBridgeNotReadyError") {
                        notReadyErrorLocals.add(specifier.local.name);
                    }
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.NewExpression} node
             */
            NewExpression(node) {
                const { callee } = node;
                if (callee.type === "Identifier") {
                    if (callee.name === "ElectronBridgeNotReadyError") {
                        report(callee, "ElectronBridgeNotReadyError");
                        return;
                    }

                    if (notReadyErrorLocals.has(callee.name)) {
                        report(callee, callee.name);
                    }
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow calling waitForElectronBridge outside the renderer IPC helper utilities.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-direct-bridge-readiness.md",
        },
        schema: [],
        messages: {
            preferServiceHelpers:
                "Do not call {{callee}} directly. Use getIpcServiceHelpers / createIpcServiceHelpers so bridge readiness stays centralized.",
        },
    },
};
