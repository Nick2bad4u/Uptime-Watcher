
/**
 * Custom ESLint rules enforcing Uptime Watcher architectural conventions.
 *
 * @module
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

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
 * Absolute path to the repository root.
 *
 * @remarks
 * Derived relative to this plugin module so the rules remain portable when the
 * workspace is relocated.
 */
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    ".."
);

/**
 * Absolute path to the shared type source that defines canonical monitor types.
 */
const SHARED_DIR = path.resolve(REPO_ROOT, "shared");
const NORMALIZED_SHARED_DIR = normalizePath(SHARED_DIR);
const SHARED_TYPES_PATH = path.resolve(SHARED_DIR, "types.ts");

const SRC_DIR = path.resolve(REPO_ROOT, "src");
const NORMALIZED_SRC_DIR = normalizePath(SRC_DIR);

/**
 * Absolute path to the Electron runtime source directory.
 */
const ELECTRON_DIR = path.resolve(REPO_ROOT, "electron");
const NORMALIZED_ELECTRON_DIR = normalizePath(ELECTRON_DIR);

/**
 * Lazily loads and caches canonical monitor type identifiers for rule
 * evaluations.
 * @remarks Parsed once from the shared TypeScript source to avoid repeated filesystem
 * reads when multiple files trigger the rule. This avoids blocking the event
 * loop at module initialization.
 * @type {readonly string[] | null}
 */
let BASE_MONITOR_TYPES_CACHE = null;

/**
 * Returns the cached monitor types, loading them if necessary.
 *
 * @returns {readonly string[]} Monitor type identifiers defined in shared
 * configuration.
 */
function getBaseMonitorTypes() {
    if (!BASE_MONITOR_TYPES_CACHE) {
        BASE_MONITOR_TYPES_CACHE = loadBaseMonitorTypes();
    }
    return BASE_MONITOR_TYPES_CACHE;
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
        // result as constant.
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

    if (
        typeof ts.isSatisfiesExpression === "function" &&
        ts.isSatisfiesExpression(expression)
    ) {
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
 * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} initializer
 * -.
 *
 * Initializer node from a variable declaration.
 *
 * @returns {import("@typescript-eslint/utils").TSESTree.ArrayExpression | null}
 * Array expression when found.
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
 * @param {import("@typescript-eslint/utils").TSESTree.Property} property
 * Object property node.
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
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { messageId: string; node: any; data?: { type: string; } | { type: string; } | { types: string; } | { type: string; }; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());
        if (!filename.endsWith("/src/constants.ts")) {
            return {};
        }

        const baseMonitorTypes = getBaseMonitorTypes();
        const baseMonitorTypeSet = new Set(baseMonitorTypes);

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
            description:
                "Require structured logger usage instead of console in electron runtime code",
            recommended: false,
        },
        messages: {
            preferLogger:
                "Use the shared logger utilities instead of console.{{method}} in Electron runtime code.",
        },
        schema: [],
        type: "suggestion",
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { data: { method: string; }; messageId: string; node: any; }) => void; }} context
     */
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
            /**
             * @param {{callee: {type: string, object: {type: string, name: string}, computed: any, property: {type: string, name: any}}}} node
             */
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
 * ESLint rule preventing renderer bundles from importing the Electron runtime
 * directly.
 */
