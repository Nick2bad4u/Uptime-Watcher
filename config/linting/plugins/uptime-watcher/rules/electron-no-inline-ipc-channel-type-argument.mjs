/**
 * @file Rule: electron-no-inline-ipc-channel-type-argument
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal ESLint
 * plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule discouraging string-literal type arguments when registering IPC
 * handlers.
 *
 * @remarks
 * `registerStandardizedIpcHandler<"some-channel">(...)` duplicates the channel
 * identifier in the type position and encourages drift. Prefer inference from
 * the channel constant passed as the first argument.
 */
export const electronNoInlineIpcChannelTypeArgumentRule = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "disallow string-literal type arguments on registerStandardizedIpcHandler; rely on inference from shared channel constants.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#electron-no-inline-ipc-channel-type-argument",
        },
        schema: [],
        messages: {
            noInlineTypeChannel:
                "Do not use a string-literal type argument for registerStandardizedIpcHandler. Use a shared channel constant and let TypeScript infer the channel type.",
        },
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: object; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {unknown} typeParams
         *
         * @returns {readonly unknown[]}
         */
        function getTypeArguments(typeParams) {
            if (!typeParams || typeof typeParams !== "object") {
                return [];
            }

            // @typescript-eslint uses `typeArguments` (newer) but older nodes may
            // expose `params`.
            if (
                "typeArguments" in typeParams &&
                Array.isArray(typeParams.typeArguments)
            ) {
                return typeParams.typeArguments;
            }

            if ("params" in typeParams && Array.isArray(typeParams.params)) {
                return typeParams.params;
            }

            return [];
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression & { typeParameters?: unknown }} node
             */
            CallExpression(node) {
                if (node.callee.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                const typeParams = /** @type {unknown} */ (
                    node.typeArguments ?? node.typeParameters
                );
                const args = getTypeArguments(typeParams);
                if (args.length === 0) {
                    return;
                }

                const firstTypeArg = args[0];
                if (!firstTypeArg || typeof firstTypeArg !== "object") {
                    return;
                }

                if (!("type" in firstTypeArg)) {
                    return;
                }

                if (firstTypeArg.type !== "TSLiteralType") {
                    return;
                }

                if (!("literal" in firstTypeArg)) {
                    return;
                }

                const literal = firstTypeArg.literal;
                if (!literal || typeof literal !== "object") {
                    return;
                }

                if (!("type" in literal)) {
                    return;
                }

                if (literal.type !== "Literal") {
                    return;
                }

                if (!("value" in literal) || typeof literal.value !== "string") {
                    return;
                }

                context.report({
                    messageId: "noInlineTypeChannel",
                    node: /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                        firstTypeArg
                    ),
                });
            },
        };
    },
};
