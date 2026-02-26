import ts from "typescript";

import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.mjs";

const LOGGER_METHODS = new Set([
    "action",
    "debug",
    "error",
    "info",
    "warn",
]);

const JSON_PRIMITIVE_NAMES = new Set([
    "boolean",
    "false",
    "null",
    "number",
    "string",
    "true",
]);

const NON_SERIALIZABLE_TYPE_NAMES = new Set([
    "bigint",
    "Date",
    "Function",
    "Map",
    "Promise",
    "RegExp",
    "Set",
    "symbol",
    "unique symbol",
    "WeakMap",
    "WeakSet",
]);

const JSON_LITERAL_PRIMITIVE_NAMES = new Set([
    "false",
    "null",
    "true",
    "undefined",
]);

/**
 * @param {string} typeName
 *
 * @returns {boolean}
 */
const isStringLiteralTypeName = (typeName) =>
    typeName.length >= 2 && typeName.startsWith('"') && typeName.endsWith('"');

/**
 * @param {string} typeName
 *
 * @returns {boolean}
 */
const isNumericLiteralTypeName = (typeName) => {
    if (
        typeName.length === 0 ||
        typeName === "Infinity" ||
        typeName === "NaN"
    ) {
        return false;
    }

    return Number.isFinite(Number(typeName));
};

/**
 * @param {string} typeName
 *
 * @returns {boolean}
 */
const isBigIntLiteralTypeName = (typeName) => {
    if (!typeName.endsWith("n") || typeName.length <= 1) {
        return false;
    }

    const bigintSource = typeName.slice(0, -1);
    return Number.isInteger(Number(bigintSource));
};

/**
 * @param {string} typeName
 *
 * @returns {boolean}
 */
const isLikelyTypeParameterName = (typeName) => /^[A-Z]\w*$/v.test(typeName);

/**
 * @param {
 *     | import("@typescript-eslint/utils").TSESTree.Expression
 *     | import("@typescript-eslint/utils").TSESTree.SpreadElement} arg
 *
 * @returns {arg is import("@typescript-eslint/utils").TSESTree.Expression}
 */
const isContextLiteralExpression = (arg) => {
    if (arg.type === "SpreadElement") {
        return false;
    }

    return (
        arg.type === "ArrayExpression" ||
        arg.type === "Literal" ||
        arg.type === "ObjectExpression" ||
        arg.type === "TemplateLiteral"
    );
};

/**
 * @param {"action" | "debug" | "error" | "info" | "warn"} loggerMethod
 * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} callExpression
 *
 * @returns {import("@typescript-eslint/utils").TSESTree.Expression | undefined}
 */
const getContextArgumentForMethod = (loggerMethod, callExpression) => {
    // The shared logger signature is:
    // - error(message, error?, ...args)
    // - other levels: (message, ...args)
    // Treat only explicit literal-like context objects as lint targets.
    const targetIndex = loggerMethod === "error" ? 2 : 1;
    const candidate = callExpression.arguments.at(targetIndex);

    if (!candidate || !isContextLiteralExpression(candidate)) {
        return;
    }

    return candidate;
};

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type} type
 * @param {Set<import("typescript").Type>} seen
 *
 * @returns {boolean}
 */
