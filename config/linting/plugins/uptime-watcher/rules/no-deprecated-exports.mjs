/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: no-deprecated-exports
 */

const DEPRECATED_TAG_PATTERN = /@deprecated\b/iv;

/**
 * ESLint rule disallowing exports of declarations annotated with @deprecated.
 */
export const noDeprecatedExportsRule = {
    /**
     * @param {{
     *     sourceCode?: any;
     *     getSourceCode?: () => any;
     *     report: (descriptor: {
     *         messageId: string;
     *         node: import("@typescript-eslint/utils").TSESTree.Node;
     *     }) => void;
     * }} context
     */
    create(context) {
        const inspectedNodes = new WeakSet(),
            sourceCode = context.sourceCode ?? context.getSourceCode?.();

        if (!sourceCode) {
            return {};
        }

        /**
         * Retrieves the closest JSDoc comment associated with a node.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node | null | undefined} node
         *   - Node to inspect.
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.BlockComment | null}
         */
        function getJSDocument(node) {
            if (!node) {
                return null;
            }

            if (typeof sourceCode.getJSDocComment === "function") {
                const jsdoc = sourceCode.getJSDocComment(node);
                if (jsdoc) {
                    return jsdoc;
                }
            }

            const comments = sourceCode.getCommentsBefore(node);
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

            if (!lastComment.loc || !node.loc) {
                return null;
            }

            if (lastComment.loc.end.line < node.loc.start.line - 1) {
                return null;
            }

            return lastComment;
        }

        /**
         * Reports when the inspected node carries a @deprecated tag.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node | null | undefined} targetNode
         *   - Node whose JSDoc should be analysed.
         * @param {import("@typescript-eslint/utils").TSESTree.Node} reportNode
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
             * @param {import("@typescript-eslint/utils").TSESTree.ExportDefaultDeclaration} node
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
             * @param {import("@typescript-eslint/utils").TSESTree.ExportNamedDeclaration} node
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
