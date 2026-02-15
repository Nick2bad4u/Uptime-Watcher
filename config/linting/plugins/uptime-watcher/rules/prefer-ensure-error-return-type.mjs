import { createTypedRule, getTypedRuleServices } from "../_internal/typed-rule.mjs";

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} node
 */
const isEnsureErrorCall = (node) => {
    if (!node || node.type !== "CallExpression") {
        return false;
    }

    return (
        node.callee.type === "Identifier" &&
        node.callee.name === "ensureError"
    );
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} expression
 */
const unwrapEnsureErrorCall = (expression) => {
    if (!expression) {
        return null;
    }

    if (isEnsureErrorCall(expression)) {
        return expression;
    }

    if (
        expression.type === "TSAsExpression" ||
        expression.type === "TSTypeAssertion"
    ) {
        return unwrapEnsureErrorCall(expression.expression);
    }

    return null;
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.TypeNode | undefined} annotation
 */
const isErrorTypeAnnotation = (annotation) => {
    if (!annotation) {
        return true;
    }

    if (
        annotation.type === "TSTypeReference" &&
        annotation.typeName.type === "Identifier"
    ) {
        return annotation.typeName.name === "Error";
    }

    return false;
};

const preferEnsureErrorReturnTypeRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const { checker, parserServices } = getTypedRuleServices(context);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CatchClause} node
             */
            CatchClause(node) {
                if (!node.param || node.param.type !== "Identifier") {
                    return;
                }

                const tsParamNode = parserServices.esTreeNodeToTSNodeMap.get(
                    node.param
                );
                const catchType = checker.getTypeAtLocation(tsParamNode);

                if (checker.typeToString(catchType) === "unknown") {
                    return;
                }

                context.report({
                    messageId: "catchVariableMustBeUnknown",
                    node: node.param,
                });
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSAsExpression} node
             */
            TSAsExpression(node) {
                if (!isEnsureErrorCall(node.expression)) {
                    return;
                }

                context.report({
                    messageId: "ensureErrorShouldNotBeRecast",
                    node,
                });
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSTypeAssertion} node
             */
            TSTypeAssertion(node) {
                if (!isEnsureErrorCall(node.expression)) {
                    return;
                }

                context.report({
                    messageId: "ensureErrorShouldNotBeRecast",
                    node,
                });
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") {
                    return;
                }

                if (!unwrapEnsureErrorCall(node.init ?? null)) {
                    return;
                }

                const typeAnnotation = node.id.typeAnnotation?.typeAnnotation;
                if (isErrorTypeAnnotation(typeAnnotation)) {
                    return;
                }

                context.report({
                    messageId: "ensureErrorVariableShouldRemainError",
                    node: node.id,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "problem",
        docs: {
            description:
                "require catch variables to remain unknown and ensureError results to stay typed as Error without unsafe recasting.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-ensure-error-return-type.md",
        },
        schema: [],
        messages: {
            catchVariableMustBeUnknown:
                "Catch variables should remain `unknown` and be normalized via ensureError.",
            ensureErrorShouldNotBeRecast:
                "Do not recast ensureError(...) results; consume the inferred Error type directly.",
            ensureErrorVariableShouldRemainError:
                "Variables initialized from ensureError(...) should be typed as Error (or inferred), not cast to custom assertion types.",
        },
    },
    name: "prefer-ensure-error-return-type",
});

export { preferEnsureErrorReturnTypeRule };
