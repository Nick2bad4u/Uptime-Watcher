/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: renderer-no-process-env
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule disallowing `process.env` access in the renderer.
 *
 * @remarks
 * In the renderer, `process.env` is either unavailable (Node integration off)
 * or a bundler shim. It is not a stable configuration source.
 *
 * Prefer:
 *
 * - `import.meta.env` (Vite build-time env), or
 * - Preload/IPC for runtime config.
 */
export const rendererNoProcessEnvRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     getSourceCode: () => any;
     *     report: (descriptor: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/src/") ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        return {
            /** @param {any} program */
            Program(program) {
                const sourceCode = context.getSourceCode();
                const text = sourceCode.getText(program);

                if (!text.includes("process.env")) {
                    return;
                }

                context.report({
                    messageId: "disallowed",
                    node: program,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description: "disallow process.env access in the renderer",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-process-env.md",
        },
        schema: [],
        messages: {
            disallowed:
                "process.env must not be used in the renderer. Use import.meta.env (Vite) or preload/IPC for runtime config.",
        },
    },
};
