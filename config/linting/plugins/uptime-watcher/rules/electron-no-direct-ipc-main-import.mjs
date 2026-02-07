/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-direct-ipc-main-import
 */

import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule enforcing that `ipcMain` is only imported in the centralized IPC
 * service modules.
 *
 * @remarks
 * Prevents new ad-hoc IPC registration/removal/listener codepaths from showing
 * up elsewhere in the Electron runtime.
 */
export const electronNoDirectIpcMainImportRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { messageId: string; node: any }) => void;
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

        // Allow only the canonical IPC service modules.
        if (
            normalizedFilename.startsWith(
                `${NORMALIZED_ELECTRON_DIR}/services/ipc/`
            )
        ) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                // Guard against `const { ipcMain } = require("electron")`.
                if (
                    node.callee.type !== "Identifier" ||
                    node.callee.name !== "require" ||
                    node.arguments.length !== 1
                ) {
                    return;
                }

                const [first] = node.arguments;
                if (
                    !first ||
                    first.type !== "Literal" ||
                    first.value !== "electron"
                ) {
                    return;
                }

                // We only flag the require call when we see it being
                // Destructured to ipcMain.
                const { parent } = node;
                if (
                    parent &&
                    parent.type === "VariableDeclarator" &&
                    parent.id &&
                    parent.id.type === "ObjectPattern" &&
                    parent.id.properties.some((property) => {
                        if (property.type !== "Property") {
                            return false;
                        }

                        if (property.computed) {
                            return false;
                        }

                        return (
                            property.key.type === "Identifier" &&
                            property.key.name === "ipcMain"
                        );
                    })
                ) {
                    context.report({
                        messageId: "avoidIpcMain",
                        node,
                    });
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    node.source.value !== "electron"
                ) {
                    return;
                }

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

                    if (importedName !== "ipcMain") {
                        continue;
                    }

                    context.report({
                        messageId: "avoidIpcMain",
                        node: specifier,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow importing ipcMain outside electron/services/ipc/*.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-direct-ipc-main-import.md",
        },
        schema: [],
        messages: {
            avoidIpcMain:
                "Do not import ipcMain here. Use the centralized IpcService / registerStandardizedIpcHandler utilities under electron/services/ipc/.",
        },
    },
};