const rendererNoElectronImportRule = {
    meta: {
        docs: {
            description:
                "Disallow renderer code from importing Electron packages or backend modules directly.",
            recommended: false,
        },
        messages: {
            forbiddenElectronImport:
                'Renderer modules must not import from "{{module}}". Use preload bridges or shared contracts instead.',
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{
     *   getFilename: () => string;
     *   report: (descriptor: {
     *     messageId: string;
     *     node: import("@typescript-eslint/utils").TSESTree.Node;
     *     data?: Record<string, unknown>;
     *   }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        const importerDirectory = path.dirname(rawFilename);

        /**
         * Determines whether the provided module specifier references Electron
         * directly.
         *
         * @param {string} moduleName - Module specifier under evaluation.
         *
         * @returns {boolean} True when the specifier targets the Electron
         * runtime package.
         */
        function isDirectElectronModule(moduleName) {
            if (moduleName === "electron" || moduleName === "node:electron") {
                return true;
            }

            return (
                moduleName.startsWith("electron/") ||
                moduleName.startsWith("node:electron/") ||
                moduleName.startsWith("@electron/")
            );
        }

        /**
         * Checks if a relative specifier resolves into the Electron backend
         * directory.
         *
         * @param {string} moduleName - Module specifier from an import or
         * require call.
         *
         * @returns {boolean} True when the resolved path lives inside the
         * electron source tree.
         */
        function resolvesToElectronDirectory(moduleName) {
            if (!moduleName.startsWith(".")) {
                return false;
            }

            const resolved = normalizePath(
                path.resolve(importerDirectory, moduleName)
            );
            return (
                resolved === NORMALIZED_ELECTRON_DIR ||
                resolved.startsWith(`${NORMALIZED_ELECTRON_DIR}/`)
            );
        }

        /**
         * Reports an invalid Electron dependency usage.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - AST
         * node to highlight.
         * @param {string} moduleName - Name of the offending module specifier.
         *
         * @returns {void}
         */
        function reportViolation(node, moduleName) {
            context.report({
                data: { module: moduleName },
                messageId: "forbiddenElectronImport",
                node,
            });
        }

        /**
         * Evaluates a static module specifier and raises a lint violation when
         * it references Electron.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - Node
         * owning the literal specifier.
         * @param {string} moduleName - Literal module specifier value.
         *
         * @returns {void}
         */
        function handleStaticSpecifier(node, moduleName) {
            if (
                isDirectElectronModule(moduleName) ||
                resolvesToElectronDirectory(moduleName)
            ) {
                reportViolation(node, moduleName);
            }
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleStaticSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportExpression} node
             */
            ImportExpression(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleStaticSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {{callee: {type: string, name: string}, arguments: string | any[]}} node
             */
            CallExpression(node) {
                if (
                    node.callee.type === "Identifier" &&
                    node.callee.name === "require" &&
                    node.arguments.length > 0
                ) {
                    const [firstArgument] = node.arguments;
                    if (
                        firstArgument?.type === "Literal" &&
                        typeof firstArgument.value === "string"
                    ) {
                        handleStaticSpecifier(
                            firstArgument,
                            firstArgument.value
                        );
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule preventing shared layer modules from depending on renderer or
 * Electron runtime code.
 */
const sharedNoOutsideImportsRule = {
    meta: {
        docs: {
            description:
                "Restrict shared layer modules to local/shared dependencies only",
            recommended: false,
        },
        messages: {
            noExternalImports:
                'Shared modules must not import from "{{module}}". Shared code should remain platform agnostic.',
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{
     *   getFilename: () => string;
     *   report: (descriptor: {
     *     messageId: string;
     *     node: import("@typescript-eslint/utils").TSESTree.Node;
     *     data?: Record<string, unknown>;
     *   }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (normalizedFilename !== NORMALIZED_SHARED_DIR &&
                !normalizedFilename.startsWith(`${NORMALIZED_SHARED_DIR}/`))
        ) {
            return {};
        }

        const importerDirectory = path.dirname(rawFilename);

        /**
         * Reports a violation when a shared module references an external
         * layer.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - Node
         * to highlight.
         * @param {string} moduleName - The offending module specifier.
         */
        function report(node, moduleName) {
            context.report({
                data: { module: moduleName },
                messageId: "noExternalImports",
                node,
            });
        }

        /**
         * Determines whether a module specifier refers to a disallowed target.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node - AST
         * node to highlight if violation occurs.
         * @param {string} moduleName - Module specifier to inspect.
         */
        function handleModuleSpecifier(node, moduleName) {
            if (moduleName.startsWith("@shared")) {
                return;
            }

            if (
                moduleName === "@app" ||
                moduleName.startsWith("@app/") ||
                moduleName === "@electron" ||
                moduleName.startsWith("@electron/") ||
                moduleName.startsWith("src/") ||
                moduleName.startsWith("electron/")
            ) {
                report(node, moduleName);
                return;
            }

            if (!moduleName.startsWith(".")) {
                return;
            }

            const resolved = normalizePath(
                path.resolve(importerDirectory, moduleName)
            );

            if (
                resolved === NORMALIZED_SHARED_DIR ||
                resolved.startsWith(`${NORMALIZED_SHARED_DIR}/`)
            ) {
                return;
            }

            report(node, moduleName);
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleModuleSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportExpression} node
             */
            ImportExpression(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleModuleSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {{callee: {type: string, name: string}, arguments: string | any[]}} node
             */
            CallExpression(node) {
                if (
                    node.callee.type === "Identifier" &&
                    node.callee.name === "require" &&
                    node.arguments.length > 0
                ) {
                    const [firstArgument] = node.arguments;
                    if (
                        firstArgument?.type === "Literal" &&
                        typeof firstArgument.value === "string"
                    ) {
                        handleModuleSpecifier(
                            firstArgument,
                            firstArgument.value
                        );
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule ensuring Electron runtime code never depends on renderer bundles.
 */
const electronNoRendererImportRule = {
    meta: {
        docs: {
            description:
                "Disallow Electron runtime modules from importing renderer bundles",
            recommended: false,
        },
        messages: {
            noRendererImport:
                'Electron runtime code must not import from "{{module}}". Use shared contracts or preload bridges instead.',
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { data: { module: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        const importerDirectory = path.dirname(rawFilename);

        /**
         * @param {string} moduleName
         */
        function referencesRenderer(moduleName) {
            if (moduleName === "@app" || moduleName.startsWith("@app/")) {
                return true;
            }

            if (moduleName.startsWith("src/")) {
                return true;
            }

            if (!moduleName.startsWith(".")) {
                return false;
            }

            const resolved = normalizePath(
                path.resolve(importerDirectory, moduleName)
            );

            return (
                resolved === NORMALIZED_SRC_DIR ||
                resolved.startsWith(`${NORMALIZED_SRC_DIR}/`)
            );
        }

        /**
         * @param {any} node
         * @param {any} moduleName
         */
        function handleModuleSpecifier(node, moduleName) {
            if (referencesRenderer(moduleName)) {
                context.report({
                    data: { module: moduleName },
                    messageId: "noRendererImport",
                    node,
                });
            }
        }

        return {
            /**
             * @param {{source: {type: string, value: any}}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleModuleSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {{source: {type: string, value: any}}} node
             */
            ImportExpression(node) {
                if (
                    node.source.type === "Literal" &&
                    typeof node.source.value === "string"
                ) {
                    handleModuleSpecifier(node.source, node.source.value);
                }
            },

            /**
             * @param {{callee: {type: string, name: string}, arguments: string | any[]}} node
             */
            CallExpression(node) {
                if (
                    node.callee.type === "Identifier" &&
                    node.callee.name === "require" &&
                    node.arguments.length > 0
                ) {
                    const [firstArgument] = node.arguments;
                    if (
                        firstArgument?.type === "Literal" &&
                        typeof firstArgument.value === "string"
                    ) {
                        handleModuleSpecifier(
                            firstArgument,
                            firstArgument.value
                        );
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule ensuring Electron runtime code never registers IPC handlers via
 * raw `ipcMain.handle`/`ipcMain.handleOnce`.
 *
 * @remarks
 * IPC handler registration must go through the centralized helper
 * `registerStandardizedIpcHandler` in `electron/services/ipc/utils.ts` so we
 * keep consistent validation, error normalization, diagnostics logging, and
 * duplicate-registration protection.
 */
const electronNoDirectIpcHandleRule = {
    meta: {
        docs: {
            description:
                "Disallow ipcMain.handle/handleOnce outside the centralized IPC registration helper.",
            recommended: false,
        },
        messages: {
            useStandardizedRegistration:
                "Do not call ipcMain.{{method}} directly. Register IPC handlers via registerStandardizedIpcHandler in electron/services/ipc/utils.ts.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { data: { method: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allow the canonical helper module to register handlers.
        if (normalizedFilename.endsWith("/electron/services/ipc/utils.ts")) {
            return {};
        }

        const forbiddenMethods = new Set(["handle", "handleOnce"]);

        return {
            /**
             * @param {{callee: {type?: any, computed?: any, object?: any, property?: any}}} node
             */
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") {
                    return;
                }

                if (node.callee.computed) {
                    return;
                }

                const { object, property } = node.callee;

                if (
                    object.type !== "Identifier" ||
                    object.name !== "ipcMain" ||
                    property.type !== "Identifier" ||
                    !forbiddenMethods.has(property.name)
                ) {
                    return;
                }

                context.report({
                    data: { method: property.name },
                    messageId: "useStandardizedRegistration",
                    node: node.callee,
                });
            },
        };
    },
};

/**
 * ESLint rule enforcing that `ipcMain` is only imported in the centralized IPC
 * service modules.
 *
 * @remarks
 * Prevents new ad-hoc IPC registration/removal/listener codepaths from showing
 * up elsewhere in the Electron runtime.
 */
const electronNoDirectIpcMainImportRule = {
    meta: {
        docs: {
            description:
                "Disallow importing ipcMain outside electron/services/ipc/*.",
            recommended: false,
        },
        messages: {
            avoidIpcMain:
                "Do not import ipcMain here. Use the centralized IpcService / registerStandardizedIpcHandler utilities under electron/services/ipc/.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allow only the canonical IPC service modules.
        if (
            normalizedFilename.startsWith(
                `${NORMALIZED_ELECTRON_DIR}/services/ipc/`
            )
        ) {
            return {};
        }

        return {
            /**
             * @param {{source: {type: string, value: string}, specifiers: any}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    node.source.value !== "electron"
                ) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type !== "ImportSpecifier") {
                        continue;
                    }

                    const importedName =
                        specifier.imported.type === "Identifier"
                            ? specifier.imported.name
                            : typeof specifier.imported.value === "string"
                              ? specifier.imported.value
                              : null;

                    if (importedName !== "ipcMain") {
                        continue;
                    }

                    context.report({
                        messageId: "avoidIpcMain",
                        node: specifier,
                    });
                }
            },

            /**
             * @param {{callee: {type: string, name: string}, arguments: string | any[], parent: any}} node
             */
            CallExpression(node) {
                // Guard against `const { ipcMain } = require("electron")`.
                if (
                    node.callee.type !== "Identifier" ||
                    node.callee.name !== "require" ||
                    node.arguments.length !== 1
                ) {
                    return;
                }

                const [first] = node.arguments;
                if (
                    !first ||
                    first.type !== "Literal" ||
                    first.value !== "electron"
                ) {
                    return;
                }

                // We only flag the require call when we see it being
                // destructured to ipcMain. ESLint doesn't provide parent types
                // here in a typed way (plugin is JS), but this heuristic covers
                // the main abuse case.
                const parent = node.parent;
                if (
                    parent &&
                    parent.type === "VariableDeclarator" &&
                    parent.id &&
                    parent.id.type === "ObjectPattern" &&
                    parent.id.properties.some(
                        (/** @type {{type: string, computed: any, key: {type: string, name: string}}} */ property) =>
                            property.type === "Property" &&
                            !property.computed &&
                            property.key.type === "Identifier" &&
                            property.key.name === "ipcMain"
                    )
                ) {
                    context.report({
                        messageId: "avoidIpcMain",
                        node,
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule requiring IPC channel constants for handler registration.
 *
 * @remarks
 * Prevents new, inline channel strings from being introduced in handler
 * registration calls.
 *
 * In this codebase, canonical channel constants live in `@shared/types/preload`
 * as `*_CHANNELS` mappings.
 */
const electronNoInlineIpcChannelLiteralRule = {
    meta: {
        docs: {
            description:
                "Disallow inline string literals as IPC channel names in registerStandardizedIpcHandler calls.",
            recommended: false,
        },
        messages: {
            useSharedChannelConstant:
                "Do not inline IPC channel strings. Use a shared *_CHANNELS constant (from @shared/types/preload) or another imported channel constant.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // The IPC utils module is the lower-level infrastructure and may need
        // to use literals in internal examples or test-only helpers.
        if (normalizedFilename.endsWith("/electron/services/ipc/utils.ts")) {
            return {};
        }

        /**
         * @param {
         *     | import("@typescript-eslint/utils").TSESTree.Expression
         *     | import("@typescript-eslint/utils").TSESTree.SpreadElement
         *     | null
         *     | undefined} arg
         */
        function isInlineStringLiteral(arg) {
            if (!arg) {
                return false;
            }

            if (arg.type === "Literal" && typeof arg.value === "string") {
                return true;
            }

            if (
                arg.type === "TemplateLiteral" &&
                arg.expressions.length === 0
            ) {
                return true;
            }

            return false;
        }

        return {
            /**
             * @param {{callee: {type: string, name: string}, arguments: any[]}} node
             */
            CallExpression(node) {
                if (node.callee.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                const firstArg = node.arguments[0];
                if (!isInlineStringLiteral(firstArg)) {
                    return;
                }

                context.report({
                    messageId: "useSharedChannelConstant",
                    node: firstArg,
                });
            },
        };
    },
};

/**
 * ESLint rule preventing preload code from defining inline IPC channel string
 * constants.
 *
 * @remarks
 * The preload layer should import canonical channel constants from shared types
 * (e.g. `@shared/types/preload`) instead of redefining channel strings. This
 * prevents drift and keeps AI changes on the established contract codepath.
 */
const electronPreloadNoInlineIpcChannelConstantRule = {
    meta: {
        docs: {
            description:
                "Disallow defining inline *_CHANNEL string constants in electron/preload; use shared channel constants instead.",
            recommended: false,
        },
        messages: {
            noInlineChannelConstant:
                "Do not define IPC channel string constants here. Import canonical channel constants from @shared/types/preload (or another shared registry).",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/preload/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} expression
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.Expression | null}
         */
        function unwrapTsExpression(expression) {
            if (!expression) {
                return null;
            }

            if (
                expression.type === "TSAsExpression" ||
                expression.type === "TSSatisfiesExpression" ||
                expression.type === "TSTypeAssertion"
            ) {
                return unwrapTsExpression(expression.expression);
            }

            return expression;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression | null | undefined} expression
         */
        function isInlineStringLiteral(expression) {
            const unwrapped = unwrapTsExpression(expression);
            if (!unwrapped) {
                return false;
            }

            if (
                unwrapped.type === "Literal" &&
                typeof unwrapped.value === "string"
            ) {
                return true;
            }

            return (
                unwrapped.type === "TemplateLiteral" &&
                unwrapped.expressions.length === 0
            );
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                if (node.id.type !== "Identifier") {
                    return;
                }

                // Heuristic: most channel constants are ALL_CAPS with
                // CHANNEL in the name.
                if (!/CHANNEL/u.test(node.id.name)) {
                    return;
                }

                if (!isInlineStringLiteral(node.init)) {
                    return;
                }

                context.report({
                    messageId: "noInlineChannelConstant",
                    node: node.id,
                });
            },
        };
    },
};

/**
 * ESLint rule discouraging string-literal type arguments when registering IPC
 * handlers.
 *
 * @remarks
 * `registerStandardizedIpcHandler&lt;"some-channel">(...)` duplicates the channel
 * identifier in the type position and encourages drift. Prefer inference from
 * the channel constant passed as the first argument.
 */
const electronNoInlineIpcChannelTypeArgumentRule = {
    meta: {
        docs: {
            description:
                "Disallow string-literal type arguments on registerStandardizedIpcHandler; rely on inference from shared channel constants.",
            recommended: false,
        },
        messages: {
            noInlineTypeChannel:
                "Do not use a string-literal type argument for registerStandardizedIpcHandler. Use a shared channel constant and let TypeScript infer the channel type.",
        },
        schema: [],
        type: "suggestion",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: object; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {unknown} typeParams
         *
         * @returns {readonly unknown[]}
         */
        function getTypeArguments(typeParams) {
            if (!typeParams || typeof typeParams !== "object") {
                return [];
            }

            // @typescript-eslint uses `typeArguments` (newer) but older nodes may
            // expose `params`.
            if (
                "typeArguments" in typeParams &&
                Array.isArray(typeParams.typeArguments)
            ) {
                return typeParams.typeArguments;
            }

            if ("params" in typeParams && Array.isArray(typeParams.params)) {
                return typeParams.params;
            }

            return [];
        }

        return {
            /**
             * @param {{callee: {type: string, name: string}, typeArguments: any, typeParameters: any}} node
             */
            CallExpression(node) {
                if (node.callee.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                const typeParams = /** @type {unknown} */ (
                    node.typeArguments ?? node.typeParameters
                );
                const args = getTypeArguments(typeParams);
                if (args.length === 0) {
                    return;
                }

                const firstTypeArg = args[0];
                if (!firstTypeArg || typeof firstTypeArg !== "object") {
                    return;
                }

                if (!("type" in firstTypeArg)) {
                    return;
                }

                if (firstTypeArg.type !== "TSLiteralType") {
                    return;
                }

                if (!("literal" in firstTypeArg)) {
                    return;
                }

                const literal = firstTypeArg.literal;
                if (!literal || typeof literal !== "object") {
                    return;
                }

                if (!("type" in literal)) {
                    return;
                }

                if (literal.type !== "Literal") {
                    return;
                }

                if (!("value" in literal) || typeof literal.value !== "string") {
                    return;
                }

                context.report({
                    messageId: "noInlineTypeChannel",
                    node: /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                        firstTypeArg
                    ),
                });
            },
        };
    },
};

/**
 * ESLint rule preventing IPC channel string literals from being duplicated in
 * TypeScript _type positions_.
 *
 * @remarks
 * Examples of banned patterns outside the canonical shared contract modules:
 *
 * - `Extract&lt;IpcInvokeChannel, "add-site">`
 * - `const channel = "add-site" satisfies IpcInvokeChannel`
 * - `const channel = "add-site" as IpcInvokeChannel`
 *
 * These are all forms of duplicating channel identifiers in places that are not
 * the shared contract registry. Prefer importing channel constants (e.g.
 * `SITES_CHANNELS.addSite`) or referencing the shared mappings.
 */
const noInlineIpcChannelTypeLiteralsRule = {
    meta: {
        docs: {
            description:
                "Disallow IPC channel string literals in TS type positions; rely on shared channel constants and inference.",
            recommended: false,
        },
        messages: {
            noInlineChannelTypeLiteral:
                "Do not encode IPC channel strings in TypeScript type positions. Use shared channel constants/mappings (from @shared/types/preload) and let types be inferred.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (normalizedFilename === "<input>") {
            return {};
        }

        // Allow the canonical registry modules where channel literals are
        // expected and intentional.
        if (
            normalizedFilename.endsWith("/shared/types/preload.ts") ||
            normalizedFilename.endsWith("/shared/types/ipc.ts")
        ) {
            return {};
        }

        // Ignore tests/benchmarks.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.TSLiteralType}
         */
        function isStringLiteralType(node) {
            if (!node || typeof node !== "object") {
                return false;
            }

            if (!("type" in node)) {
                return false;
            }

            if (node.type !== "TSLiteralType") {
                return false;
            }

            const literal = /** @type {{literal?: unknown}} */ (node).literal;

            if (!literal || typeof literal !== "object") {
                return false;
            }

            if (!("type" in literal)) {
                return false;
            }

            return (
                literal.type === "Literal" &&
                "value" in literal &&
                typeof literal.value === "string"
            );
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.TSTypeReference}
         */
        function isTypeReference(node) {
            return Boolean(
                node &&
                typeof node === "object" &&
                "type" in node &&
                node.type === "TSTypeReference"
            );
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.Identifier}
         */
        function isIdentifier(node) {
            return Boolean(
                node &&
                    typeof node === "object" &&
                    "type" in node &&
                    node.type === "Identifier"
            );
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression} expression
         */
        function isInlineStringExpression(expression) {
            if (
                expression.type === "Literal" &&
                typeof expression.value === "string"
            ) {
                return true;
            }

            return (
                expression.type === "TemplateLiteral" &&
                expression.expressions.length === 0
            );
        }

        return {
            /**
             * @param {{typeName: unknown, typeArguments: {params: any}}} node
             */
            TSTypeReference(node) {
                // Extract<IpcInvokeChannel, "some-channel">
                if (
                    !isIdentifier(node.typeName) ||
                    node.typeName.name !== "Extract"
                ) {
                    return;
                }

                const params = node.typeArguments?.params;
                if (!params || params.length < 2) {
                    return;
                }

                const [firstParam, secondParam] = params;
                if (!isTypeReference(firstParam)) {
                    return;
                }

                if (
                    !isIdentifier(firstParam.typeName) ||
                    firstParam.typeName.name !== "IpcInvokeChannel"
                ) {
                    return;
                }

                if (!isStringLiteralType(secondParam)) {
                    return;
                }

                context.report({
                    messageId: "noInlineChannelTypeLiteral",
                    node: secondParam,
                });
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSSatisfiesExpression} node
             */
            TSSatisfiesExpression(node) {
                // "some-channel" satisfies IpcInvokeChannel
                const annotation = node.typeAnnotation;
                if (!annotation || !isTypeReference(annotation)) {
                    return;
                }

                if (
                    !isIdentifier(annotation.typeName) ||
                    annotation.typeName.name !== "IpcInvokeChannel"
                ) {
                    return;
                }

                if (isInlineStringExpression(node.expression)) {
                    context.report({
                        messageId: "noInlineChannelTypeLiteral",
                        node,
                    });
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSAsExpression} node
             */
            TSAsExpression(node) {
                // "some-channel" as IpcInvokeChannel
                if (!isInlineStringExpression(node.expression)) {
                    return;
                }

                const annotation = node.typeAnnotation;
                if (!annotation || !isTypeReference(annotation)) {
                    return;
                }

                if (
                    !isIdentifier(annotation.typeName) ||
                    annotation.typeName.name !== "IpcInvokeChannel"
                ) {
                    return;
                }

                context.report({
                    messageId: "noInlineChannelTypeLiteral",
                    node,
                });
            },
        };
    },
};

/**
 * ESLint rule preventing preload domain modules from touching `ipcRenderer`
 * directly.
 *
 * @remarks
 * Only the core bridge infrastructure should talk to `ipcRenderer`. Domain
 * modules must compose bridges via the core factory utilities.
 */
const electronPreloadNoDirectIpcRendererUsageRule = {
    meta: {
        docs: {
            description:
                "Disallow ipcRenderer usage in preload modules outside core bridge infrastructure.",
            recommended: false,
        },
        messages: {
            noDirectIpcRenderer:
                "Do not use ipcRenderer directly in preload domain modules. Use the core bridgeFactory helpers instead.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/preload/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allow the core modules that legitimately speak ipcRenderer.
        if (
            normalizedFilename.endsWith(
                "/electron/preload/core/bridgeFactory.ts"
            ) ||
            normalizedFilename.endsWith(
                "/electron/preload/utils/preloadLogger.ts"
            )
        ) {
            return {};
        }

        return {
            /**
             * @param {{source: {type: string, value: string}, specifiers: any}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    node.source.value !== "electron"
                ) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type !== "ImportSpecifier") {
                        continue;
                    }

                    const importedName =
                        specifier.imported.type === "Identifier"
                            ? specifier.imported.name
                            : typeof specifier.imported.value === "string"
                              ? specifier.imported.value
                              : null;

                    if (importedName === "ipcRenderer") {
                        context.report({
                            messageId: "noDirectIpcRenderer",
                            node: specifier,
                        });
                    }
                }
            },

            /**
             * @param {{object: {type: string, name: string}}} node
             */
            MemberExpression(node) {
                // Any usage of a free identifier `ipcRenderer` in preload domain
                // code is banned.
                if (
                    node.object.type === "Identifier" &&
                    node.object.name === "ipcRenderer"
                ) {
                    context.report({
                        messageId: "noDirectIpcRenderer",
                        node: node.object,
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule preventing renderer application code from accessing
 * `window.electronAPI` directly.
 *
 * @remarks
 * The renderer should reach the preload bridge via the established service
 * wrappers in `src/services/*` (built using `getIpcServiceHelpers`). Direct
 * access tends to create parallel, untested codepaths with inconsistent
 * readiness checks and error handling.
 */
const rendererNoDirectPreloadBridgeRule = {
    meta: {
        docs: {
            description:
                "Disallow direct window.electronAPI usage outside the IPC service helper utilities.",
            recommended: false,
        },
        messages: {
            avoidDirectBridge:
                "Do not access {{owner}}.electronAPI directly. Use the established src/services/*Service wrappers (via getIpcServiceHelpers) instead.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { data: { owner: string; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Allow the helper module that centrally gates and logs access.
        if (
            normalizedFilename.endsWith(
                "/src/services/utils/createIpcServiceHelpers.ts"
            )
        ) {
            return {};
        }

        /**
         * Determines whether the member expression is `window.electronAPI` or
         * `globalThis.window.electronAPI` etc.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} member
         *
         * @returns {{owner: string} | null}
         */
        function matchElectronApiMember(member) {
            const property = member.property;
            if (member.computed) {
                if (
                    property.type === "Literal" &&
                    property.value === "electronAPI"
                ) {
                    // Computed access like window["electronAPI"].
                } else {
                    return null;
                }
            } else if (
                property.type !== "Identifier" ||
                property.name !== "electronAPI"
            ) {
                return null;
            }

            const object = member.object;
            if (object.type === "Identifier") {
                if (
                    object.name === "window" ||
                    object.name === "globalThis" ||
                    object.name === "global"
                ) {
                    return { owner: object.name };
                }

                return null;
            }

            if (object.type === "MemberExpression" && !object.computed) {
                // Match globalThis.window.electronAPI
                const innerObject = object.object;
                const innerProperty = object.property;
                if (
                    innerObject.type === "Identifier" &&
                    (innerObject.name === "globalThis" ||
                        innerObject.name === "global") &&
                    innerProperty.type === "Identifier" &&
                    innerProperty.name === "window"
                ) {
                    return { owner: `${innerObject.name}.window` };
                }
            }

            return null;
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} node
             */
            MemberExpression(node) {
                const match = matchElectronApiMember(node);
                if (!match) {
                    return;
                }

                context.report({
                    data: { owner: match.owner },
                    messageId: "avoidDirectBridge",
                    node,
                });
            },
        };
    },
};

/**
 * ESLint rule preventing assignments/mutations of `window.electronAPI` in
 * renderer production code.
 *
 * @remarks
 * Only tests/mocks should ever define or overwrite the preload bridge.
 */
const rendererNoPreloadBridgeWritesRule = {
    meta: {
        docs: {
            description:
                "Disallow mutating window.electronAPI in renderer code (non-test).",
            recommended: false,
        },
        messages: {
            noBridgeWrites:
                "Do not assign/define window.electronAPI in application code. Preload owns the bridge; renderer should only read it via services.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} member
         */
        function isElectronApiMember(member) {
            if (member.computed) {
                return (
                    member.property.type === "Literal" &&
                    member.property.value === "electronAPI"
                );
            }

            return (
                member.property.type === "Identifier" &&
                member.property.name === "electronAPI"
            );
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.AssignmentExpression} node
             */
            AssignmentExpression(node) {
                if (node.left.type !== "MemberExpression") {
                    return;
                }

                if (!isElectronApiMember(node.left)) {
                    return;
                }

                // Only flag obvious roots: window / globalThis / global.
                const object = node.left.object;
                if (
                    object.type === "Identifier" &&
                    (object.name === "window" ||
                        object.name === "globalThis" ||
                        object.name === "global")
                ) {
                    context.report({
                        messageId: "noBridgeWrites",
                        node,
                    });
                }
            },

            /**
             * @param {{ callee: { type: string; computed: any; object: { type: string; name: string; }; property: { type: string; name: string; }; }; arguments: [any, any]; }} node
             */
            CallExpression(node) {
                // Object.defineProperty(window, "electronAPI", ...)
                if (
                    node.callee.type !== "MemberExpression" ||
                    node.callee.computed
                ) {
                    return;
                }

                if (
                    node.callee.object.type !== "Identifier" ||
                    node.callee.object.name !== "Object" ||
                    node.callee.property.type !== "Identifier" ||
                    node.callee.property.name !== "defineProperty"
                ) {
                    return;
                }

                const [target, propertyName] = node.arguments;
                if (!target || !propertyName) {
                    return;
                }

                if (
                    target.type === "Identifier" &&
                    (target.name === "window" ||
                        target.name === "globalThis" ||
                        target.name === "global") &&
                    ((propertyName.type === "Literal" &&
                        propertyName.value === "electronAPI") ||
                        (propertyName.type === "TemplateLiteral" &&
                            propertyName.expressions.length === 0 &&
                            propertyName.quasis.length === 1 &&
                            propertyName.quasis[0]?.value?.cooked ===
                                "electronAPI"))
                ) {
                    context.report({
                        messageId: "noBridgeWrites",
                        node,
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule restricting direct usage of electron-log/renderer.
 *
 * @remarks
 * Renderer logging should be centralized through `src/services/logger.ts` (and
 * the IPC helper fallback) to avoid a proliferation of custom logging setups.
 */
const rendererNoDirectElectronLogRule = {
    meta: {
        docs: {
            description:
                "Disallow importing electron-log/renderer outside the renderer logger modules.",
            recommended: false,
        },
        messages: {
            useRendererLogger:
                "Do not import {{module}} here. Use src/services/logger.ts (or inject a logger) to keep logging centralized.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { data: { module: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Allow canonical logger modules.
        if (
            normalizedFilename.endsWith("/src/services/logger.ts") ||
            normalizedFilename.endsWith(
                "/src/services/utils/createIpcServiceHelpers.ts"
            )
        ) {
            return {};
        }

        const forbiddenModules = new Set([
            "electron-log/renderer",
            "electron-log",
        ]);

        return {
            /**
             * @param {{source: {type: string, value: any}}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const moduleName = node.source.value;
                if (!forbiddenModules.has(moduleName)) {
                    return;
                }

                context.report({
                    data: { module: moduleName },
                    messageId: "useRendererLogger",
                    node: node.source,
                });
            },
        };
    },
};

/**
 * ESLint rule preventing non-service modules from importing internal
 * `src/services/utils/*` helpers.
 */
const rendererNoImportInternalServiceUtilsRule = {
    meta: {
        docs: {
            description:
                "Disallow importing src/services/utils/* outside src/services/*.",
            recommended: false,
        },
        messages: {
            noInternalUtils:
                "Do not import internal service utilities (src/services/utils/*) outside the service layer. Use the public service APIs instead.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Services are allowed to use their own internal utilities.
        if (normalizedFilename.includes("/src/services/")) {
            return {};
        }

        return {
            /**
             * @param {{source: {type: string, value: any}}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const moduleName = node.source.value;

                // Catch both Vite alias and relative imports.
                if (
                    moduleName.includes("/services/utils/") ||
                    moduleName.includes("\\services\\utils\\") ||
                    moduleName.startsWith("./services/utils/") ||
                    moduleName.startsWith("../services/utils/") ||
                    moduleName.startsWith("@app/services/utils/")
                ) {
                    context.report({
                        messageId: "noInternalUtils",
                        node: node.source,
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule preventing direct networking calls from UI code.
 *
 * @remarks
 * Renderer code should not scatter `fetch`/`axios` calls throughout components
 * and hooks. If networking is required in the renderer, centralize it in the
 * service layer (src/services/**) so callers share retry, logging, caching, and
 * error normalization.
 */
const rendererNoDirectNetworkingRule = {
    meta: {
        docs: {
            description:
                "Disallow direct fetch/axios usage outside the renderer service layer.",
            recommended: false,
        },
        messages: {
            noDirectNetworking:
                "Do not perform direct networking ({{api}}) here. Centralize networking in src/services/* (or Electron) to avoid duplicated codepaths.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ sourceCode: any; getSourceCode: () => any; getFilename: () => any; report: (arg0: { data: { api: string; } | { api: string; } | { api: string; } | { api: string; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Allow networking inside the service layer (single canonical place).
        if (normalizedFilename.includes("/src/services/")) {
            return {};
        }

        /** @type {Set<string>} */
        const axiosLocalNames = new Set();

        /**
         * @param {string} name
         * @param {any} node
         */
        function hasLocalBinding(name, node) {
            let scope = sourceCode.getScope(node);
            while (scope) {
                const variable = scope.set.get(name);
                if (variable && variable.defs.length > 0) {
                    return true;
                }
                scope = scope.upper;
            }
            return false;
        }

        return {
            /**
             * @param {{source: {type: string, value: string}, specifiers: any}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    node.source.value !== "axios"
                ) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    // default import: import axios from "axios"
                    if (specifier.type === "ImportDefaultSpecifier") {
                        axiosLocalNames.add(specifier.local.name);
                        continue;
                    }

                    // namespace import: import * as axios from "axios"
                    if (specifier.type === "ImportNamespaceSpecifier") {
                        axiosLocalNames.add(specifier.local.name);
                        continue;
                    }

                    // named import: import { Axios } from "axios" (rare)
                    if (specifier.type === "ImportSpecifier") {
                        axiosLocalNames.add(specifier.local.name);
                    }
                }

                context.report({
                    data: { api: "axios" },
                    messageId: "noDirectNetworking",
                    node: node.source,
                });
            },

            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = node.callee;

                // fetch(...)
                if (callee.type === "Identifier" && callee.name === "fetch") {
                    if (!hasLocalBinding("fetch", node)) {
                        context.report({
                            data: { api: "fetch" },
                            messageId: "noDirectNetworking",
                            node: callee,
                        });
                    }
                    return;
                }

                // axios(...)
                if (callee.type === "Identifier") {
                    if (axiosLocalNames.has(callee.name)) {
                        context.report({
                            data: { api: "axios" },
                            messageId: "noDirectNetworking",
                            node: callee,
                        });
                    }
                    return;
                }

                // axios.get(...)
                if (callee.type === "MemberExpression" && !callee.computed) {
                    if (
                        callee.object.type === "Identifier" &&
                        axiosLocalNames.has(callee.object.name)
                    ) {
                        context.report({
                            data: { api: "axios" },
                            messageId: "noDirectNetworking",
                            node: callee,
                        });
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule forbidding ipcRenderer usage in renderer application code.
 *
 * @remarks
 * Renderer IPC must flow through the preload bridge (`window.electronAPI`) and
 * the service wrappers in `src/services/*`. Direct ipcRenderer usage creates
 * parallel codepaths that bypass validation, readiness checks, and error
 * normalization.
 */
const rendererNoIpcRendererUsageRule = {
    meta: {
        docs: {
            description:
                "Disallow ipcRenderer usage in src/*; use the preload bridge and services instead.",
            recommended: false,
        },
        messages: {
            noIpcRenderer:
                "Do not use ipcRenderer in renderer code. Use window.electronAPI via src/services/* instead.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{
     *   getFilename: () => string;
     *   getSourceCode: () => any;
     *   sourceCode?: any;
     *   report: (descriptor: {
     *     messageId: string;
     *     node: import("@typescript-eslint/utils").TSESTree.Node;
     *     data?: Record<string, unknown>;
     *   }) => void;
     * }} context
     */
    create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /** @type {Set<string>} */
        const electronModuleBindings = new Set();

        /**
         * @param {string} name
         * @param {any} node
         */
        function hasLocalBinding(name, node) {
            let scope = sourceCode.getScope(node);
            while (scope) {
                const variable = scope.set.get(name);
                if (variable && variable.defs.length > 0) {
                    return true;
                }
                scope = scope.upper;
            }
            return false;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node
         */
        function report(node) {
            context.report({
                messageId: "noIpcRenderer",
                node,
            });
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Expression} expression
         */
        function isRequireElectronCall(expression) {
            return (
                expression.type === "CallExpression" &&
                expression.callee.type === "Identifier" &&
                expression.callee.name === "require" &&
                expression.arguments.length === 1 &&
                expression.arguments[0]?.type === "Literal" &&
                expression.arguments[0].value === "electron"
            );
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} member
         * @param {string | number | bigint | boolean | RegExp | null} name
         */
        function isPropertyNamed(member, name) {
            if (member.computed) {
                return (
                    member.property.type === "Literal" &&
                    member.property.value === name
                );
            }

            return (
                member.property.type === "Identifier" &&
                member.property.name === name
            );
        }

        return {
            /**
             * @param {{source: {type: string, value: any}, specifiers: any}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const moduleName = node.source.value;

                if (moduleName !== "electron") {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type === "ImportSpecifier") {
                        const importedName =
                            specifier.imported.type === "Identifier"
                                ? specifier.imported.name
                                : typeof specifier.imported.value === "string"
                                  ? specifier.imported.value
                                  : null;

                        if (importedName === "ipcRenderer") {
                            report(specifier);
                        }
                        continue;
                    }

                    // Track default/namespace imports for later member checks
                    // like `electron.ipcRenderer`.
                    if (
                        specifier.type === "ImportDefaultSpecifier" ||
                        specifier.type === "ImportNamespaceSpecifier"
                    ) {
                        electronModuleBindings.add(specifier.local.name);
                    }
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.VariableDeclarator} node
             */
            VariableDeclarator(node) {
                if (!node.init || node.id.type !== "Identifier") {
                    return;
                }

                if (!isRequireElectronCall(node.init)) {
                    return;
                }

                electronModuleBindings.add(node.id.name);
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                // Detect destructuring `require("electron")` that pulls `ipcRenderer`.
                if (
                    node.callee.type !== "Identifier" ||
                    node.callee.name !== "require" ||
                    node.arguments.length !== 1
                ) {
                    return;
                }

                const [first] = node.arguments;
                if (
                    !first ||
                    first.type !== "Literal" ||
                    first.value !== "electron"
                ) {
                    return;
                }

                const parent = node.parent;
                if (
                    parent &&
                    parent.type === "VariableDeclarator" &&
                    parent.id &&
                    parent.id.type === "ObjectPattern" &&
                    parent.id.properties.some((property) => {
                        if (property.type !== "Property") {
                            return false;
                        }

                        if (property.computed) {
                            return false;
                        }

                        return (
                            property.key.type === "Identifier" &&
                            property.key.name === "ipcRenderer"
                        );
                    })
                ) {
                    report(node);
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} node
             */
            MemberExpression(node) {
                // ipcRenderer.invoke(...)
                if (node.object.type === "Identifier") {
                    if (
                        node.object.name === "ipcRenderer" &&
                        !hasLocalBinding("ipcRenderer", node)
                    ) {
                        report(node.object);
                        return;
                    }

                    // electron.ipcRenderer (where `electron` came from
                    // require/import)
                    if (
                        electronModuleBindings.has(node.object.name) &&
                        isPropertyNamed(node, "ipcRenderer")
                    ) {
                        report(node.property);
                        return;
                    }
                }

                // require("electron").ipcRenderer
                if (
                    isPropertyNamed(node, "ipcRenderer") &&
                    node.object.type === "CallExpression" &&
                    isRequireElectronCall(node.object)
                ) {
                    report(node.property);
                }
            },
        };
    },
};

const FORBIDDEN_BROWSER_DIALOG_NAMES = new Set([
    "alert",
    "confirm",
    "prompt",
]);

const FORBIDDEN_WINDOW_OPEN_OBJECTS = new Set([
    "window",
    "globalThis",
    "global",
]);

/**
 * ESLint rule discouraging usage of native browser dialogs in favour of the
 * dedicated confirmation dialog infrastructure.
 */
const rendererNoBrowserDialogsRule = {
    meta: {
        docs: {
            description:
                "Disallow alert/confirm/prompt in renderer code so UX flows use the shared dialog system",
            recommended: false,
        },
        messages: {
            avoidBrowserDialog:
                'Replace browser dialog "{{dialog}}" with the shared confirmation dialog utilities.',
        },
        schema: [],
        type: "suggestion",
    },

    /**
     * @param {{ getFilename: () => any; sourceCode: any; getSourceCode: () => any; report: (arg0: { data: { dialog: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);
        const sourceCode = context.sourceCode ?? context.getSourceCode();

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /**
         * @param {any} name
         * @param {any} node
         */
        function hasLocalBinding(name, node) {
            let scope = sourceCode.getScope(node);
            while (scope) {
                const variable = scope.set.get(name);
                if (variable && variable.defs.length > 0) {
                    return true;
                }
                scope = scope.upper;
            }
            return false;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Node} expression
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.Node}
         */
        function unwrapChain(expression) {
            return expression.type === "ChainExpression"
                ? unwrapChain(expression.expression)
                : expression;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} memberExpression
         */
        function getMemberPropertyName(memberExpression) {
            if (memberExpression.computed) {
                if (
                    memberExpression.property.type === "Literal" &&
                    typeof memberExpression.property.value === "string"
                ) {
                    return memberExpression.property.value;
                }
                return null;
            }

            if (memberExpression.property.type === "Identifier") {
                return memberExpression.property.name;
            }

            return null;
        }

        /**
         * @param {any} callee
         * @param {any} node
         */
        function getForbiddenDialogFromCallee(callee, node) {
            const unwrapped = unwrapChain(callee);

            if (unwrapped.type === "Identifier") {
                if (
                    FORBIDDEN_BROWSER_DIALOG_NAMES.has(unwrapped.name) &&
                    !hasLocalBinding(unwrapped.name, node)
                ) {
                    return unwrapped.name;
                }
                return null;
            }

            if (unwrapped.type !== "MemberExpression") {
                return null;
            }

            const propertyName = getMemberPropertyName(unwrapped);
            if (
                !propertyName ||
                !FORBIDDEN_BROWSER_DIALOG_NAMES.has(propertyName)
            ) {
                return null;
            }

            const object = unwrapChain(unwrapped.object);
            if (object.type === "Identifier") {
                if (
                    object.name === "window" ||
                    object.name === "globalThis" ||
                    object.name === "global"
                ) {
                    return propertyName;
                }
            }

            return null;
        }

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const dialog = getForbiddenDialogFromCallee(node.callee, node);
                if (!dialog) {
                    return;
                }

                context.report({
                    data: { dialog },
                    messageId: "avoidBrowserDialog",
                    node,
                });
            },
        };
    },
};

/**
 * ESLint rule forbidding `window.open` usage in renderer code.
 *
 * @remarks
 * Renderer code should not bypass the main-process boundary for external
 * navigation. Use `SystemService.openExternal()` so URL validation and OS
 * integration remain centralized.
 */
const rendererNoWindowOpenRule = {
    meta: {
        docs: {
            description:
                "Disallow window.open in renderer code so external navigation stays behind the main-process boundary",
            recommended: false,
        },
        messages: {
            avoidWindowOpen:
                "Do not use window.open in renderer code. Use SystemService.openExternal() instead.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; sourceCode: any; getSourceCode: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);
        const sourceCode = context.sourceCode ?? context.getSourceCode();

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        /**
         * @param {string} name
         * @param {any} node
         */
        function hasLocalBinding(name, node) {
            let scope = sourceCode.getScope(node);
            while (scope) {
                const variable = scope.set.get(name);
                if (variable && variable.defs.length > 0) {
                    return true;
                }
                scope = scope.upper;
            }
            return false;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.Node} expression
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.Node}
         */
        function unwrapChain(expression) {
            return expression.type === "ChainExpression"
                ? unwrapChain(expression.expression)
                : expression;
        }

        /**
         * @param {import("@typescript-eslint/utils").TSESTree.MemberExpression} memberExpression
         */
        function getMemberPropertyName(memberExpression) {
            if (memberExpression.computed) {
                if (
                    memberExpression.property.type === "Literal" &&
                    typeof memberExpression.property.value === "string"
                ) {
                    return memberExpression.property.value;
                }
                return null;
            }

            if (memberExpression.property.type === "Identifier") {
                return memberExpression.property.name;
            }

            return null;
        }

        /**
         * @param {any} callee
         * @param {any} node
         */
        function isForbiddenWindowOpenCallee(callee, node) {
            const unwrapped = unwrapChain(callee);

            if (unwrapped.type === "Identifier") {
                if (
                    unwrapped.name === "open" &&
                    !hasLocalBinding("open", node)
                ) {
                    return true;
                }
                return false;
            }

            if (unwrapped.type !== "MemberExpression") {
                return false;
            }

            const propertyName = getMemberPropertyName(unwrapped);
            if (propertyName !== "open") {
                return false;
            }

            const object = unwrapChain(unwrapped.object);
            if (object.type === "Identifier") {
                return FORBIDDEN_WINDOW_OPEN_OBJECTS.has(object.name);
            }

            return false;
        }

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                if (!isForbiddenWindowOpenCallee(node.callee, node)) {
                    return;
                }

                context.report({
                    messageId: "avoidWindowOpen",
                    node,
                });
            },
        };
    },
};

/**
 * ESLint rule enforcing that Electron IPC handlers are wrapped via
 * `registerStandardizedIpcHandler` rather than directly invoking
 * `withIpcHandler`/`withIpcHandlerValidation`.
 *
 * @remarks
 * This is an explicit "no new codepaths" rule: the only module that should deal
 * with response formatting, timing, and validation plumbing is
 * `electron/services/ipc/utils.ts`.
 */
const electronNoDirectIpcHandlerWrappersRule = {
    meta: {
        docs: {
            description:
                "Disallow calling withIpcHandler/withIpcHandlerValidation outside the IPC utilities module.",
            recommended: false,
        },
        messages: {
            preferStandardRegistration:
                "Do not call {{wrapper}} directly. Use registerStandardizedIpcHandler so IPC handling stays centralized and consistent.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{
     *   getFilename: () => string;
     *   report: (descriptor: {
     *     messageId: string;
     *     node: import("@typescript-eslint/utils").TSESTree.Node;
     *     data?: Record<string, unknown>;
     *   }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                normalizedFilename !== NORMALIZED_ELECTRON_DIR) ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        // Allow the canonical IPC utility module.
        if (normalizedFilename.endsWith("/electron/services/ipc/utils.ts")) {
            return {};
        }

        const forbiddenImportedNames = new Set([
            "withIpcHandler",
            "withIpcHandlerValidation",
        ]);

        /** @type {Set<string>} */
        const forbiddenLocalIdentifiers = new Set();

        /**
         * Reports a direct wrapper call.
         *
         * @param {import("@typescript-eslint/utils").TSESTree.Node} node
         * @param {string} wrapper
         */
        function report(node, wrapper) {
            context.report({
                data: { wrapper },
                messageId: "preferStandardRegistration",
                node,
            });
        }

        return {
            /**
             * @param {{source: {type: string}, specifiers: any}} node
             */
            ImportDeclaration(node) {
                if (!node.source || node.source.type !== "Literal") {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type !== "ImportSpecifier") {
                        continue;
                    }

                    const importedName =
                        specifier.imported.type === "Identifier"
                            ? specifier.imported.name
                            : typeof specifier.imported.value === "string"
                              ? specifier.imported.value
                              : null;

                    if (!importedName) {
                        continue;
                    }

                    if (!forbiddenImportedNames.has(importedName)) {
                        continue;
                    }

                    forbiddenLocalIdentifiers.add(specifier.local.name);
                }
            },

            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = node.callee;

                if (callee.type === "Identifier") {
                    if (
                        forbiddenImportedNames.has(callee.name) ||
                        forbiddenLocalIdentifiers.has(callee.name)
                    ) {
                        report(callee, callee.name);
                    }
                    return;
                }

                if (callee.type === "MemberExpression" && !callee.computed) {
                    if (
                        callee.property.type === "Identifier" &&
                        forbiddenImportedNames.has(callee.property.name)
                    ) {
                        report(callee.property, callee.property.name);
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule enforcing a single renderer bridge-readiness codepath.
 *
 * @remarks
 * Renderer code should not call `waitForElectronBridge` directly. Instead it
 * should use `getIpcServiceHelpers` (which calls into the readiness utilities)
 * so initialization, retry/backoff, and diagnostics stay consistent.
 */
const rendererNoDirectBridgeReadinessRule = {
    meta: {
        docs: {
            description:
                "Disallow calling waitForElectronBridge outside the renderer IPC helper utilities.",
            recommended: false,
        },
        messages: {
            preferServiceHelpers:
                "Do not call {{callee}} directly. Use getIpcServiceHelpers / createIpcServiceHelpers so bridge readiness stays centralized.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => any; report: (arg0: { data: { callee: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename();
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) ||
            normalizedFilename.includes("/src/test/")
        ) {
            return {};
        }

        // Allow the utilities that implement the canonical readiness codepath.
        if (
            normalizedFilename.includes("/src/services/utils/") ||
            normalizedFilename.endsWith(
                "/src/services/utils/createIpcServiceHelpers.ts"
            )
        ) {
            return {};
        }

        /** @type {Set<string>} */
        const waitForElectronBridgeLocals = new Set();
        /** @type {Set<string>} */
        const notReadyErrorLocals = new Set();

        /**
         * @param {any} node
         * @param {string} callee
         */
        function report(node, callee) {
            context.report({
                data: { callee },
                messageId: "preferServiceHelpers",
                node,
            });
        }

        return {
            /**
             * @param {{specifiers: any}} node
             */
            ImportDeclaration(node) {
                for (const specifier of node.specifiers) {
                    if (specifier.type !== "ImportSpecifier") {
                        continue;
                    }

                    const importedName =
                        specifier.imported.type === "Identifier"
                            ? specifier.imported.name
                            : typeof specifier.imported.value === "string"
                              ? specifier.imported.value
                              : null;

                    if (!importedName) {
                        continue;
                    }

                    if (importedName === "waitForElectronBridge") {
                        waitForElectronBridgeLocals.add(specifier.local.name);
                    }

                    if (importedName === "ElectronBridgeNotReadyError") {
                        notReadyErrorLocals.add(specifier.local.name);
                    }
                }
            },

            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = node.callee;
                if (callee.type === "Identifier") {
                    if (callee.name === "waitForElectronBridge") {
                        report(callee, "waitForElectronBridge");
                        return;
                    }

                    if (waitForElectronBridgeLocals.has(callee.name)) {
                        report(callee, callee.name);
                    }
                }

                if (callee.type === "MemberExpression" && !callee.computed) {
                    if (
                        callee.property.type === "Identifier" &&
                        callee.property.name === "waitForElectronBridge"
                    ) {
                        report(callee.property, "waitForElectronBridge");
                    }
                }
            },

            /**
             * @param {{callee: any}} node
             */
            NewExpression(node) {
                const callee = node.callee;
                if (callee.type === "Identifier") {
                    if (callee.name === "ElectronBridgeNotReadyError") {
                        report(callee, "ElectronBridgeNotReadyError");
                        return;
                    }

                    if (notReadyErrorLocals.has(callee.name)) {
                        report(callee, callee.name);
                    }
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
            description:
                "Disallow console.* in TSDoc example code blocks; prefer structured logger",
            recommended: false,
        },
        messages: {
            replaceConsole:
                "Replace console usage in examples with the structured logger.",
        },
        schema: [],
        type: "suggestion",
    },

    /**
     * @param {{ getSourceCode: () => any; report: (arg0: { loc: { end: any; start: any; }; messageId: string; }) => void; }} context
     */
    create(context) {
        const sourceCode = context.getSourceCode();

        return {
            Program() {
                const comments = sourceCode.getAllComments();
                for (const comment of comments) {
                    if (
                        comment.type !== "Block" ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    const examplePattern = /```[\s\S]*?```/gu;
                    const consolePattern = /console\.[a-zA-Z]+/u;
                    let match;

                    while (
                        (match = examplePattern.exec(comment.value)) !== null
                    ) {
                        if (!consolePattern.test(match[0])) {
                            continue;
                        }

                        const reportIndex = comment.range[0] + 2 + match.index;
                        const loc = sourceCode.getLocFromIndex(reportIndex);
                        context.report({
                            loc: {
                                end: sourceCode.getLocFromIndex(
                                    reportIndex + match[0].length
                                ),
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
            description:
                "Enforce @shared/* import aliases instead of relative shared paths",
            recommended: false,
        },
        fixable: "code",
        messages: {
            useAlias:
                "Import from shared modules via the @shared alias instead of relative paths.",
        },
        schema: [],
        type: "suggestion",
    },

    /**
     * @param {{getFilename: () => any; report: (arg0: {fix: (fixer: any) => any; messageId: string; node: any}) => void}} context
     */
    create(context) {
        const filename = context.getFilename();
        const normalizedFilename = normalizePath(filename);

        if (
            normalizedFilename === "<input>" ||
            normalizedFilename.includes("/shared/")
        ) {
            return {};
        }

        const importerDirectory = path.dirname(filename);

        return {
            /**
             * @param {{source: {type: string, value: any, raw: any, extra: {raw: any}}}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const importPath = String(node.source.value);
                if (!importPath.startsWith(".")) {
                    return;
                }

                const importAbsolutePath = path.resolve(
                    importerDirectory,
                    importPath
                );
                const normalizedImportAbsolute =
                    normalizePath(importAbsolutePath);

                if (normalizedImportAbsolute === NORMALIZED_SHARED_DIR) {
                    return;
                }

                if (
                    !normalizedImportAbsolute.startsWith(
                        `${NORMALIZED_SHARED_DIR}/`
                    )
                ) {
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
                    /**
                     * @param {{ replaceText: (arg0: any, arg1: string) => any; }} fixer
                     */
                    fix(fixer) {
                        return fixer.replaceText(
                            node.source,
                            `${quote}${aliasPath}${quote}`
                        );
                    },
                    messageId: "useAlias",
                    node: node.source,
                });
            },
        };
    },
};

/**
 * ESLint rule ensuring files outside of src reference renderer modules via the.
 *
 * @app alias.
 */
const preferAppAliasRule = {
    meta: {
        docs: {
            description:
                "Use the @app alias instead of relative paths into src from external packages",
            recommended: false,
        },
        fixable: "code",
        messages: {
            useAlias:
                "Import from src via the @app alias instead of relative paths.",
        },
        schema: [],
        type: "suggestion",
    },

    /**
     * @param {{getFilename: () => any; report: (arg0: {fix: (fixer: any) => any; messageId: string; node: any}) => void}} context
     */
    create(context) {
        const filename = context.getFilename();
        const normalizedFilename = normalizePath(filename);

        if (
            normalizedFilename === "<input>" ||
            normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`)
        ) {
            return {};
        }

        const importerDirectory = path.dirname(filename);

        return {
            /**
             * @param {{source: {type: string, value: any, raw: any, extra: {raw: any}}}} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const importPath = String(node.source.value);
                if (!importPath.startsWith(".")) {
                    return;
                }

                const importAbsolutePath = path.resolve(
                    importerDirectory,
                    importPath
                );
                const normalizedImportAbsolute =
                    normalizePath(importAbsolutePath);

                if (
                    normalizedImportAbsolute !== NORMALIZED_SRC_DIR &&
                    !normalizedImportAbsolute.startsWith(
                        `${NORMALIZED_SRC_DIR}/`
                    )
                ) {
                    return;
                }

                const relativeToSrc = normalizePath(
                    path.relative(SRC_DIR, importAbsolutePath)
                );

                if (!relativeToSrc || relativeToSrc.startsWith("..")) {
                    return;
                }

                const aliasSuffix = relativeToSrc.replace(
                    /\.(?:[cm]?[jt]sx?|d\.ts)$/u,
                    ""
                );
                const cleanedSuffix = aliasSuffix.replace(/^\.\/?/u, "");
                const aliasPath =
                    cleanedSuffix.length > 0 ? `@app/${cleanedSuffix}` : "@app";
                const rawSource = node.source.raw ?? node.source.extra?.raw;
                const quote = rawSource?.startsWith("'") ? "'" : '"';

                context.report({
                    /**
                     * @param {{ replaceText: (arg0: any, arg1: string) => any; }} fixer
                     */
                    fix(fixer) {
                        return fixer.replaceText(
                            node.source,
                            `${quote}${aliasPath}${quote}`
                        );
                    },
                    messageId: "useAlias",
                    node: node.source,
                });
            },
        };
    },
};

const DEPRECATED_TAG_PATTERN = /@deprecated\b/iu;

const noDeprecatedExportsRule = {
    meta: {
        docs: {
            description:
                "Disallow exporting declarations that are annotated with @deprecated",
            recommended: false,
        },
        messages: {
            noDeprecatedExports:
                "Exported declarations must not be marked @deprecated. Remove the tag or explicitly disable this rule if the export must remain deprecated.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{
     *   sourceCode?: any;
     *   getSourceCode?: () => any;
     *   report: (descriptor: {
     *     messageId: string;
     *     node: import("@typescript-eslint/utils").TSESTree.Node;
     *   }) => void;
     * }} context
     */
    create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode?.();
        const inspectedNodes = new WeakSet();

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
        function getJSDoc(node) {
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

            const lastComment = comments[comments.length - 1];
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

            const comment = getJSDoc(targetNode);
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
};

const noLocalRecordGuardsRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow local record-guard helper declarations (use shared type helpers instead)",
            recommended: true,
        },
        messages: {
            noLocalRecordGuards:
                "Do not declare a local '{{name}}' helper. Import 'isRecord' and/or 'ensureRecordLike' from '@shared/utils/typeHelpers' instead.",
        },
        schema: [],
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: import("estree").Identifier; messageId: string; data: { name: string; }; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        // Allow declarations inside the canonical shared helper modules.
        if (
            normalizedFilename.endsWith("/shared/utils/typeHelpers.ts") ||
            normalizedFilename.endsWith("/shared/utils/typeGuards.ts")
        ) {
            return {};
        }

        // Ignore tests and generated artifacts.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/src/test/") ||
            normalizedFilename.includes("/shared/test/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const bannedNames = new Set([
            "isObjectRecord",
            "toRecord",
            "asRecord",
            "isRecordLike",
        ]);

        /** @param {import("estree").Identifier} identifier */
        const reportIdentifier = (identifier) => {
            if (!bannedNames.has(identifier.name)) {
                return;
            }

            context.report({
                node: identifier,
                messageId: "noLocalRecordGuards",
                data: {
                    name: identifier.name,
                },
            });
        };

        return {
            /**
             * @param {{ id: import("estree").Identifier; }} node
             */
            FunctionDeclaration(node) {
                if (node.id?.type === "Identifier") {
                    reportIdentifier(node.id);
                }
            },

            /**
             * @param {{ id: import("estree").Identifier; }} node
             */
            VariableDeclarator(node) {
                if (node.id?.type === "Identifier") {
                    reportIdentifier(node.id);
                }
            },
        };
    },
};

const noLocalErrorNormalizersRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow local error-normalizer helper declarations (use shared errorHandling utilities instead)",
            recommended: true,
        },
        messages: {
            noLocalErrorNormalizers:
                "Do not declare a local '{{name}}' helper. Import it from '@shared/utils/errorHandling' instead.",
        },
        schema: [],
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: import("estree").Identifier; messageId: string; data: { name: string; }; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        // Allow declarations inside the canonical shared helper module.
        if (normalizedFilename.endsWith("/shared/utils/errorHandling.ts")) {
            return {};
        }

        // Ignore tests and generated artifacts.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/src/test/") ||
            normalizedFilename.includes("/shared/test/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const bannedNames = new Set(["ensureError", "normalizeError"]);

        /** @param {import("estree").Identifier} identifier */
        const reportIdentifier = (identifier) => {
            if (!bannedNames.has(identifier.name)) {
                return;
            }

            context.report({
                node: identifier,
                messageId: "noLocalErrorNormalizers",
                data: {
                    name: identifier.name,
                },
            });
        };

        return {
            /**
             * @param {{ id: import("estree").Identifier; }} node
             */
            FunctionDeclaration(node) {
                if (node.id?.type === "Identifier") {
                    reportIdentifier(node.id);
                }
            },

            /**
             * @param {{ id: import("estree").Identifier; }} node
             */
            VariableDeclarator(node) {
                if (node.id?.type === "Identifier") {
                    reportIdentifier(node.id);
                }
            },
        };
    },
};

/**
 * ESLint rule disallowing the RegExp `v` flag.
 *
 * @remarks
 * The `v` flag is still experimental and can cause runtime SyntaxErrors
 * depending on runtime/toolchain.
 */
const noRegexpVFlagRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow RegExp literals using the experimental 'v' flag",
            recommended: false,
        },
        schema: [],
        messages: {
            disallowed:
                "RegExp flag 'v' is not allowed. Use 'u'/'gu' or rewrite the regex.",
        },
    },

    /**
     * @param {{ report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        return {
            /**
             * @param {{regex: any}} node
             */
            Literal(node) {
                const regex = node?.regex;
                if (!regex || typeof regex.flags !== "string") {
                    return;
                }

                if (regex.flags.includes("v")) {
                    context.report({
                        node,
                        messageId: "disallowed",
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule disallowing local helper definitions by identifier name.
 *
 * @remarks
 * Used as a configurable drift guard to prevent reintroducing duplicated helper
 * functions/variables across modules.
 */
const noLocalIdentifiersRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow defining local helper identifiers that should be imported from shared utilities",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    banned: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                name: { type: "string", minLength: 1 },
                                message: { type: "string" },
                                kinds: {
                                    type: "array",
                                    items: {
                                        enum: ["function", "variable"],
                                    },
                                },
                            },
                            required: ["name"],
                        },
                    },
                },
            },
        ],
        messages: {
            banned: "Local definition of '{{name}}' is not allowed. {{details}}",
        },
    },

    /**
     * @param {{ options: any[]; report: (arg0: { node: any; messageId: string; data: { name: any; details: any; } | { name: any; details: any; }; }) => void; }} context
     */
    create(context) {
        const option = context.options?.[0];
        const banned = Array.isArray(option?.banned) ? option.banned : [];
        const bannedByName = new Map(
            banned.map((/** @type {{name: any}} */ entry) => [entry.name, entry])
        );

        const shouldReport = (/** @type {{kinds: any}} */ entry, /** @type {string} */ kind) => {
            const kinds = entry.kinds;
            return !Array.isArray(kinds) || kinds.includes(kind);
        };

        const detailsFor = (/** @type {{message: string | any[]}} */ entry) =>
            typeof entry.message === "string" && entry.message.length > 0
                ? entry.message
                : "Import and reuse the shared helper instead.";

        return {
            /**
             * @param {{id: any}} node
             */
            FunctionDeclaration(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                const entry = bannedByName.get(id.name);
                if (!entry || !shouldReport(entry, "function")) {
                    return;
                }

                context.report({
                    node: id,
                    messageId: "banned",
                    data: {
                        name: id.name,
                        details: detailsFor(entry),
                    },
                });
            },

            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                const entry = bannedByName.get(id.name);
                if (!entry || !shouldReport(entry, "variable")) {
                    return;
                }

                context.report({
                    node: id,
                    messageId: "banned",
                    data: {
                        name: id.name,
                        details: detailsFor(entry),
                    },
                });
            },
        };
    },
};

/**
 * ESLint rule preventing redeclaration of canonical shared contract interfaces.
 *
 * @remarks
 * Some DTO/contract interfaces must remain single-sourced in `@shared` to avoid
 * type drift between renderer/electron layers. This rule prevents accidentally
 * reintroducing local copies.
 */
const noRedeclareSharedContractInterfacesRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow redeclaring shared contract interfaces that must be imported from @shared",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    names: {
                        type: "array",
                        items: { type: "string", minLength: 1 },
                    },
                },
            },
        ],
        messages: {
            redeclare:
                'Do not redeclare the shared interface "{{name}}". Import it from @shared instead.',
        },
    },

    /**
     * @param {{ options: any[]; report: (arg0: { node: any; messageId: string; data: { name: any; }; }) => void; }} context
     */
    create(context) {
        const option = context.options?.[0];
        const configuredNames = Array.isArray(option?.names)
            ? option.names
            : [];

        const bannedNames = new Set([
            // Default allowlist of canonical contracts.
            "MonitorTypeOption",
            ...configuredNames,
        ]);

        return {
            /**
             * @param {{id: any}} node
             */
            TSInterfaceDeclaration(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                if (!bannedNames.has(id.name)) {
                    return;
                }

                context.report({
                    node: id,
                    messageId: "redeclare",
                    data: {
                        name: id.name,
                    },
                });
            },
        };
    },
};

/**
 * Drift guard: disallow local `hasAsciiControlCharacters` implementations in
 * Electron services.
 */
const electronNoLocalStringSafetyHelpersRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow local string-safety helper implementations in electron/services",
            recommended: false,
        },
        schema: [],
        messages: {
            banned: "Use hasAsciiControlCharacters from shared/utils/stringSafety.ts instead of defining local implementations.",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/services/`)) {
            return {};
        }

        // Allowed source of truth.
        if (filename.endsWith("/electron/services/sync/syncEngineUtils.ts")) {
            return {};
        }

        const reportIfNameMatches = (/** @type {{type: string, name: string}} */ id) => {
            if (!id || id.type !== "Identifier") {
                return;
            }
            if (id.name !== "hasAsciiControlCharacters") {
                return;
            }
            context.report({
                node: id,
                messageId: "banned",
            });
        };

        return {
            /**
             * @param {{id: any}} node
             */
            FunctionDeclaration(node) {
                reportIfNameMatches(node?.id);
            },

            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                reportIfNameMatches(node?.id);
            },
        };
    },
};

/**
 * Drift guard: disallow ad-hoc error code suffix formatting in
 * electron/services.
 *
 * @remarks
 * Targets patterns like: `code ? \` (${code})` : ""`.
 */
const electronNoAdHocErrorCodeSuffixRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Prefer getElectronErrorCodeSuffix over ad-hoc error code suffix formatting",
            recommended: false,
        },
        schema: [],
        messages: {
            banned: "Use getElectronErrorCodeSuffix from electron/services/shell/openExternalUtils.ts instead of ad-hoc error code suffix formatting.",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/services/`)) {
            return {};
        }

        // Allowed source of truth.
        if (
            filename.endsWith("/electron/services/shell/openExternalUtils.ts")
        ) {
            return {};
        }

        const isEmptyStringLiteral = (/** @type {{type: string, value: string}} */ node) =>
            node?.type === "Literal" && node.value === "";

        const isCodeSuffixTemplate = (/** @type {{type: string, expressions: any, quasis: any}} */ node) => {
            if (!node || node.type !== "TemplateLiteral") {
                return false;
            }

            const hasCodeIdentifier = (node.expressions ?? []).some(
                (/** @type {{type: string, name: string}} */ expr) => expr?.type === "Identifier" && expr.name === "code"
            );

            if (!hasCodeIdentifier) {
                return false;
            }

            return (node.quasis ?? []).some((/** @type {{value: {raw: any}}} */ quasi) => {
                const raw = quasi?.value?.raw;
                return typeof raw === "string" && raw.includes(" (");
            });
        };

        return {
            /**
             * @param {{consequent: any, alternate: any}} node
             */
            ConditionalExpression(node) {
                const consequent = node?.consequent;
                const alternate = node?.alternate;

                const matches =
                    (isCodeSuffixTemplate(consequent) &&
                        isEmptyStringLiteral(alternate)) ||
                    (isCodeSuffixTemplate(alternate) &&
                        isEmptyStringLiteral(consequent));

                if (!matches) {
                    return;
                }

                context.report({
                    node,
                    messageId: "banned",
                });
            },
        };
    },
};

/**
 * Drift guard: disallow local `isAsciiDigits` implementations in
 * electron/services/sync.
 */
const electronSyncNoLocalAsciiDigitsRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow local isAsciiDigits implementations in electron/services/sync",
            recommended: false,
        },
        schema: [],
        messages: {
            banned: "Use isAsciiDigits from electron/services/sync/syncEngineUtils.ts (avoid duplicated validation policies).",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/services/sync/`)) {
            return {};
        }

        // Allowed source of truth.
        if (filename.endsWith("/electron/services/sync/syncEngineUtils.ts")) {
            return {};
        }

        const reportIfNameMatches = (/** @type {{type: string, name: string}} */ id) => {
            if (!id || id.type !== "Identifier") {
                return;
            }
            if (id.name !== "isAsciiDigits") {
                return;
            }
            context.report({
                node: id,
                messageId: "banned",
            });
        };

        return {
            /**
             * @param {{id: any}} node
             */
            FunctionDeclaration(node) {
                reportIfNameMatches(node?.id);
            },

            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                reportIfNameMatches(node?.id);
            },
        };
    },
};

/**
 * Drift guard preset for electron/services/cloud/providers.
 *
 * @remarks
 * Collapses the legacy `no-call-identifiers` + `no-local-identifiers` config
 * blocks into a single rule.
 */
const electronCloudProvidersDriftGuardsRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Prevent drift in electron/services/cloud/providers by banning known duplicated helpers",
            recommended: false,
        },
        schema: [],
        messages: {
            bannedCall:
                "Use validateOAuthAuthorizeUrl (OAuth flows) or validateExternalOpenUrlCandidate (general external navigation) instead of calling isAllowedExternalOpenUrl directly.",
            bannedLocal:
                "Local definition of '{{name}}' is not allowed. {{details}}",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; data?: { name: any; details: string; }; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (
            !filename.startsWith(
                `${NORMALIZED_ELECTRON_DIR}/services/cloud/providers/`
            )
        ) {
            return {};
        }

        const localBans = new Map([
            [
                "tryParseJsonRecord",
                "Use tryParseJsonRecord from shared/utils/jsonSafety.ts instead of defining local JSON parsing helpers.",
            ],
            [
                "isPlainObject",
                "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
            ],
        ]);

        const reportLocal = (/** @type {{type: string, name: string}} */ id) => {
            if (!id || id.type !== "Identifier") {
                return;
            }

            const details = localBans.get(id.name);
            if (!details) {
                return;
            }

            context.report({
                node: id,
                messageId: "bannedLocal",
                data: {
                    name: id.name,
                    details,
                },
            });
        };

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = node?.callee;
                if (!callee || callee.type !== "Identifier") {
                    return;
                }

                if (callee.name !== "isAllowedExternalOpenUrl") {
                    return;
                }

                context.report({
                    node: callee,
                    messageId: "bannedCall",
                });
            },

            /**
             * @param {{id: any}} node
             */
            FunctionDeclaration(node) {
                reportLocal(node?.id);
            },

            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                reportLocal(node?.id);
            },
        };
    },
};

/**
 * Drift guard: disallow local `isPlainObject` variable definitions inside
 * shared/types.
 */
const sharedTypesNoLocalIsPlainObjectRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow local isPlainObject definitions in shared/types",
            recommended: false,
        },
        schema: [],
        messages: {
            banned: "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());
        if (!filename.startsWith(`${NORMALIZED_SHARED_DIR}/types/`)) {
            return {};
        }

        return {
            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                if (id.name !== "isPlainObject") {
                    return;
                }

                context.report({
                    node: id,
                    messageId: "banned",
                });
            },
        };
    },
};

/**
 * Drift guard: disallow local `isPlainObject` variable definitions inside
 * electron/preload.
 */
const preloadNoLocalIsPlainObjectRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow local isPlainObject definitions in electron/preload",
            recommended: false,
        },
        schema: [],
        messages: {
            banned: "Use isObject from shared/utils/typeGuards.ts instead of defining local isPlainObject helpers.",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());
        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/preload/`)) {
            return {};
        }

        return {
            /**
             * @param {{id: any}} node
             */
            VariableDeclarator(node) {
                const id = node?.id;
                if (!id || id.type !== "Identifier") {
                    return;
                }

                if (id.name !== "isPlainObject") {
                    return;
                }

                context.report({
                    node: id,
                    messageId: "banned",
                });
            },
        };
    },
};

/**
 * Vitest safety guard.
 *
 * @remarks
 * Vitest implements `mockReturnValue*` as `mockImplementation(() => value)`.
 * Arrow functions are not constructible, so mocking a class/constructor this
 * way can crash code paths that call `new` on the mocked symbol:
 *
 * `() => value is not a constructor`
 *
 * This rule flags `mockReturnValue` / `mockReturnValueOnce` when used on a
 * likely-constructible mock target (PascalCase identifier).
 */
const testNoMockReturnValueConstructorsRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow mockReturnValue/mockReturnValueOnce on likely constructors (use constructible helper/mockImplementation(function...))",
            recommended: false,
        },
        schema: [],
        messages: {
            banned: "Avoid {{method}} on '{{name}}'. Vitest implements it with an arrow function, which cannot be used with `new`. Prefer {{replacement}} instead.",
        },
    },

    /**
     * @param {{ report: (arg0: { node: any; messageId: string; data: { method: any; name: any; replacement: string; }; }) => void; }} context
     */
    create(context) {
        const unwrapExpression = (/** @type {any} */ node) => {
            let current = node;
            // Unwrap TS wrappers commonly produced by @typescript-eslint parser
            // and optional chaining wrappers.

            while (true) {
                if (!current) {
                    return current;
                }

                if (current.type === "ChainExpression") {
                    current = current.expression;
                    continue;
                }

                if (current.type === "TSAsExpression") {
                    current = current.expression;
                    continue;
                }

                if (current.type === "TSTypeAssertion") {
                    current = current.expression;
                    continue;
                }

                if (current.type === "TSNonNullExpression") {
                    current = current.expression;
                    continue;
                }

                return current;
            }
        };

        const isPascalCase = (/** @type {string} */ name) =>
            typeof name === "string" && /^[A-Z][A-Za-z0-9]*$/.test(name);

        const isViMockedCall = (/** @type {{type: string, callee: any}} */ node) => {
            if (!node || node.type !== "CallExpression") {
                return false;
            }

            const callee = unwrapExpression(node.callee);

            // vi.mocked(...)
            if (
                callee?.type === "MemberExpression" &&
                callee.object?.type === "Identifier" &&
                callee.object.name === "vi" &&
                callee.property?.type === "Identifier" &&
                callee.property.name === "mocked"
            ) {
                return true;
            }

            return false;
        };

        const extractMockTargetName = (/** @type {any} */ node) => {
            const unwrapped = unwrapExpression(node);
            if (!unwrapped) {
                return undefined;
            }

            if (unwrapped.type === "Identifier") {
                return unwrapped.name;
            }

            if (unwrapped.type === "MemberExpression") {
                // Prefer the property name (e.g. BrowserWindow.getAllWindows)
                if (unwrapped.property?.type === "Identifier") {
                    return unwrapped.property.name;
                }

                return undefined;
            }

            if (isViMockedCall(unwrapped)) {
                const arg = unwrapped.arguments?.[0];
                return extractMockTargetName(arg);
            }

            return undefined;
        };

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = unwrapExpression(node.callee);
                if (!callee || callee.type !== "MemberExpression") {
                    return;
                }

                if (callee.computed) {
                    return;
                }

                const property = callee.property;
                if (!property || property.type !== "Identifier") {
                    return;
                }

                const method = property.name;
                if (
                    method !== "mockReturnValue" &&
                    method !== "mockReturnValueOnce"
                ) {
                    return;
                }

                const targetName = extractMockTargetName(callee.object);
                if (!isPascalCase(targetName)) {
                    return;
                }

                context.report({
                    node: property,
                    messageId: "banned",
                    data: {
                        method,
                        name: targetName,
                        replacement:
                            method === "mockReturnValue"
                                ? "mockConstructableReturnValue(mock, value)"
                                : "mockConstructableReturnValueOnce(mock, value)",
                    },
                });
            },
        };
    },
};

/**
 * ESLint rule disallowing calling certain imported identifiers.
 */
const noCallIdentifiersRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow calling certain identifier functions directly",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                properties: {
                    banned: {
                        type: "array",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            properties: {
                                name: { type: "string", minLength: 1 },
                                message: { type: "string" },
                            },
                            required: ["name"],
                        },
                    },
                },
            },
        ],
        messages: {
            bannedCall:
                "Calling '{{name}}' directly is not allowed. {{details}}",
        },
    },

    /**
     * @param {{ options: any[]; report: (arg0: { node: any; messageId: string; data: { name: any; details: any; }; }) => void; }} context
     */
    create(context) {
        const option = context.options?.[0];
        const banned = Array.isArray(option?.banned) ? option.banned : [];
        const bannedByName = new Map(
            banned.map((/** @type {{name: any}} */ entry) => [entry.name, entry])
        );

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = node?.callee;
                if (!callee || callee.type !== "Identifier") {
                    return;
                }

                const entry = bannedByName.get(callee.name);
                if (!entry) {
                    return;
                }

                const details =
                    typeof entry.message === "string" &&
                    entry.message.length > 0
                        ? entry.message
                        : "Use the centralized helper instead.";

                context.report({
                    node: callee,
                    messageId: "bannedCall",
                    data: {
                        name: callee.name,
                        details,
                    },
                });
            },
        };
    },
};

/**
 * @param {{type: any, typeAnnotation: any, types: any, members: any}} typeNode
 */
function typeContainsCodeProperty(typeNode) {
    if (!typeNode || typeof typeNode !== "object") {
        return false;
    }

    switch (typeNode.type) {
        case "TSParenthesizedType":
            return typeContainsCodeProperty(typeNode.typeAnnotation);
        case "TSIntersectionType":
            return (typeNode.types ?? []).some(typeContainsCodeProperty);
        case "TSTypeLiteral":
            return (typeNode.members ?? []).some((/** @type {{type: string, key: {type: string, name: string}}} */ member) => {
                if (!member || member.type !== "TSPropertySignature") {
                    return false;
                }
                return (
                    member.key?.type === "Identifier" &&
                    member.key.name === "code"
                );
            });
        default:
            return false;
    }
}

/**
 * ESLint rule enforcing tryGetErrorCode() usage instead of `{ code?: unknown }`
 * type assertions.
 */
const preferTryGetErrorCodeRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Prefer tryGetErrorCode() over `{ code?: unknown }` type assertions",
            recommended: false,
        },
        schema: [],
        messages: {
            prefer: "Use tryGetErrorCode() from shared/utils/errorCodes.ts instead of asserting a `{ code?: unknown }` type.",
        },
    },

    /**
     * @param {{ report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const check = (/** @type {any} */ typeAnnotation) => {
            if (!typeAnnotation || !typeContainsCodeProperty(typeAnnotation)) {
                return;
            }

            context.report({
                node: typeAnnotation,
                messageId: "prefer",
            });
        };

        return {
            /**
             * @param {{typeAnnotation: any}} node
             */
            TSAsExpression(node) {
                check(node.typeAnnotation);
            },

            /**
             * @param {{typeAnnotation: any}} node
             */
            TSTypeAssertion(node) {
                check(node.typeAnnotation);
            },
        };
    },
};

/**
 * ESLint rule preventing a common logging footgun:
 *
 * `logger.error(message, { error: ensureError(error) })`.
 *
 * Should instead be:
 *
 * `logger.error(message, ensureError(error), { ...context })`.
 *
 * @remarks
 * The shared logger supports a dedicated error argument so stack/cause are
 * consistently formatted. Nesting an `Error` under `{ error: ... }` typically
 * loses stack/cause formatting and encourages inconsistent patterns.
 */
const loggerNoErrorInContextRule = {
    meta: {
        docs: {
            description:
                "Disallow passing Error objects via { error: ... } context to logger.error/warn; pass as the dedicated error argument instead",
            recommended: false,
        },
        messages: {
            avoidErrorContext:
                "Do not pass Error objects via { error: ... } when calling logger. Pass the Error as the dedicated error argument instead.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) &&
                !normalizedFilename.startsWith(`${NORMALIZED_SHARED_DIR}/`)) ||
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/")
        ) {
            return {};
        }

        const loggerObjectNames = new Set(["logger", "baseLogger"]);
        const loggerMethodNames = new Set(["error", "warn"]);
        const suspiciousErrorIdentifiers = new Set([
            "error",
            "err",
            "ensuredError",
            "normalizedError",
            "wrappedError",
            "loggingError",
        ]);

        /**
         * @param {{type: string, callee: {type: string, name: string}}} node
         */
        function isEnsureErrorCall(node) {
            if (!node || node.type !== "CallExpression") {
                return false;
            }

            if (node.callee.type === "Identifier") {
                return node.callee.name === "ensureError";
            }

            return false;
        }

        /**
         * @param {{type: string, callee: {type: string, name: string}, name: string}} node
         */
        function isSuspiciousErrorValue(node) {
            if (!node) {
                return false;
            }

            if (isEnsureErrorCall(node)) {
                return true;
            }

            if (
                node.type === "NewExpression" &&
                node.callee.type === "Identifier" &&
                node.callee.name === "Error"
            ) {
                return true;
            }

            if (node.type === "Identifier") {
                return suspiciousErrorIdentifiers.has(node.name);
            }

            return false;
        }

        /**
         * @param {{type: string, object: {type: string, name: string}, property: {type: string, name: string}}} callee
         */
        function isLoggerErrorOrWarnCall(callee) {
            if (!callee || callee.type !== "MemberExpression") {
                return false;
            }

            if (callee.object.type !== "Identifier") {
                return false;
            }

            if (!loggerObjectNames.has(callee.object.name)) {
                return false;
            }

            if (callee.property.type !== "Identifier") {
                return false;
            }

            return loggerMethodNames.has(callee.property.name);
        }

        /**
         * @param {{properties: any}} objectExpression
         */
        function getErrorPropertyFromObjectExpression(objectExpression) {
            for (const property of objectExpression.properties) {
                if (property.type !== "Property") {
                    continue;
                }

                if (property.computed) {
                    continue;
                }

                if (property.key.type !== "Identifier") {
                    continue;
                }

                if (property.key.name !== "error") {
                    continue;
                }

                return property;
            }

            return null;
        }

        return {
            /**
             * @param {{callee: any, arguments: any}} node
             */
            CallExpression(node) {
                if (!isLoggerErrorOrWarnCall(node.callee)) {
                    return;
                }

                for (const arg of node.arguments ?? []) {
                    if (!arg || arg.type !== "ObjectExpression") {
                        continue;
                    }

                    const errorProperty =
                        getErrorPropertyFromObjectExpression(arg);
                    if (!errorProperty) {
                        continue;
                    }

                    if (isSuspiciousErrorValue(errorProperty.value)) {
                        context.report({
                            messageId: "avoidErrorContext",
                            node: errorProperty,
                        });
                    }
                }
            },
        };
    },
};

/**
 * ESLint rule ensuring Zustand store busy flags are not left stuck `true`.
 *
 * @remarks
 * This rule is intentionally narrow:
 *
 * - It only targets `src/stores/**` (non-test) files.
 * - It only triggers on direct `set({ isX: true })` calls inside store actions.
 * - It requires a corresponding `set({ isX: false })` to appear inside a
 *   `finally` block in the same function.
 *
 * This avoids false positives for stores using different loading patterns
 * (e.g., operation maps) while still preventing the most common AI-agent bug:
 * setting a busy flag but forgetting to reset it.
 */
const storeActionsRequireFinallyResetRule = {
    meta: {
        docs: {
            description:
                "Require store busy flags (isX) set to true to be reset to false in a finally block",
            recommended: false,
        },
        messages: {
            missingFinallyReset:
                "Busy flag '{{flag}}' is set to true but is not reset to false inside a finally block in this action.",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => string; sourceCode: any; getSourceCode: () => any; report: (arg0: { data: { flag: any; }; messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/stores/`) ||
            normalizedFilename.includes("/src/test/") ||
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const visitorKeys = sourceCode.visitorKeys;

        /**
         * Extracts an object literal from a set() argument.
         *
         * Supports:
         *
         * - set({ ... })
         * - set(() => ({ ... }))
         * - set(() => { return { ... }; }).
         *
         * @param {unknown} argument
         *
         * @returns {import("@typescript-eslint/utils").TSESTree.ObjectExpression | null}
         */
        function getSetObjectExpression(argument) {
            if (!argument || typeof argument !== "object" || !("type" in argument)) {
                return null;
            }

            const node = /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                argument
            );

            if (node.type === "ObjectExpression") {
                return node;
            }

            if (node.type !== "ArrowFunctionExpression") {
                return null;
            }

            const body = node.body;
            if (body.type === "ObjectExpression") {
                return body;
            }

            if (body.type !== "BlockStatement") {
                return null;
            }

            for (const statement of body.body) {
                if (statement.type !== "ReturnStatement") {
                    continue;
                }

                const argumentNode = statement.argument;
                if (argumentNode?.type === "ObjectExpression") {
                    return argumentNode;
                }
            }

            return null;
        }

        /**
         * @param {unknown} node
         *
         * @returns {boolean | null}
         */
        function getBooleanLiteralValue(node) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return null;
            }

            if (node.type !== "Literal" || !("value" in node)) {
                return null;
            }

            return typeof node.value === "boolean" ? node.value : null;
        }

        /**
         * @param {unknown} property
         *
         * @returns {string | null}
         */
        function getPropertyName(property) {
            if (!property || typeof property !== "object") {
                return null;
            }

            if (!("computed" in property) || !("key" in property)) {
                return null;
            }

            if (property.computed) {
                return null;
            }

            const key = property.key;
            if (!key || typeof key !== "object" || !("type" in key)) {
                return null;
            }

            if (key.type === "Identifier" && "name" in key) {
                return typeof key.name === "string" ? key.name : null;
            }

            if (
                key.type === "Literal" &&
                "value" in key &&
                typeof key.value === "string"
            ) {
                return key.value;
            }

            return null;
        }

        /**
         * @param {unknown} node
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.CallExpression}
         */
        function isSetCall(node) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return false;
            }

            if (node.type !== "CallExpression" || !("callee" in node)) {
                return false;
            }

            const callee = node.callee;
            return Boolean(
                callee &&
                    typeof callee === "object" &&
                    "type" in callee &&
                    callee.type === "Identifier" &&
                    "name" in callee &&
                    callee.name === "set"
            );
        }

        /**
         * @param {unknown} node
         * @param {{flagsResetInFinally: Set<string>, flagsSet: Map<string, unknown>, inFinally: boolean, root: unknown}} state
         */
        function walk(node, state) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return;
            }

            const typedNode = /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                node
            );

            // Do not traverse into nested functions; each action function is
            // analyzed independently.
            if (
                state.root !== node &&
                (typedNode.type === "FunctionDeclaration" ||
                    typedNode.type === "FunctionExpression" ||
                    typedNode.type === "ArrowFunctionExpression")
            ) {
                return;
            }

            if (typedNode.type === "TryStatement") {
                walk(typedNode.block, state);
                if (typedNode.handler) {
                    walk(typedNode.handler, state);
                }
                if (typedNode.finalizer) {
                    walk(typedNode.finalizer, { ...state, inFinally: true });
                }
                return;
            }

            if (isSetCall(typedNode)) {
                const objectExpression = getSetObjectExpression(
                    typedNode.arguments?.[0]
                );

                if (objectExpression) {
                    for (const property of objectExpression.properties) {
                        if (property.type !== "Property") {
                            continue;
                        }

                        const name = getPropertyName(property);
                        if (!name || !name.startsWith("is")) {
                            continue;
                        }

                        const value = getBooleanLiteralValue(property.value);
                        if (value === true) {
                            if (!state.flagsSet.has(name)) {
                                state.flagsSet.set(name, typedNode);
                            }
                        }

                        if (state.inFinally && value === false) {
                            state.flagsResetInFinally.add(name);
                        }
                    }
                }
            }

            const keys = visitorKeys[typedNode.type] ?? [];
            for (const key of keys) {
                const value = /** @type {Record<string, unknown>} */ (
                    /** @type {unknown} */ (typedNode)
                )[key];
                if (!value) {
                    continue;
                }
                if (Array.isArray(value)) {
                    for (const child of value) {
                        walk(child, state);
                    }
                    continue;
                }
                walk(value, state);
            }
        }

        /**
         * @param {{body: any}} node
         */
        function analyzeFunction(node) {
            if (!node.body) {
                return;
            }

            const state = {
                flagsResetInFinally: new Set(),
                flagsSet: new Map(),
                inFinally: false,
                root: node,
            };

            walk(node.body, state);

            for (const [flag, reportNode] of state.flagsSet.entries()) {
                if (!state.flagsResetInFinally.has(flag)) {
                    context.report({
                        data: { flag },
                        messageId: "missingFinallyReset",
                        node: reportNode,
                    });
                }
            }
        }

        return {
            FunctionDeclaration: analyzeFunction,
            FunctionExpression: analyzeFunction,
            ArrowFunctionExpression: analyzeFunction,
        };
    },
};

/**
 * ESLint rule requiring caught `unknown` errors to be normalized before
 * accessing properties.
 *
 * @remarks
 * This is an AI guardrail: a common failure mode is `catch (error) {
 * logger.error(error.message) }` which is unsafe when catch variables are
 * `unknown` (as they should be under strict TypeScript).
 *
 * The rule only triggers when code directly accesses properties on the caught
 * identifier (e.g., `error.message`, `err.stack`, `error.name`). It does not
 * require normalization if the caught value is only passed around.
 *
 * Compliance can be achieved by calling `ensureError(error)` anywhere in the
 * catch block (typically assigning it to a local like `const safeError =
 * ensureError(error)`), and then using that normalized error.
 */
const requireEnsureErrorInCatchRule = {
    meta: {
        docs: {
            description:
                "Require ensureError() before accessing properties on caught errors",
            recommended: false,
        },
        messages: {
            requireEnsureError:
                "Caught error '{{name}}' is used with property access; normalize it first with ensureError({{name}}).",
        },
        schema: [],
        type: "problem",
    },

    /**
     * @param {{ getFilename: () => string; sourceCode: any; getSourceCode: () => any; report: (arg0: { data: { name: any; }; messageId: string; node: import("@typescript-eslint/utils").TSESTree.Node; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.includes("/src/") &&
                !normalizedFilename.includes("/electron/") &&
                !normalizedFilename.includes("/shared/"))
        ) {
            return {};
        }

        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const visitorKeys = sourceCode.visitorKeys;

        /**
         * @param {unknown} node
         * @param {string} caughtName
         */
        function isEnsureErrorCall(node, caughtName) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return false;
            }

            if (node.type !== "CallExpression") {
                return false;
            }

            const call = /** @type {import("@typescript-eslint/utils").TSESTree.CallExpression} */ (
                node
            );

            if (call.callee.type !== "Identifier") {
                return false;
            }

            if (call.callee.name !== "ensureError") {
                return false;
            }

            const firstArg = call.arguments?.[0];
            return Boolean(
                firstArg?.type === "Identifier" && firstArg.name === caughtName
            );
        }

        /**
         * @param {unknown} node
         * @param {string} caughtName
         *
         * @returns {node is import("@typescript-eslint/utils").TSESTree.MemberExpression}
         */
        function isDirectPropertyAccess(node, caughtName) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return false;
            }

            if (node.type !== "MemberExpression") {
                return false;
            }

            const member = /** @type {import("@typescript-eslint/utils").TSESTree.MemberExpression} */ (
                node
            );

            if (member.object.type !== "Identifier") {
                return false;
            }

            if (member.object.name !== caughtName) {
                return false;
            }

            // If computed, we cannot reliably reason about the property.
            return !member.computed;
        }

        /**
         * @typedef {{
         *   ensureErrorCall: boolean;
         *   firstPropertyAccess: import("@typescript-eslint/utils").TSESTree.MemberExpression | null;
         *   name: string;
         * }} EnsureErrorState
         */

        /**
         * @param {unknown} node
         * @param {EnsureErrorState} state
         */
        function walk(node, state) {
            if (!node || typeof node !== "object" || !("type" in node)) {
                return;
            }

            const typedNode = /** @type {import("@typescript-eslint/utils").TSESTree.Node} */ (
                node
            );

            if (
                !state.ensureErrorCall &&
                isEnsureErrorCall(typedNode, state.name)
            ) {
                state.ensureErrorCall = true;
            }

            if (
                !state.firstPropertyAccess &&
                isDirectPropertyAccess(typedNode, state.name)
            ) {
                state.firstPropertyAccess = typedNode;
            }

            const keys = visitorKeys[typedNode.type] ?? [];
            for (const key of keys) {
                const value = /** @type {Record<string, unknown>} */ (
                    /** @type {unknown} */ (typedNode)
                )[key];
                if (!value) {
                    continue;
                }
                if (Array.isArray(value)) {
                    for (const child of value) {
                        walk(child, state);
                    }
                    continue;
                }
                walk(value, state);
            }
        }

        return {
            /**
             * @param {{param: any, body: any}} node
             */
            CatchClause(node) {
                const param = node.param;
                if (!param || param.type !== "Identifier") {
                    return;
                }

                const caughtName = param.name;
                const state = /** @type {EnsureErrorState} */ ({
                    ensureErrorCall: false,
                    firstPropertyAccess: null,
                    name: caughtName,
                });

                walk(node.body, state);

                if (state.firstPropertyAccess && !state.ensureErrorCall) {
                    context.report({
                        data: { name: caughtName },
                        messageId: "requireEnsureError",
                        node: state.firstPropertyAccess,
                    });
                }
            },
        };
    },
};

/**
 * ESLint rule requiring Electron runtime code to use the centralized
 * `readProcessEnv()` helper instead of direct `process.env` reads.
 *
 * @remarks
 * This is primarily an AI guardrail: scattered env access tends to create
 * inconsistent parsing/validation and makes it easy to forget redaction or
 * default behavior.
 */
const electronPreferReadProcessEnvRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Prefer readProcessEnv() over direct process.env access in Electron runtime code",
            recommended: false,
        },
        messages: {
            preferReadProcessEnv:
                "Use readProcessEnv()/readBooleanEnv()/readNumberEnv() from electron/utils/environment instead of direct process.env access.",
        },
        schema: [],
    },

    /**
     * @param {{ getFilename: () => string; getSourceCode: () => { (): any; new (): any; getText: { (): any; new (): any; }; }; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (!normalizedFilename.includes("/electron/")) {
            return {};
        }

        // Allow centralized env helper to read process.env.
        if (normalizedFilename.endsWith("/electron/utils/environment.ts")) {
            return {};
        }

        // Ignore tests and test utilities.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const bannedPattern = /\bprocess\s*\.\s*env\b/gu;

        return {
            /**
             * @param {any} node
             */
            Program(node) {
                const text = context.getSourceCode().getText();
                if (!bannedPattern.test(text)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "preferReadProcessEnv",
                });
            },
        };
    },
};

/**
 * ESLint rule requiring standardized IPC handlers to include a validator.
 *
 * @remarks
 * Uptime Watcher deliberately uses request/response IPC with Zod validators.
 * When AI edits add new IPC handlers, a common failure mode is to register a
 * handler without validation.
 */
const electronIpcHandlerRequireValidatorRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Require registerStandardizedIpcHandler calls to include a validator argument",
            recommended: false,
        },
        messages: {
            missingValidator:
                "registerStandardizedIpcHandler must include a validator (third argument). Add the shared Zod validator for this channel.",
        },
        schema: [],
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (!normalizedFilename.includes("/electron/services/ipc/handlers/")) {
            return {};
        }

        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        /**
         * @param {unknown} arg
         */
        const isMissingValidatorArg = (arg) => {
            if (!arg || typeof arg !== "object" || !("type" in arg)) {
                return true;
            }

            // `null` validator is never valid.
            if (arg.type === "Literal" && "value" in arg && arg.value === null) {
                return true;
            }

            if (
                arg.type === "Identifier" &&
                "name" in arg &&
                arg.name === "undefined"
            ) {
                return true;
            }

            return false;
        };

        return {
            /**
             * @param {{callee: {type: string, name: string}, arguments: any[]}} node
             */
            CallExpression(node) {
                if (node.callee?.type !== "Identifier") {
                    return;
                }

                if (node.callee.name !== "registerStandardizedIpcHandler") {
                    return;
                }

                const validatorArg = node.arguments?.[2];
                if (isMissingValidatorArg(validatorArg)) {
                    context.report({
                        node: node.callee,
                        messageId: "missingValidator",
                    });
                }
            },
        };
    },
};

const noOneDriveRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow any OneDrive-related identifiers/strings to prevent reintroducing a removed provider",
            recommended: false,
        },
        messages: {
            noOneDrive:
                "OneDrive integration is intentionally not supported in this repository. Remove this reference.",
        },
        schema: [],
    },

    /**
     * @param {{ getFilename: () => string; getSourceCode: () => any; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        // Ignore tests to avoid creating busywork when describing previous state.
        if (
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/tests/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/src/test/") ||
            normalizedFilename.includes("/shared/test/") ||
            normalizedFilename.endsWith(".test.ts") ||
            normalizedFilename.endsWith(".test.tsx") ||
            normalizedFilename.endsWith(".spec.ts") ||
            normalizedFilename.endsWith(".spec.tsx")
        ) {
            return {};
        }

        const bannedPattern = /\bonedrive\b|\bone\s*drive\b/iu;

        return {
            /**
             * @param {any} node
             */
            Program(node) {
                const sourceCode = context.getSourceCode();
                const text = sourceCode.getText();
                if (!bannedPattern.test(text)) {
                    return;
                }

                context.report({
                    node,
                    messageId: "noOneDrive",
                });
            },
        };
    },
};

const uptimeWatcherPlugin = {
    rules: {
        "monitor-fallback-consistency": monitorFallbackConsistencyRule,
        "electron-no-console": electronNoConsoleRule,
        "electron-prefer-readProcessEnv": electronPreferReadProcessEnvRule,
        "electron-ipc-handler-require-validator":
            electronIpcHandlerRequireValidatorRule,
        "electron-no-direct-ipc-handle": electronNoDirectIpcHandleRule,
        "electron-no-direct-ipcMain-import": electronNoDirectIpcMainImportRule,
        "electron-no-inline-ipc-channel-literal":
            electronNoInlineIpcChannelLiteralRule,
        "electron-preload-no-inline-ipc-channel-constant":
            electronPreloadNoInlineIpcChannelConstantRule,
        "electron-no-inline-ipc-channel-type-argument":
            electronNoInlineIpcChannelTypeArgumentRule,
        "electron-preload-no-direct-ipcRenderer-usage":
            electronPreloadNoDirectIpcRendererUsageRule,
        "no-inline-ipc-channel-type-literals":
            noInlineIpcChannelTypeLiteralsRule,
        "electron-no-direct-ipc-handler-wrappers":
            electronNoDirectIpcHandlerWrappersRule,
        "electron-no-renderer-import": electronNoRendererImportRule,
        "renderer-no-electron-import": rendererNoElectronImportRule,
        "renderer-no-browser-dialogs": rendererNoBrowserDialogsRule,
        "renderer-no-window-open": rendererNoWindowOpenRule,
        "renderer-no-direct-preload-bridge": rendererNoDirectPreloadBridgeRule,
        "renderer-no-preload-bridge-writes": rendererNoPreloadBridgeWritesRule,
        "renderer-no-direct-electron-log": rendererNoDirectElectronLogRule,
        "renderer-no-import-internal-service-utils":
            rendererNoImportInternalServiceUtilsRule,
        "renderer-no-direct-networking": rendererNoDirectNetworkingRule,
        "renderer-no-ipcRenderer-usage": rendererNoIpcRendererUsageRule,
        "renderer-no-direct-bridge-readiness":
            rendererNoDirectBridgeReadinessRule,
        "tsdoc-no-console-example": tsdocNoConsoleExampleRule,
        "shared-no-outside-imports": sharedNoOutsideImportsRule,
        "prefer-shared-alias": preferSharedAliasRule,
        "prefer-app-alias": preferAppAliasRule,
        "no-deprecated-exports": noDeprecatedExportsRule,
        "no-local-record-guards": noLocalRecordGuardsRule,
        "no-local-error-normalizers": noLocalErrorNormalizersRule,
        "no-regexp-v-flag": noRegexpVFlagRule,
        "no-local-identifiers": noLocalIdentifiersRule,
        "no-call-identifiers": noCallIdentifiersRule,
        "no-redeclare-shared-contract-interfaces":
            noRedeclareSharedContractInterfacesRule,
        "electron-no-local-string-safety-helpers":
            electronNoLocalStringSafetyHelpersRule,
        "electron-no-ad-hoc-error-code-suffix":
            electronNoAdHocErrorCodeSuffixRule,
        "electron-sync-no-local-ascii-digits":
            electronSyncNoLocalAsciiDigitsRule,
        "electron-cloud-providers-drift-guards":
            electronCloudProvidersDriftGuardsRule,
        "shared-types-no-local-isPlainObject":
            sharedTypesNoLocalIsPlainObjectRule,
        "preload-no-local-isPlainObject": preloadNoLocalIsPlainObjectRule,
        "test-no-mock-return-value-constructors":
            testNoMockReturnValueConstructorsRule,
        "prefer-try-get-error-code": preferTryGetErrorCodeRule,
        "logger-no-error-in-context": loggerNoErrorInContextRule,
        "store-actions-require-finally-reset":
            storeActionsRequireFinallyResetRule,
        "require-ensureError-in-catch": requireEnsureErrorInCatchRule,
        "no-onedrive": noOneDriveRule,
    },
};

export default uptimeWatcherPlugin;
