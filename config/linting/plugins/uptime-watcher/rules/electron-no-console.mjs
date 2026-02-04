/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin maintainable.
 *
 * @file Rule: electron-no-console
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule disallowing console usage in Electron runtime code.
 */
export const electronNoConsoleRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (arg0: { data: { method: string }; messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (
            !filename.includes("/electron/") ||
            filename.includes("/electron/test/") ||
            filename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        return {
            /**
             * @param {{
             *     callee: {
             *         type: string;
             *         object: { type: string; name: string };
             *         computed: any;
             *         property: { type: string; name: any };
             *     };
             * }} node
             */
            CallExpression(node) {
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object.type === "Identifier" &&
                    node.callee.object.name === "console" &&
                    !node.callee.computed &&
                    node.callee.property.type === "Identifier"
                ) {
                    context.report({
                        data: { method: `.${node.callee.property.name}` },
                        messageId: "preferLogger",
                        node: node.callee,
                    });
                }
            },
        };
    },

    meta: {
        type: "suggestion",
        docs: {
            description:
                "require structured logger usage instead of console in electron runtime code",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-console.md",
        },
        schema: [],
        messages: {
            preferLogger:
                "Use the shared logger utilities instead of console.{{method}} in Electron runtime code.",
        },
    },
};
