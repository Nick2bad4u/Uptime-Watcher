/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to make the custom plugin
 * easier to maintain and test.
 *
 * @file Rule: monitor-fallback-consistency
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { SHARED_DIR } from "../_internal/repo-paths.mjs";

const SHARED_TYPES_PATH = path.resolve(SHARED_DIR, "types.ts");

/**
 * Lazily loads and caches canonical monitor type identifiers for rule
 * evaluations.
 *
 * @remarks
 * Parsed once from the shared TypeScript source to avoid repeated filesystem
 * reads when multiple files trigger the rule.
 *
 * @type {readonly string[] | null}
 */
let BASE_MONITOR_TYPES_CACHE = null;

/**
 * Retrieves an ArrayExpression node from an ESTree initializer, unwrapping
 * TypeScript-specific wrappers like `as const`.
 *
 * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} initializer
 *   Initializer node from a variable declaration.
 *
 * @returns {import("@typescript-eslint/utils").TSESTree.ArrayExpression | null}
 *   Array expression when found.
 */
function getArrayExpression(initializer) {
    if (!initializer) {
        return null;
    }

    if (initializer.type === "ArrayExpression") {
        return initializer;
    }

    if (
        initializer.type === "TSAsExpression" ||
        initializer.type === "TSSatisfiesExpression" ||
        initializer.type === "TSTypeAssertion"
    ) {
        return getArrayExpression(initializer.expression);
    }

    return null;
}

/**
 * Returns the cached monitor types, loading them if necessary.
 *
 * @returns {readonly string[]} Monitor type identifiers defined in shared
 *   configuration.
 */
function getBaseMonitorTypes() {
    if (!BASE_MONITOR_TYPES_CACHE) {
        BASE_MONITOR_TYPES_CACHE = loadBaseMonitorTypes();
    }
    return BASE_MONITOR_TYPES_CACHE;
}

/**
 * Extracts the string literal value from an object property.
 *
 * @param {import("@typescript-eslint/utils").TSESTree.Property} property
 *   Object property node.
 *
 * @returns {string | null} String literal value when present.
 */
function getPropertyStringValue(property) {
    if (
        property.value.type === "Literal" &&
        typeof property.value.value === "string"
    ) {
        return property.value.value;
    }

    if (
        property.value.type === "TemplateLiteral" &&
        property.value.expressions.length === 0 &&
        property.value.quasis.length === 1
    ) {
        return property.value.quasis[0]?.value?.cooked ?? null;
    }

    return null;
}

/**
 * Extracts the canonical monitor type identifiers from the shared TypeScript
 * source.
 *
 * @returns {readonly string[]} Monitor type identifiers defined in shared
 *   configuration.
 */
function loadBaseMonitorTypes() {
    const source = fs.readFileSync(SHARED_TYPES_PATH, "utf8"),
        sourceFile = ts.createSourceFile(
            SHARED_TYPES_PATH,
            source,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        );

    /**
     * Extracts an array literal from a potential TypeScript assertion wrapper.
     *
     * @param {ts.Expression} expression - Expression that may represent an
     *   array literal or an assertion wrapping an array literal.
     *
     * @returns {ts.ArrayLiteralExpression | null} Unwrapped array literal if
     *   one is present.
     */
    function extractArrayLiteral(expression) {
        if (ts.isArrayLiteralExpression(expression)) {
            return expression;
        }

        if (ts.isAsExpression(expression)) {
            return extractArrayLiteral(expression.expression);
        }

        if (
            typeof ts.isSatisfiesExpression === "function" &&
            ts.isSatisfiesExpression(expression)
        ) {
            return extractArrayLiteral(expression.expression);
        }

        /**
         * @remarks
         * Some TypeScript versions expose `isTypeAssertionExpression` at
         * runtime but do not include it in the public type surface.
         *
         * @type {unknown}
         */
        const maybeTypeAssertion = /** @type {any} */ (ts)
            .isTypeAssertionExpression;

        if (
            typeof maybeTypeAssertion === "function" &&
            maybeTypeAssertion(expression)
        ) {
            const assertedExpression = /** @type {any} */ (expression)
                .expression;
            return extractArrayLiteral(assertedExpression);
        }

        return null;
    }

    /**
     * Traverses the AST to locate the BASE_MONITOR_TYPES declaration.
     *
     * @param {ts.Node} node - AST node under inspection.
     *
     * @returns {string[] | null} The extracted monitor type list when found.
     */
    function findValues(node) {
        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                if (
                    ts.isIdentifier(declaration.name) &&
                    declaration.name.text === "BASE_MONITOR_TYPES" &&
                    declaration.initializer
                ) {
                    const arrayExpression = extractArrayLiteral(
                        declaration.initializer
                    );

                    if (!arrayExpression) {
                        continue;
                    }

                    return arrayExpression.elements
                        .filter(ts.isStringLiteral)
                        .map((literal) => literal.text);
                }
            }
        }

        // Avoid callback-based traversal so static analysis doesn't treat the
        // Result as constant.
        for (const child of node.getChildren(sourceFile)) {
            const found = findValues(child);
            if (found) {
                return found;
            }
        }

        return null;
    }

    const values = findValues(sourceFile);

    if (!values) {
        throw new Error(
            "Failed to load BASE_MONITOR_TYPES from shared/types.ts"
        );
    }

    return values;
}

