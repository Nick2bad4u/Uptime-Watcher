/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-direct-ipc-handle
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule ensuring Electron runtime code never registers IPC handlers via
 * raw `ipcMain.handle`/`ipcMain.handleOnce`.
 *
 * @remarks
 * IPC handler registration must go through the centralized helper
 * `registerStandardizedIpcHandler` in `electron/services/ipc/utils.ts` so we
 * keep consistent validation, error normalization, diagnostics logging, and
 * duplicate-registration protection.
 */
export const electronNoDirectIpcHandleRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { data: { method: any }; messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allow the canonical helper module to register handlers.
        if (normalizedFilename.endsWith("/electron/services/ipc/utils.ts")) {
            return {};
        }

        const forbiddenMethods = new Set(["handle", "handleOnce"]);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") {
                    return;
                }

                if (node.callee.computed) {
                    return;
                }

                const { object, property } = node.callee;

                if (
                    object.type !== "Identifier" ||
                    object.name !== "ipcMain" ||
                    property.type !== "Identifier" ||
                    !forbiddenMethods.has(property.name)
                ) {
                    return;
                }

                context.report({
                    data: { method: property.name },
                    messageId: "useStandardizedRegistration",
                    node: node.callee,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow ipcMain.handle/handleOnce outside the centralized IPC registration helper.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-direct-ipc-handle.md",
        },
        schema: [],
        messages: {
            useStandardizedRegistration:
                "Do not call ipcMain.{{method}} directly. Register IPC handlers via registerStandardizedIpcHandler in electron/services/ipc/utils.ts.",
        },
    },
};