const isJsonSerializableType = (checker, type, seen = new Set()) => {
    if (seen.has(type)) {
        return true;
    }

    seen.add(type);

    const typeName = checker.typeToString(type).trim();

    if (
        NON_SERIALIZABLE_TYPE_NAMES.has(typeName) ||
        isBigIntLiteralTypeName(typeName)
    ) {
        return false;
    }

    if (
        typeName === "any" ||
        typeName === "never" ||
        typeName === "unknown" ||
        isLikelyTypeParameterName(typeName)
    ) {
        // Unknown/Any/Type-parameter values are normalized at runtime by logger
        // Utilities. Avoid static false positives on generic forwarding paths.
        return true;
    }

    if (
        JSON_LITERAL_PRIMITIVE_NAMES.has(typeName) ||
        isStringLiteralTypeName(typeName) ||
        isNumericLiteralTypeName(typeName)
    ) {
        return true;
    }

    if (JSON_PRIMITIVE_NAMES.has(typeName)) {
        return true;
    }

    if (type.isUnion()) {
        return type.types.every(
            /** @returns {boolean} */ (member) =>
                isJsonSerializableType(checker, member, seen)
        );
    }

    if (type.isIntersection()) {
        return type.types.every(
            /** @returns {boolean} */ (member) =>
                isJsonSerializableType(checker, member, seen)
        );
    }

    if (checker.isTupleType(type)) {
        const tupleType = /** @type {import("typescript").TypeReference} */ (
            type
        );
        return checker
            .getTypeArguments(tupleType)
            .every(
                /** @returns {boolean} */ (member) =>
                    isJsonSerializableType(checker, member, seen)
            );
    }

    if (checker.isArrayType(type)) {
        const arrayType = /** @type {import("typescript").TypeReference} */ (
            type
        );
        const [elementType] = checker.getTypeArguments(arrayType);
        if (!elementType) {
            return true;
        }

        return isJsonSerializableType(checker, elementType, seen);
    }

    if (
        checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0 ||
        checker.getSignaturesOfType(type, ts.SignatureKind.Construct).length > 0
    ) {
        return false;
    }

    const stringIndexType = type.getStringIndexType();
    if (stringIndexType) {
        return isJsonSerializableType(checker, stringIndexType, seen);
    }

    if (type.getProperties().length === 0 && typeName !== "{}") {
        return false;
    }

    return type.getProperties().every(
        /** @returns {boolean} */ (propertySymbol) => {
            const valueDeclaration = propertySymbol.valueDeclaration;
            if (!valueDeclaration) {
                return true;
            }

            const propertyType = checker.getTypeOfSymbolAtLocation(
                propertySymbol,
                valueDeclaration
            );

            return isJsonSerializableType(checker, propertyType, seen);
        }
    );
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} callee
 *
 * @returns {"action" | "debug" | "error" | "info" | "warn" | undefined}
 */
const getLoggerMethod = (callee) => {
    if (
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.property.type !== "Identifier"
    ) {
        return;
    }

    if (!LOGGER_METHODS.has(callee.property.name)) {
        return;
    }

    return /** @type {"action" | "debug" | "error" | "info" | "warn"} */ (
        callee.property.name
    );
};

const loggerContextJsonSerializableRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<
     *     string,
     *     readonly unknown[]
     * >} context
     */
    create(context) {
        const { checker, parserServices } = getTypedRuleServices(context);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const loggerMethod = getLoggerMethod(node.callee);
                if (!loggerMethod || node.arguments.length < 2) {
                    return;
                }

                const contextArg = getContextArgumentForMethod(
                    loggerMethod,
                    node
                );
                if (!contextArg) {
                    return;
                }

                const contextTsNode =
                    parserServices.esTreeNodeToTSNodeMap.get(contextArg);
                const contextType = checker.getTypeAtLocation(contextTsNode);

                if (isJsonSerializableType(checker, contextType)) {
                    return;
                }

                context.report({
                    data: {
                        method: loggerMethod,
                    },
                    messageId: "loggerContextMustBeJsonSerializable",
                    node: contextArg,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "problem",
        docs: {
            description:
                "require logger metadata/context arguments to be JSON-serializable (TypeFest JsonValue-compatible).",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/logger-context-json-serializable.md",
        },
        schema: [],
        messages: {
            loggerContextMustBeJsonSerializable:
                "Logger '{{method}}' context/metadata should be JSON-serializable (TypeFest JsonValue-compatible).",
        },
    },
    name: "logger-context-json-serializable",
});

export { loggerContextJsonSerializableRule };
