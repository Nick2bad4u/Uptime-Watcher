/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-inline-ipc-channel-type-argument
 */

import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

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
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { messageId: string; node: object }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context),
            normalizedFilename = normalizePath(rawFilename);

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
         * @param {unknown} typeParameters
         *
         * @returns {readonly unknown[]}
         */
        function getTypeArguments(typeParameters) {
            if (!typeParameters || typeof typeParameters !== "object") {
                return [];
            }

            // @typescript-eslint uses `typeArguments` (newer) but older nodes
            // May expose `params`.
            if (
                "typeArguments" in typeParameters &&
                Array.isArray(typeParameters.typeArguments)
            ) {
                return typeParameters.typeArguments;
            }

            if (
                "params" in typeParameters &&
                Array.isArray(typeParameters.params)
            ) {
                return typeParameters.params;
            }

            return [];
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression & {
             *     typeParameters?: unknown;
             * }} node
             */
            CallExpression(node) {
                if (node.callee.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                const typeParameters = /** @type {unknown} */ (
                        node.typeArguments ?? node.typeParameters
                    ),
                    arguments_ = getTypeArguments(typeParameters);
                if (arguments_.length === 0) {
                    return;
                }

                const firstTypeArgument = arguments_[0];
                if (
                    !firstTypeArgument ||
                    typeof firstTypeArgument !== "object"
                ) {
                    return;
                }

                if (!("type" in firstTypeArgument)) {
                    return;
                }

                if (firstTypeArgument.type !== "TSLiteralType") {
                    return;
                }

                if (!("literal" in firstTypeArgument)) {
                    return;
                }

                const { literal } = firstTypeArgument;
                if (!literal || typeof literal !== "object") {
                    return;
                }

                if (!("type" in literal)) {
                    return;
                }

                if (literal.type !== "Literal") {
                    return;
                }

                if (
                    !("value" in literal) ||
                    typeof literal.value !== "string"
                ) {
                    return;
                }

                context.report({
                    messageId: "noInlineTypeChannel",
                    node: /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                        firstTypeArgument
                    ),
                });
            },
        };
    },

    meta: {
        type: "suggestion",
        docs: {
            description:
                "disallow string-literal type arguments on registerStandardizedIpcHandler; rely on inference from shared channel constants.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-inline-ipc-channel-type-argument.md",
        },
        schema: [],
        messages: {
            noInlineTypeChannel:
                "Do not use a string-literal type argument for registerStandardizedIpcHandler. Use a shared channel constant and let TypeScript infer the channel type.",
        },
    },
};
