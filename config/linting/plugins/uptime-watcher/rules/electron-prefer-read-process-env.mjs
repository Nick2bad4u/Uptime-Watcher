/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-prefer-read-process-env
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule preferring the `readProcessEnv()` helper over direct
 * `process.env.*` access.
 */
export const electronPreferReadProcessEnvRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     getSourceCode: () => any;
     *     report: (arg0: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
            normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allowed canonical module.
        if (normalizedFilename.endsWith("/electron/utils/environment.ts")) {
            return {};
        }

        return {
            /** @param {any} node */
            Program(node) {
                const sourceCode = context.getSourceCode(),
                    text = sourceCode.getText();
                if (text.includes("process.env")) {
                    context.report({
                        messageId: "preferReadProcessEnv",
                        node,
                    });
                }
            },
        };
    },

    meta: {
        type: "suggestion",
        docs: {
            description:
                "require using readProcessEnv() instead of direct process.env access",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-prefer-read-process-env.md",
        },
        schema: [],
        messages: {
            preferReadProcessEnv:
                "Prefer readProcessEnv() instead of direct process.env access.",
        },
    },
};
