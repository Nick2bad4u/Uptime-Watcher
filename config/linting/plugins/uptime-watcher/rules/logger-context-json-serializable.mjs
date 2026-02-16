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

const NON_SERIALIZABLE_NAME_PATTERN =
    /\b(?:Date|Function|Map|Promise|RegExp|Set|WeakMap|WeakSet|bigint|symbol)\b/v;

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

    if (JSON_PRIMITIVE_NAMES.has(typeName)) {
        return true;
    }

    if (NON_SERIALIZABLE_NAME_PATTERN.test(typeName)) {
        return false;
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

            let propertyType = checker.getTypeOfSymbolAtLocation(
                propertySymbol,
                valueDeclaration
            );

            propertyType = checker.getNonNullableType(propertyType);

            return isJsonSerializableType(checker, propertyType, seen);
        }
    );
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} callee
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

    return callee.property.name;
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

                const contextArg = node.arguments.at(-1);
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
