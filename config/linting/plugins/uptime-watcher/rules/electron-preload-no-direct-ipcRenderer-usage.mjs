/**
 * @file Rule: electron-preload-no-direct-ipcRenderer-usage
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal ESLint
 * plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule preventing preload domain modules from touching `ipcRenderer`
 * directly.
 *
 * @remarks
 * Only the core bridge infrastructure should talk to `ipcRenderer`. Domain
 * modules must compose bridges via the core factory utilities.
 */
export const electronPreloadNoDirectIpcRendererUsageRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow ipcRenderer usage in preload modules outside core bridge infrastructure.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#electron-preload-no-direct-ipcRenderer-usage",
        },
        schema: [],
        messages: {
            noDirectIpcRenderer:
                "Do not use ipcRenderer directly in preload domain modules. Use the core bridgeFactory helpers instead.",
        },
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/preload/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allow the core modules that legitimately speak ipcRenderer.
        if (
            normalizedFilename.endsWith(
                "/electron/preload/core/bridgeFactory.ts"
            ) ||
            normalizedFilename.endsWith(
                "/electron/preload/utils/preloadLogger.ts"
            )
        ) {
            return {};
        }

        return {
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

                    if (importedName === "ipcRenderer") {
                        context.report({
                            messageId: "noDirectIpcRenderer",
                            node: specifier,
                        });
                    }
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} node
             */
            MemberExpression(node) {
                // Any usage of a free identifier `ipcRenderer` in preload domain
                // code is banned.
                if (
                    node.object.type === "Identifier" &&
                    node.object.name === "ipcRenderer"
                ) {
                    context.report({
                        messageId: "noDirectIpcRenderer",
                        node: node.object,
                    });
                }
            },
        };
    },
};
