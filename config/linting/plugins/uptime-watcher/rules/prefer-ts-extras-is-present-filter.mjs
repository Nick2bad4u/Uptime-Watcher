import { normalizePath } from "../_internal/path-utils.mjs";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const TARGET_PATH_PATTERN =
    /^(?:config\/linting\/plugins\/uptime-watcher\/test\/fixtures\/typed|electron|shared|src)(?:\/|$)/v;

/**
 * @param {string} filePath
 * @returns {string}
 */
const getRepoRelativePath = (filePath) => {
    const normalizedPath = normalizePath(filePath);
    const marker = "/uptime-watcher/";
    const markerIndex = normalizedPath.toLowerCase().indexOf(marker);

    if (markerIndex === -1) {
        return normalizedPath;
    }

    return normalizedPath.slice(markerIndex + marker.length);
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} node
 * @param {string} parameterName
 *
 * @returns {node is import("@typescript-eslint/utils").TSESTree.BinaryExpression}
 */
const isNullComparison = (node, parameterName) =>
    node.type === "BinaryExpression" &&
    (node.operator === "!=" || node.operator === "!==") &&
    ((node.left.type === "Identifier" &&
        node.left.name === parameterName &&
        node.right.type === "Literal" &&
        node.right.value === null) ||
        (node.right.type === "Identifier" &&
            node.right.name === parameterName &&
            node.left.type === "Literal" &&
            node.left.value === null));

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} node
 * @param {string} parameterName
 *
 * @returns {boolean}
 */
const isUndefinedComparison = (node, parameterName) => {
    if (
        node.type === "BinaryExpression" &&
        (node.operator === "!=" || node.operator === "!==")
    ) {
        const isDirectUndefinedComparison =
            (node.left.type === "Identifier" &&
                node.left.name === parameterName &&
                node.right.type === "Identifier" &&
                node.right.name === "undefined") ||
            (node.right.type === "Identifier" &&
                node.right.name === parameterName &&
                node.left.type === "Identifier" &&
                node.left.name === "undefined");

        if (isDirectUndefinedComparison) {
            return true;
        }

        return (
            node.left.type === "UnaryExpression" &&
            node.left.operator === "typeof" &&
            node.left.argument.type === "Identifier" &&
            node.left.argument.name === parameterName &&
            node.right.type === "Literal" &&
            node.right.value === "undefined"
        );
    }

    return false;
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} expression
 *
 * @returns {readonly import("@typescript-eslint/utils").TSESTree.Expression[]}
 */
const flattenLogicalAndTerms = (expression) => {
    if (expression.type !== "LogicalExpression" || expression.operator !== "&&") {
        return [expression];
    }

    return [
        ...flattenLogicalAndTerms(expression.left),
        ...flattenLogicalAndTerms(expression.right),
    ];
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.ArrowFunctionExpression & {
 *   body: import("@typescript-eslint/utils").TSESTree.Expression;
 * }} callback
 * @param {string} parameterName
 *
 * @returns {boolean}
 */
const isNullishFilterGuardBody = (callback, parameterName) => {
    const { body } = callback;

    if (isNullComparison(body, parameterName)) {
        if (body.operator === "!=") {
            return true;
        }

        return callback.returnType?.typeAnnotation.type === "TSTypePredicate";
    }

    const andTerms = flattenLogicalAndTerms(body);
    const hasNullComparison = andTerms.some((term) =>
        isNullComparison(term, parameterName)
    );
    const hasUndefinedComparison = andTerms.some((term) =>
        isUndefinedComparison(term, parameterName)
    );

    return hasNullComparison && hasUndefinedComparison;
};

const preferTsExtrasIsPresentFilterRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        const repoRelativePath = getRepoRelativePath(filePath);

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

                const expressionCallback = /** @type {import("@typescript-eslint/utils").TSESTree.ArrowFunctionExpression & {
                 *   body: import("@typescript-eslint/utils").TSESTree.Expression;
                 * }} */ (callback);

                const parameter = callback.params[0];
                if (!parameter || parameter.type !== "Identifier") {
                    return;
                }

                if (
                    !isNullishFilterGuardBody(
                        expressionCallback,
                        parameter.name
                    )
                ) {
                    return;
                }

                context.report({
                    messageId: "preferTsExtrasIsPresentFilter",
                    node: expressionCallback,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras isPresent in Array.filter callbacks instead of inline nullish checks.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-ts-extras-is-present-filter.md",
        },
        schema: [],
        messages: {
            preferTsExtrasIsPresentFilter:
                "Prefer `isPresent` from `ts-extras` in `filter(...)` callbacks over inline nullish comparisons.",
        },
    },
    name: "prefer-ts-extras-is-present-filter",
});

export { preferTsExtrasIsPresentFilterRule };
