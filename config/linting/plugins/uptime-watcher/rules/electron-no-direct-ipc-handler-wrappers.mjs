/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-direct-ipc-handler-wrappers
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule enforcing that Electron IPC handlers are wrapped via
 * `registerStandardizedIpcHandler` rather than directly invoking
 * `withIpcHandler`/`withIpcHandlerValidation`.
 *
 * @remarks
 * This is an explicit "no new codepaths" rule: the only module that should deal
 * with response formatting, timing, and validation plumbing is
 * `electron/services/ipc/utils.ts`.
 */
export const electronNoDirectIpcHandlerWrappersRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (descriptor: {
     *         messageId: string;
     *         node: import("@typescript-eslint/utils").TSESTree.Node;
     *         data?: Record<string, unknown>;
     *     }) => void;
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

        // Allow the canonical IPC utility module.
        if (normalizedFilename.endsWith("/electron/services/ipc/utils.ts")) {
            return {};
        }

        const forbiddenImportedNames = new Set([
                "withIpcHandler",
                "withIpcHandlerValidation",
            ]),
            /** @type {Set<string>} */
            forbiddenLocalIdentifiers = new Set();

        /**
         * Reports a direct wrapper call.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node
         * @param {string} wrapper
         */
        function report(node, wrapper) {
            context.report({
                data: { wrapper },
                messageId: "preferStandardRegistration",
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
                    if (
                        forbiddenImportedNames.has(callee.name) ||
                        forbiddenLocalIdentifiers.has(callee.name)
                    ) {
                        report(callee, callee.name);
                    }
                    return;
                }

                if (
                    callee.type === "MemberExpression" &&
                    !callee.computed &&
                    callee.property.type === "Identifier" &&
                    forbiddenImportedNames.has(callee.property.name)
                ) {
                    report(callee.property, callee.property.name);
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (!node.source || node.source.type !== "Literal") {
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

                    if (!importedName) {
                        continue;
                    }

                    if (!forbiddenImportedNames.has(importedName)) {
                        continue;
                    }

                    forbiddenLocalIdentifiers.add(specifier.local.name);
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow calling withIpcHandler/withIpcHandlerValidation outside the IPC utilities module.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-direct-ipc-handler-wrappers.md",
        },
        schema: [],
        messages: {
            preferStandardRegistration:
                "Do not call {{wrapper}} directly. Use registerStandardizedIpcHandler so IPC handling stays centralized and consistent.",
        },
    },
};
