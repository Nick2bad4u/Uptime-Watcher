/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 *
 * @file Rule: electron-sync-no-local-ascii-digits
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * Drift guard: disallow local `isAsciiDigits` implementations in
 * electron/services/sync.
 */
export const electronSyncNoLocalAsciiDigitsRule = {
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
            !filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/services/sync/`)
        ) {
            return {};
        }

        // Allowed source of truth.
        if (filename.endsWith("/electron/services/sync/syncEngineUtils.ts")) {
            return {};
        }

        const reportIfNameMatches = (
            /** @type {{ type: string; name: string }} */ id
        ) => {
            if (!id || id.type !== "Identifier") {
                return;
            }
            if (id.name !== "isAsciiDigits") {
                return;
            }
            context.report({
                messageId: "banned",
                node: id,
            });
        };

        return {
            /**
             * @param {{ id: any }} node
             */
            FunctionDeclaration(node) {
                reportIfNameMatches(node?.id);
            },

            /**
             * @param {{ id: any }} node
             */
            VariableDeclarator(node) {
                reportIfNameMatches(node?.id);
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow local isAsciiDigits implementations in electron/services/sync; import the shared helper instead",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-sync-no-local-ascii-digits.md",
        },
        schema: [],
        messages: {
            banned: "Import isAsciiDigits from the shared helper instead of defining it locally.",
        },
    },
};
