// @ts-nocheck

/**
 * Custom ESLint rules enforcing Uptime Watcher architectural conventions.
 *
 * @module
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

/**
 * Absolute path to the repository root.
 *
 * @remarks
 * Derived relative to this plugin module so the rules remain portable when the
 * workspace is relocated.
 */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * Absolute path to the shared type source that defines canonical monitor types.
 */
const SHARED_DIR = path.resolve(REPO_ROOT, "shared");
const NORMALIZED_SHARED_DIR = normalizePath(SHARED_DIR);
const SHARED_TYPES_PATH = path.resolve(SHARED_DIR, "types.ts");

/**
 * Lazily cached canonical monitor type identifiers for rule evaluations.
 *
 * @remarks
 * Parsed once from the shared TypeScript source to avoid repeated filesystem
 * reads when multiple files trigger the rule.
 */
const BASE_MONITOR_TYPES = loadBaseMonitorTypes();

/**
 * Normalizes a file path to POSIX separators for uniform rule matching.
 *
 * @param {string} filename - File path to normalize.
 *
 * @returns {string} Normalized POSIX-style path.
 */
function normalizePath(filename) {
    return filename.replace(/\\/gu, "/");
}

/**
 * Extracts the canonical monitor type identifiers from the shared TypeScript
 * source.
 *
 * @returns {readonly string[]} Monitor type identifiers defined in shared
 * configuration.
 */
