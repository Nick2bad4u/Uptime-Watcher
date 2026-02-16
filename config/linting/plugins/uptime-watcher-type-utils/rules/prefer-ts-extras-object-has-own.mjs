import ts from "typescript";

import { normalizePath } from "../_internal/path-utils.mjs";
import {
    createTypedRule,
    getTypedRuleServices,
    isTestFilePath,
} from "../_internal/typed-rule.mjs";

const TARGET_PATH_PATTERN =
    /^(?:config\/linting\/plugins\/uptime-watcher-type-utils\/test\/fixtures\/typed|electron|shared|src)(?:\/|$)/v;

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
 * @param {import("typescript").Type} type
 *
 * @returns {readonly string[] | null}
 */
const getPropertyKeyLiterals = (type) => {
    if (type.isUnion()) {
        /** @type {string[]} */
        const keys = [];

        for (const member of type.types) {
            const memberKeys = getPropertyKeyLiterals(member);
            if (memberKeys === null) {
                return null;
            }

            for (const key of memberKeys) {
                keys.push(key);
            }
        }

        return [...new Set(keys)];
    }

    const literalCandidate = /** @type {{ readonly value?: unknown }} */ (type);

    if (typeof literalCandidate.value === "string") {
        return [literalCandidate.value];
    }

    if (typeof literalCandidate.value === "number") {
        return [String(literalCandidate.value)];
    }

    return null;
};

/**
 * @param {import("typescript").Symbol} symbol
 *
 * @returns {boolean}
 */
const isOptionalPropertySymbol = (symbol) => {
    const declarations = symbol.declarations ?? [];

    if (declarations.length === 0) {
        return true;
    }

    return declarations.some((declaration) => {
        if (!("questionToken" in declaration)) {
            return false;
        }

        return Boolean(declaration.questionToken);
    });
};

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type} type
 *
 * @returns {boolean}
 */
const hasOpenIndexSignature = (checker, type) =>
    Boolean(
        checker.getIndexTypeOfType(type, ts.IndexKind.String) ??
            checker.getIndexTypeOfType(type, ts.IndexKind.Number)
    );

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type} objectType
 * @param {readonly string[]} propertyKeys
 *
 * @returns {boolean}
 */
const hasRequiredKnownPropertyKeys = (checker, objectType, propertyKeys) => {
    if (hasOpenIndexSignature(checker, objectType)) {
        return false;
    }

    for (const key of propertyKeys) {
        const symbol = checker.getPropertyOfType(objectType, key);
        if (!symbol) {
            return false;
        }

        if (isOptionalPropertySymbol(symbol)) {
            return false;
        }
    }

    return true;
};

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type} objectType
 * @param {import("typescript").Type} keyType
 *
 * @returns {boolean}
 */
const isRedundantOwnPropertyGuard = (checker, objectType, keyType) => {
    const propertyKeys = getPropertyKeyLiterals(keyType);
    if (!propertyKeys || propertyKeys.length === 0) {
        return false;
    }

    const apparentObjectType = checker.getApparentType(objectType);
    const objectTypes = apparentObjectType.isUnion()
        ? apparentObjectType.types
        : [apparentObjectType];

    return objectTypes.every((currentType) =>
        hasRequiredKnownPropertyKeys(checker, currentType, propertyKeys)
    );
};

const preferTsExtrasObjectHasOwnRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const { checker, parserServices } = getTypedRuleServices(context);
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
                    callee.object.type !== "Identifier" ||
                    callee.object.name !== "Object" ||
                    callee.property.type !== "Identifier" ||
                    callee.property.name !== "hasOwn" ||
                    node.arguments.length < 2
                ) {
                    return;
                }

                const [objectArgument, keyArgument] = node.arguments;
                if (!objectArgument || !keyArgument) {
                    return;
                }

                const objectTsNode = parserServices.esTreeNodeToTSNodeMap.get(
                    objectArgument
                );
                const keyTsNode = parserServices.esTreeNodeToTSNodeMap.get(
                    keyArgument
                );

                const objectType = checker.getTypeAtLocation(objectTsNode);
                const keyType = checker.getTypeAtLocation(keyTsNode);

                if (isRedundantOwnPropertyGuard(checker, objectType, keyType)) {
                    return;
                }

                context.report({
                    messageId: "preferTsExtrasObjectHasOwn",
                    node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher-type-utils/docs/rules/prefer-ts-extras-object-has-own.md",
        },
        schema: [],
        messages: {
            preferTsExtrasObjectHasOwn:
                "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
        },
    },
    name: "prefer-ts-extras-object-has-own",
});

export { preferTsExtrasObjectHasOwnRule };
