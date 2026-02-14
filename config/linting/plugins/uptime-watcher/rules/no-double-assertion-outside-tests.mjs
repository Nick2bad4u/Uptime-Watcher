import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Node} node
 */
const isTypeAssertionNode = (node) =>
    node.type === "TSAsExpression" || node.type === "TSTypeAssertion";

const rule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        if (isTestFilePath(filePath)) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSAsExpression} node
             */
            TSAsExpression(node) {
                if (!isTypeAssertionNode(node.expression)) {
                    return;
                }

                context.report({
                    messageId: "disallowDoubleAssertion",
                    node,
                });
            },
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSTypeAssertion} node
             */
            TSTypeAssertion(node) {
                if (!isTypeAssertionNode(node.expression)) {
                    return;
                }

                context.report({
                    messageId: "disallowDoubleAssertion",
                    node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow double assertions (e.g. `as unknown as`) outside test files.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-double-assertion-outside-tests.md",
        },
        schema: [],
        messages: {
            disallowDoubleAssertion:
                "Avoid double assertions outside tests; prefer safe narrowing or validated conversion paths.",
        },
    },
    name: "no-double-assertion-outside-tests",
});

export default rule;
