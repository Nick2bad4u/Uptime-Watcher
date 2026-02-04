/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: no-inline-ipc-channel-type-literals
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule preventing IPC channel string literals from being duplicated in
 * TypeScript _type positions_.
 *
 * @remarks
 * Examples of banned patterns outside the canonical shared contract modules:
 *
 * - `Extract<IpcInvokeChannel, "add-site">`
 * - `const channel = "add-site" satisfies IpcInvokeChannel`
 * - `const channel = "add-site" as IpcInvokeChannel`
 *
 * These are all forms of duplicating channel identifiers in places that are not
 * the shared contract registry. Prefer importing channel constants (e.g.
 * `SITES_CHANNELS.addSite`) or referencing the shared mappings.
 */
export const noInlineIpcChannelTypeLiteralsRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
            normalizedFilename = normalizePath(rawFilename);

        if (normalizedFilename === "<input>") {
            return {};
        }

        // Allow the canonical registry modules where channel literals are
        // Expected and intentional.
        if (
            normalizedFilename.endsWith("/shared/types/preload.ts") ||
            normalizedFilename.endsWith("/shared/types/ipc.ts")
        ) {
            return {};
        }

        // Ignore tests/benchmarks.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.TSLiteralType}
         */
        function isStringLiteralType(node) {
            if (!node || typeof node !== "object") {
                return false;
            }

            if (!("type" in node)) {
                return false;
            }

            if (node.type !== "TSLiteralType") {
                return false;
            }

            const literal = /** @type {{ literal?: unknown }} */ (node).literal;

            if (!literal || typeof literal !== "object") {
                return false;
            }

            if (!("type" in literal)) {
                return false;
            }

            return (
                literal.type === "Literal" &&
                "value" in literal &&
                typeof literal.value === "string"
            );
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.TSTypeReference}
         */
        function isTypeReference(node) {
            return Boolean(
                node &&
                typeof node === "object" &&
                "type" in node &&
                node.type === "TSTypeReference"
            );
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.Identifier}
         */
        function isIdentifier(node) {
            return Boolean(
                node &&
                typeof node === "object" &&
                "type" in node &&
                node.type === "Identifier"
            );
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression} expression
         */
        function isInlineStringExpression(expression) {
            if (
                expression.type === "Literal" &&
                typeof expression.value === "string"
            ) {
                return true;
            }

            return (
                expression.type === "TemplateLiteral" &&
                expression.expressions.length === 0
            );
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSAsExpression} node
             */
            TSAsExpression(node) {
                // "some-channel" as IpcInvokeChannel
                if (!isInlineStringExpression(node.expression)) {
                    return;
                }

                const annotation = node.typeAnnotation;
                if (!annotation || !isTypeReference(annotation)) {
                    return;
                }

                if (
                    !isIdentifier(annotation.typeName) ||
                    annotation.typeName.name !== "IpcInvokeChannel"
                ) {
                    return;
                }

                context.report({
                    messageId: "noInlineChannelTypeLiteral",
                    node,
                });
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSSatisfiesExpression} node
             */
            TSSatisfiesExpression(node) {
                // "some-channel" satisfies IpcInvokeChannel
                const annotation = node.typeAnnotation;
                if (!annotation || !isTypeReference(annotation)) {
                    return;
                }

                if (
                    !isIdentifier(annotation.typeName) ||
                    annotation.typeName.name !== "IpcInvokeChannel"
                ) {
                    return;
                }

                if (isInlineStringExpression(node.expression)) {
                    context.report({
                        messageId: "noInlineChannelTypeLiteral",
                        node,
                    });
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSTypeReference} node
             */
            TSTypeReference(node) {
                // Extract<IpcInvokeChannel, "some-channel">
                if (
                    !isIdentifier(node.typeName) ||
                    node.typeName.name !== "Extract"
                ) {
                    return;
                }

                const parameters = node.typeArguments?.params;
                if (!parameters || parameters.length < 2) {
                    return;
                }

                const [firstParameter, secondParameter] = parameters;
                if (!isTypeReference(firstParameter)) {
                    return;
                }

                if (
                    !isIdentifier(firstParameter.typeName) ||
                    firstParameter.typeName.name !== "IpcInvokeChannel"
                ) {
                    return;
                }

                if (!isStringLiteralType(secondParameter)) {
                    return;
                }

                context.report({
                    messageId: "noInlineChannelTypeLiteral",
                    node: secondParameter,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow IPC channel string literals in TS type positions; rely on shared channel constants and inference.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-inline-ipc-channel-type-literals.md",
        },
        schema: [],
        messages: {
            noInlineChannelTypeLiteral:
                "Do not encode IPC channel strings in TypeScript type positions. Use shared channel constants/mappings (from @shared/types/preload) and let types be inferred.",
        },
    },
};