function loadBaseMonitorTypes() {
    const source = fs.readFileSync(SHARED_TYPES_PATH, "utf8");
    const sourceFile = ts.createSourceFile(
        SHARED_TYPES_PATH,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );

    /** @type {string[] | null} */
    let values = null;

    /**
     * Visits nodes until the BASE_MONITOR_TYPES declaration is located.
     *
     * @param {ts.Node} node - AST node under inspection.
     */
    function visit(node) {
        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                if (
                    ts.isIdentifier(declaration.name) &&
                    declaration.name.text === "BASE_MONITOR_TYPES" &&
                    declaration.initializer
                ) {
                    const arrayExpression = extractArrayLiteral(declaration.initializer);
                    if (arrayExpression) {
                        values = arrayExpression.elements
                            .filter(ts.isStringLiteral)
                            .map((literal) => literal.text);
                        return;
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (!values) {
        throw new Error("Failed to load BASE_MONITOR_TYPES from shared/types.ts");
    }

    return values;
}

/**
 * Extracts an array literal from a potential TypeScript assertion wrapper.
 *
 * @param {ts.Expression} expression - Expression that may represent an array
 * literal or an assertion wrapping an array literal.
 *
 * @returns {ts.ArrayLiteralExpression | null} Unwrapped array literal if one is
 * present.
 */
function extractArrayLiteral(expression) {
    if (ts.isArrayLiteralExpression(expression)) {
        return expression;
    }

    if (ts.isAsExpression(expression)) {
        return extractArrayLiteral(expression.expression);
    }

    if (typeof ts.isSatisfiesExpression === "function" && ts.isSatisfiesExpression(expression)) {
        return extractArrayLiteral(expression.expression);
    }

    if (ts.isTypeAssertionExpression?.(expression)) {
        return extractArrayLiteral(expression.expression);
    }

    return null;
}

/**
 * Retrieves an ArrayExpression node from an ESTree initializer, unwrapping
 * TypeScript-specific wrappers like `as const`.
 *
 * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} initializer -
 *   Initializer node from a variable declaration.
 *
 * @returns {import("@typescript-eslint/utils").TSESTree.ArrayExpression | null} Array expression when
 * found.
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
 * Extracts the string literal value from an object property.
 *
 * @param {import("@typescript-eslint/utils").TSESTree.Property} property - Object property node.
 *
 * @returns {string | null} String literal value when present.
 */
function getPropertyStringValue(property) {
    if (property.value.type === "Literal" && typeof property.value.value === "string") {
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
 * ESLint rule ensuring fallback monitor options mirror shared type contracts.
 */
const monitorFallbackConsistencyRule = {
    meta: {
        docs: {
            description:
                "Ensure FALLBACK_MONITOR_TYPE_OPTIONS stays aligned with shared BASE_MONITOR_TYPES",
            recommended: false,
        },
        messages: {
            duplicateMonitorType:
                "Monitor type \"{{type}}\" appears multiple times in FALLBACK_MONITOR_TYPE_OPTIONS.",
            missingMonitorType:
                "Monitor type(s) missing from FALLBACK_MONITOR_TYPE_OPTIONS: {{types}}.",
            missingValueProperty:
                "Each fallback monitor option must declare a literal \"value\" property.",
            unknownMonitorType:
                "Monitor type \"{{type}}\" is not defined in shared BASE_MONITOR_TYPES.",
            unsortedMonitorType:
                "Monitor type \"{{type}}\" is out of order. Align fallback options with BASE_MONITOR_TYPES order.",
            valueShouldBeLiteral:
                "Fallback monitor option \"value\" must be a string literal for static analysis.",
        },
        schema: [],
        type: "problem",
    },
    create(context) {
        const filename = normalizePath(context.getFilename());
        if (!filename.endsWith("/src/constants.ts")) {
            return {};
        }

        const baseMonitorTypes = BASE_MONITOR_TYPES;
        const baseMonitorTypeSet = new Set(baseMonitorTypes);

        return {
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

                /** @type {Map<string, import("@typescript-eslint/utils").TSESTree.ObjectExpression>} */
                const optionMap = new Map();
                const reportedNodes = new Set();

                arrayExpression.elements.forEach((element) => {
                    if (!element || element.type !== "ObjectExpression") {
                        return;
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
                        return;
                    }

                    const monitorTypeValue = getPropertyStringValue(valueProperty);
                    if (!monitorTypeValue) {
                        if (!reportedNodes.has(valueProperty)) {
                            reportedNodes.add(valueProperty);
                            context.report({
                                messageId: "valueShouldBeLiteral",
                                node: valueProperty,
                            });
                        }
                        return;
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
                });

                const optionValues = Array.from(optionMap.keys());
                const missingTypes = baseMonitorTypes.filter(
                    (type) => !optionMap.has(type)
                );

                if (missingTypes.length > 0) {
                    context.report({
                        data: { types: missingTypes.join(", ") },
                        messageId: "missingMonitorType",
                        node,
                    });
                }

                baseMonitorTypes.forEach((expectedType, index) => {
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
                });
            },
        };
    },
};

/**
 * ESLint rule disallowing console usage in Electron runtime code.
 */
const electronNoConsoleRule = {
    meta: {
        docs: {
            description: "Require structured logger usage instead of console in electron runtime code",
            recommended: false,
        },
        messages: {
            preferLogger:
                "Use the shared logger utilities instead of console.{{method}} in Electron runtime code.",
        },
        schema: [],
        type: "suggestion",
    },
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (
            !filename.includes("/electron/") ||
            filename.includes("/electron/test/") ||
            filename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        return {
            CallExpression(node) {
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object.type === "Identifier" &&
                    node.callee.object.name === "console" &&
                    !node.callee.computed &&
                    node.callee.property.type === "Identifier"
                ) {
                    context.report({
                        data: { method: `.${node.callee.property.name}` },
                        messageId: "preferLogger",
                        node: node.callee,
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule detecting console usage within TSDoc example code blocks.
 */
const tsdocNoConsoleExampleRule = {
    meta: {
        docs: {
            description: "Disallow console.* in TSDoc example code blocks; prefer structured logger",
            recommended: false,
        },
        messages: {
            replaceConsole: "Replace console usage in examples with the structured logger.",
        },
        schema: [],
        type: "suggestion",
    },
    create(context) {
        const sourceCode = context.getSourceCode();

        return {
            Program() {
                const comments = sourceCode.getAllComments();
                for (const comment of comments) {
                    if (comment.type !== "Block" || !comment.value.startsWith("*")) {
                        continue;
                    }

                    const examplePattern = /```[\s\S]*?```/gu;
                    const consolePattern = /console\.[a-zA-Z]+/u;
                    let match;

                    while ((match = examplePattern.exec(comment.value)) !== null) {
                        if (!consolePattern.test(match[0])) {
                            continue;
                        }

                        const reportIndex = comment.range[0] + 2 + match.index;
                        const loc = sourceCode.getLocFromIndex(reportIndex);
                        context.report({
                            loc: {
                                end: sourceCode.getLocFromIndex(reportIndex + match[0].length),
                                start: loc,
                            },
                            messageId: "replaceConsole",
                        });
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule enforcing the `@shared` path alias instead of relative imports.
 */
const preferSharedAliasRule = {
    meta: {
        docs: {
            description: "Enforce @shared/* import aliases instead of relative shared paths",
            recommended: false,
        },
        fixable: "code",
        messages: {
            useAlias: "Import from shared modules via the @shared alias instead of relative paths.",
        },
        schema: [],
        type: "suggestion",
    },
    create(context) {
        const filename = context.getFilename();
        const normalizedFilename = normalizePath(filename);

        if (normalizedFilename === "<input>" || normalizedFilename.includes("/shared/")) {
            return {};
        }

        const importerDirectory = path.dirname(filename);

        return {
            ImportDeclaration(node) {
                if (node.source.type !== "Literal" || typeof node.source.value !== "string") {
                    return;
                }

                const importPath = String(node.source.value);
                if (!importPath.startsWith(".")) {
                    return;
                }

                const importAbsolutePath = path.resolve(importerDirectory, importPath);
                const normalizedImportAbsolute = normalizePath(importAbsolutePath);

                if (normalizedImportAbsolute === NORMALIZED_SHARED_DIR) {
                    return;
                }

                if (!normalizedImportAbsolute.startsWith(`${NORMALIZED_SHARED_DIR}/`)) {
                    return;
                }

                const relativeToShared = normalizePath(
                    path.relative(SHARED_DIR, importAbsolutePath)
                );

                if (!relativeToShared || relativeToShared.startsWith("..")) {
                    return;
                }

                const aliasSuffix = relativeToShared.replace(
                    /\.(?:[cm]?[jt]sx?|d\.ts)$/u,
                    ""
                );
                const aliasPath = `@shared/${aliasSuffix}`;
                const rawSource = node.source.raw ?? node.source.extra?.raw;
                const quote = rawSource?.startsWith("'") ? "'" : '"';

                context.report({
                    fix(fixer) {
                        return fixer.replaceText(node.source, `${quote}${aliasPath}${quote}`);
                    },
                    messageId: "useAlias",
                    node: node.source,
                });
            },
        };
    },
};

const uptimeWatcherPlugin = {
    rules: {
        "monitor-fallback-consistency": monitorFallbackConsistencyRule,
        "electron-no-console": electronNoConsoleRule,
        "tsdoc-no-console-example": tsdocNoConsoleExampleRule,
        "prefer-shared-alias": preferSharedAliasRule,
    },
};

export default uptimeWatcherPlugin;
