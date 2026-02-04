/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 *
 * @file Rule: shared-types-no-local-is-plain-object
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SHARED_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing local isPlainObject helper re-declarations in
 * shared/types.
 */
export const sharedTypesNoLocalIsPlainObjectRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (arg0: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (
            filename === "<input>" ||
            !filename.startsWith(`${NORMALIZED_SHARED_DIR}/types/`)
        ) {
            return {};
        }

        // Allow the canonical shared helper.
        if (filename.endsWith("/shared/utils/typeGuards.ts")) {
            return {};
        }

        return {
            /**
             * @param {{ id: any }} node
             */
            VariableDeclarator(node) {
                if (
                    node.id?.type === "Identifier" &&
                    node.id.name === "isPlainObject"
                ) {
                    context.report({
                        messageId: "banned",
                        node: node.id,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow local isPlainObject declarations in shared/types; use the shared typeGuards helper instead",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/shared-types-no-local-is-plain-object.md",
        },
        schema: [],
        messages: {
            banned: "Do not define a local isPlainObject in shared/types. Import it from @shared/utils/typeGuards instead.",
        },
    },
};
