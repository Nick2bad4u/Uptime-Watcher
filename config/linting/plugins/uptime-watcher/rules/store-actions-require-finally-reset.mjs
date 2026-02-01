/**
 * @file Rule: store-actions-require-finally-reset
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule ensuring Zustand store busy flags are not left stuck `true`.
 *
 * @remarks
 * This rule is intentionally narrow:
 *
 * - It only targets `src/stores/**` (non-test) files.
 * - It only triggers on direct `set({ isX: true })` calls inside store
 * actions. - It requires a corresponding `set({ isX: false })` to appear
 * inside a
 *   `finally` block in the same function.
 */
export const storeActionsRequireFinallyResetRule = {
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

        const sourceCode = context.sourceCode ?? context.getSourceCode(),
         {visitorKeys} = sourceCode;

        /**
         * Extracts an object literal from a set() argument.
         *
         * Supports:
         * - set({ ... })
         * - set(() => ({ ... }))
         * - set(() => { return { ... }; })
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

            const {body} = node;
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

            const {key} = property;
            if (!key || typeof key !== "object" || !("type" in key)) {
                return null;
            }

            if (key.type === "Identifier" && "name" in key) {
                return typeof key.name === "string" ? key.name : null;
            }

            if (key.type === "Literal" && "value" in key && typeof key.value === "string") {
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

            const {callee} = node;
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
            // Analyzed independently.
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
                        if (value === true && !state.flagsSet.has(name)) {
                                state.flagsSet.set(name, typedNode);
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
            ArrowFunctionExpression: analyzeFunction,
            FunctionDeclaration: analyzeFunction,
            FunctionExpression: analyzeFunction,
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require store busy flags (isX) set to true to be reset to false in a finally block",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/store-actions-require-finally-reset.md",
        },
        schema: [],
        messages: {
            missingFinallyReset:
                "Busy flag '{{flag}}' is set to true but is not reset to false inside a finally block in this action.",
        },
    },
};
