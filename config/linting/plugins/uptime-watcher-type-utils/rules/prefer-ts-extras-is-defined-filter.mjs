import { toRepoRelativePath } from "../_internal/path-utils.mjs";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const TARGET_PATH_PATTERN =
    /^(?:config\/linting\/plugins\/uptime-watcher-type-utils\/test\/fixtures\/typed|electron|shared|src)(?:\/|$)/v;

/**
 * @param {
 *     | import("@typescript-eslint/utils").TSESTree.Expression
 *     | import("@typescript-eslint/utils").TSESTree.PrivateIdentifier} body
 * @param {string} parameterName
 *
 * @returns {boolean}
 */
const isUndefinedFilterGuardBody = (body, parameterName) => {
    if (body.type === "BinaryExpression") {
        const isDirectUndefinedComparison =
            (body.operator === "!==" || body.operator === "!=") &&
            ((body.left.type === "Identifier" &&
                body.left.name === parameterName &&
                body.right.type === "Identifier" &&
                body.right.name === "undefined") ||
                (body.right.type === "Identifier" &&
                    body.right.name === parameterName &&
                    body.left.type === "Identifier" &&
                    body.left.name === "undefined"));

        if (isDirectUndefinedComparison) {
            return true;
        }

        if (
            (body.operator === "!==" || body.operator === "!=") &&
            body.left.type === "UnaryExpression" &&
            body.left.operator === "typeof" &&
            body.left.argument.type === "Identifier" &&
            body.left.argument.name === parameterName &&
            body.right.type === "Literal" &&
            body.right.value === "undefined"
        ) {
            return true;
        }
    }

    return false;
};

const preferTsExtrasIsDefinedFilterRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<
     *     string,
     *     readonly unknown[]
     * >} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        const repoRelativePath = toRepoRelativePath(filePath);

        if (
            !TARGET_PATH_PATTERN.test(repoRelativePath) ||
            isTestFilePath(filePath)
        ) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const { callee } = node;

                if (
                    callee.type !== "MemberExpression" ||
                    callee.computed ||
                    callee.property.type !== "Identifier" ||
                    callee.property.name !== "filter" ||
                    node.arguments.length === 0
                ) {
                    return;
                }

                const [callback] = node.arguments;

                if (
                    !callback ||
                    callback.type !== "ArrowFunctionExpression" ||
                    callback.params.length !== 1 ||
                    callback.body.type === "BlockStatement"
                ) {
                    return;
                }

                const parameter = callback.params[0];

                if (!parameter || parameter.type !== "Identifier") {
                    return;
                }

                if (
                    !isUndefinedFilterGuardBody(callback.body, parameter.name)
                ) {
                    return;
                }

                context.report({
                    messageId: "preferTsExtrasIsDefinedFilter",
                    node: callback,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras isDefined in Array.filter callbacks instead of inline undefined checks.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher-type-utils/docs/rules/prefer-ts-extras-is-defined-filter.md",
        },
        schema: [],
        messages: {
            preferTsExtrasIsDefinedFilter:
                "Prefer `isDefined` from `ts-extras` in `filter(...)` callbacks over inline undefined comparisons.",
        },
    },
    name: "prefer-ts-extras-is-defined-filter",
});

export { preferTsExtrasIsDefinedFilterRule };
