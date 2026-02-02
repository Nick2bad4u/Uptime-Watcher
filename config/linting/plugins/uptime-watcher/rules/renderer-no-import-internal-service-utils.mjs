/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: renderer-no-import-internal-service-utils
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing non-service modules from importing internal
 * `src/services/utils/*` helpers.
 */
export const rendererNoImportInternalServiceUtilsRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { messageId: string; node: any }) => void;
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

        // Services are allowed to use their own internal utilities.
        if (normalizedFilename.includes("/src/services/")) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const moduleName = node.source.value;

                // Catch both Vite alias and relative imports.
                if (
                    moduleName.includes("/services/utils/") ||
                    moduleName.includes("\\\\services\\\\utils\\\\") ||
                    moduleName.startsWith("./services/utils/") ||
                    moduleName.startsWith("../services/utils/") ||
                    moduleName.startsWith("@app/services/utils/")
                ) {
                    context.report({
                        messageId: "noInternalUtils",
                        node: node.source,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow importing src/services/utils/* outside src/services/*.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-import-internal-service-utils.md",
        },
        schema: [],
        messages: {
            noInternalUtils:
                "Do not import internal service utilities (src/services/utils/*) outside the service layer. Use the public service APIs instead.",
        },
    },
};
