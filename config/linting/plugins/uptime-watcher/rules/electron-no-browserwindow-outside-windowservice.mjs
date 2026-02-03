/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-browserwindow-outside-windowservice
 */

import { normalizePath } from "../_internal/path-utils.mjs";

const ALLOWED_WINDOW_SERVICE_SUFFIX =
    "/electron/services/window/WindowService.ts";

/**
 * ESLint rule restricting BrowserWindow creation to the WindowService.
 *
 * @remarks
 * This repository centralizes window creation in `WindowService` so security
 * hardening and lifecycle policies cannot drift across the codebase.
 */
export const electronNoBrowserwindowOutsideWindowserviceRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (descriptor: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/") ||
            normalizedFilename.endsWith(ALLOWED_WINDOW_SERVICE_SUFFIX)
        ) {
            return {};
        }

        return {
            /** @param {any} node */
            NewExpression(node) {
                const callee = node.callee;
                if (
                    callee?.type !== "Identifier" ||
                    callee.name !== "BrowserWindow"
                ) {
                    return;
                }

                context.report({
                    messageId: "disallowed",
                    node: callee,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow BrowserWindow creation outside electron/services/window/WindowService.ts",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-browserwindow-outside-windowservice.md",
        },
        schema: [],
        messages: {
            disallowed:
                "Do not create BrowserWindow outside WindowService. Create windows via WindowService so security and lifecycle policies stay centralized.",
        },
    },
};
