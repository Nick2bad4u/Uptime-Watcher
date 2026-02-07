/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 *
 * @file Rule: preload-no-local-is-plain-object
 */

import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * Drift guard: disallow local `isPlainObject` variable definitions inside
 * electron/preload.
 */
export const preloadNoLocalIsPlainObjectRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (arg0: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const filename = normalizePath(getContextFilename(context));
        if (
            filename === "<input>" ||
            !filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/preload/`)
        ) {
            return {};
        }

        return {
            /**
             * @param {{ id: any }} node
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
                    messageId: "banned",
                    node: id,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow local isPlainObject definitions in electron/preload",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/preload-no-local-is-plain-object.md",
        },
        schema: [],
        messages: {
            banned: "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
        },
    },
};
