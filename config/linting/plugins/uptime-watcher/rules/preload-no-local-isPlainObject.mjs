/**
 * @file Rule: preload-no-local-isPlainObject
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// repo path constants live in ../_internal/repo-paths.mjs

/**
 * Drift guard: disallow local `isPlainObject` variable definitions inside
 * electron/preload.
 */
export const preloadNoLocalIsPlainObjectRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow local isPlainObject definitions in electron/preload",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#preload-no-local-isPlainObject",
        },
        schema: [],
        messages: {
            banned: "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());
        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/preload/`)) {
            return {};
        }

        return {
            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                if (id.name !== "isPlainObject") {
                    return;
                }

                context.report({
                    node: id,
                    messageId: "banned",
                });
            },
        };
    },
};