/**
 * ESLint rule ensuring fallback monitor options mirror shared type contracts.
 */
export const monitorFallbackConsistencyRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (arg0: {
     *         messageId: string;
     *         node: any;
     *         data?: { type: string } | { types: string };
     *     }) => void;
     * }} context
     */
    create(context) {
        const filename = normalizePath(getContextFilename(context));
        if (filename === "<input>" || !filename.endsWith("/src/constants.ts")) {
            return {};
        }

        const baseMonitorTypes = getBaseMonitorTypes(),
            baseMonitorTypeSet = new Set(baseMonitorTypes);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                if (
                    node.id.type !== "Identifier" ||
                    node.id.name !== "FALLBACK_MONITOR_TYPE_OPTIONS"
                ) {
                    return;
                }

                const arrayExpression = getArrayExpression(node.init);
                if (!arrayExpression) {
                    return;
                }

                /**
                 * @type {Map<string, import("@typescript-eslint/utils").TSESTree.ObjectExpression>}
                 */
                const optionMap = new Map(),
                    reportedNodes = new Set();

                for (const element of arrayExpression.elements) {
                    if (!element || element.type !== "ObjectExpression") {
                        continue;
                    }

                    const valueProperty = element.properties.find(
                        (property) =>
                            property.type === "Property" &&
                            !property.computed &&
                            ((property.key.type === "Identifier" &&
                                property.key.name === "value") ||
                                (property.key.type === "Literal" &&
                                    property.key.value === "value"))
                    );

                    if (!valueProperty || valueProperty.type !== "Property") {
                        if (!reportedNodes.has(element)) {
                            reportedNodes.add(element);
                            context.report({
                                messageId: "missingValueProperty",
                                node: element,
                            });
                        }
                        continue;
                    }

                    const monitorTypeValue =
                        getPropertyStringValue(valueProperty);
                    if (!monitorTypeValue) {
                        if (!reportedNodes.has(valueProperty)) {
                            reportedNodes.add(valueProperty);
                            context.report({
                                messageId: "valueShouldBeLiteral",
                                node: valueProperty,
                            });
                        }
                        continue;
                    }

                    if (optionMap.has(monitorTypeValue)) {
                        context.report({
                            data: { type: monitorTypeValue },
                            messageId: "duplicateMonitorType",
                            node: valueProperty,
                        });
                    } else {
                        optionMap.set(monitorTypeValue, element);
                    }

                    if (!baseMonitorTypeSet.has(monitorTypeValue)) {
                        context.report({
                            data: { type: monitorTypeValue },
                            messageId: "unknownMonitorType",
                            node: valueProperty,
                        });
                    }
                }

                const missingTypes = baseMonitorTypes.filter(
                        (type) => !optionMap.has(type)
                    ),
                    optionValues = [...optionMap.keys()];

                if (missingTypes.length > 0) {
                    context.report({
                        data: { types: missingTypes.join(", ") },
                        messageId: "missingMonitorType",
                        node,
                    });
                }

                for (const [
                    index,
                    expectedType,
                ] of baseMonitorTypes.entries()) {
                    const actualType = optionValues[index];
                    if (actualType && actualType !== expectedType) {
                        const optionNode = optionMap.get(actualType);
                        if (optionNode) {
                            context.report({
                                data: { type: actualType },
                                messageId: "unsortedMonitorType",
                                node: optionNode,
                            });
                        }
                    }
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require FALLBACK_MONITOR_TYPE_OPTIONS to stay aligned with shared BASE_MONITOR_TYPES",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/monitor-fallback-consistency.md",
        },
        schema: [],
        messages: {
            duplicateMonitorType:
                'Monitor type "{{type}}" appears multiple times in FALLBACK_MONITOR_TYPE_OPTIONS.',
            missingMonitorType:
                "Monitor type(s) missing from FALLBACK_MONITOR_TYPE_OPTIONS: {{types}}.",
            missingValueProperty:
                'Each fallback monitor option must declare a literal "value" property.',
            unknownMonitorType:
                'Monitor type "{{type}}" is not defined in shared BASE_MONITOR_TYPES.',
            unsortedMonitorType:
                'Monitor type "{{type}}" is out of order. Align fallback options with BASE_MONITOR_TYPES order.',
            valueShouldBeLiteral:
                'Fallback monitor option "value" must be a string literal for static analysis.',
        },
    },
};
