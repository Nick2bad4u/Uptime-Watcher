/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: no-deprecated-exports
 */

/**
 * ESLint rule disallowing exports of declarations annotated with @deprecated.
 */

import { getContextSourceCode } from "../_internal/eslint-context-compat.mjs";

const DEPRECATED_TAG_PATTERN = /@deprecated\b/iv;

export const noDeprecatedExportsRule = {
    /**
     * @param {{
     *     sourceCode?: any;
     *     getSourceCode?: () => any;
    *     report: (descriptor: { messageId: string; node: any }) => void;
     * }} context
     */
    create(context) {
        const inspectedNodes = new WeakSet(),
            sourceCode = getContextSourceCode(context);

        if (!sourceCode) {
            return {};
        }

        /**
         * Retrieves the closest JSDoc comment associated with a node.
         *
         * @param {any} node
         *   - Node to inspect.
         *
         * @returns {any}
         */
        function getJSDocument(node) {
            if (!node) {
                return null;
            }

            const estreeNode = /** @type {import("estree").Node} */ (node);

            if (typeof sourceCode.getJSDocComment === "function") {
                const jsdoc = sourceCode.getJSDocComment(estreeNode);
                if (jsdoc) {
                    return jsdoc;
                }
            }

            const comments = sourceCode.getCommentsBefore(estreeNode);
            if (!comments || comments.length === 0) {
                return null;
            }

            const lastComment = comments.at(-1);
            if (!lastComment || lastComment.type !== "Block") {
                return null;
            }

            if (!lastComment.value.trimStart().startsWith("*")) {
                return null;
            }

            if (!lastComment.loc || !estreeNode.loc) {
                return null;
            }

            if (lastComment.loc.end.line < estreeNode.loc.start.line - 1) {
                return null;
            }

            return lastComment;
        }

        /**
         * Reports when the inspected node carries a @deprecated tag.
         *
         * @param {import("estree").Node | null | undefined} targetNode
         *   - Node whose JSDoc should be analysed.
         * @param {import("estree").Node} reportNode
         *   - Node to attach the ESLint violation to.
         */
        function reportIfDeprecated(targetNode, reportNode) {
            if (!targetNode || inspectedNodes.has(targetNode)) {
                return;
            }

            inspectedNodes.add(targetNode);

            const comment = getJSDocument(targetNode);
            if (!comment) {
                return;
            }

            if (!DEPRECATED_TAG_PATTERN.test(comment.value)) {
                return;
            }

            context.report({
                messageId: "noDeprecatedExports",
                node: reportNode,
            });
        }

        return {
            /**
             * @param {any} node
             */
            ExportDefaultDeclaration(node) {
                if (
                    node.declaration &&
                    node.declaration.type !== "Identifier"
                ) {
                    reportIfDeprecated(node.declaration, node);
                    return;
                }

                reportIfDeprecated(node, node);
            },

            /**
             * @param {any} node
             */
            ExportNamedDeclaration(node) {
                if (node.declaration) {
                    reportIfDeprecated(node.declaration, node);
                    return;
                }

                reportIfDeprecated(node, node);
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow exporting declarations that are annotated with @deprecated",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-deprecated-exports.md",
        },
        schema: [],
        messages: {
            noDeprecatedExports:
                "Exported declarations must not be marked @deprecated. Remove the tag or explicitly disable this rule if the export must remain deprecated.",
        },
    },
};
