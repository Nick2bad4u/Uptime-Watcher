/**
 * @file Rule: no-onedrive
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal ESLint
 * plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule disallowing OneDrive-related identifiers/strings.
 *
 * @remarks
 * OneDrive integration is intentionally not supported in this repository.
 */
export const noOneDriveRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow any OneDrive-related identifiers/strings to prevent reintroducing a removed provider",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#no-onedrive",
        },
        schema: [],
        messages: {
            noOneDrive:
                "OneDrive integration is intentionally not supported in this repository. Remove this reference.",
        },
    },

    /**
     * @param {{ getFilename: () => string; getSourceCode: () => any; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        // Ignore tests to avoid creating busywork when describing previous state.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/src/test/") ||
            normalizedFilename.includes("/shared/test/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const bannedPattern = /\bonedrive\b|\bone\s*drive\b/iu;

        return {
            /**
             * @param {any} node
             */
            Program(node) {
                const sourceCode = context.getSourceCode();
                const text = sourceCode.getText();
                if (!bannedPattern.test(text)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "noOneDrive",
                });
            },
        };
    },
};
