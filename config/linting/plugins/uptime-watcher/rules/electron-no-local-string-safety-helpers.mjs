/**
 * @file Rule: electron-no-local-string-safety-helpers
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * Drift guard: disallow local string-safety helpers in electron/services.
 */
export const electronNoLocalStringSafetyHelpersRule = {
    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/services/`)) {
            return {};
        }

        // Allowed source of truth.
        if (filename.endsWith("/electron/services/sync/syncEngineUtils.ts")) {
            return {};
        }

        const reportIfNameMatches = (/** @type {{type: string, name: string}} */ id) => {
            if (!id || id.type !== "Identifier") {
                return;
            }
            if (id.name !== "hasAsciiControlCharacters") {
                return;
            }
            context.report({
                messageId: "banned",
                node: id,
            });
        };

        return {
            /**
             * @param {{id: any}} node
             */
            FunctionDeclaration(node) {
                reportIfNameMatches(node?.id);
            },

            /**
             * @param {{id: any}} node
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
                "disallow local hasAsciiControlCharacters helpers in electron/services; use the shared implementation instead",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-local-string-safety-helpers.md",
        },
        schema: [],
        messages: {
            banned: "Use the shared hasAsciiControlCharacters implementation instead of re-declaring it locally.",
        },
    },
};
