/**
 * @file Rule: renderer-no-preload-bridge-writes
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing assignments/mutations of `window.electronAPI` in
 * renderer production code.
 *
 * @remarks
 * Only tests/mocks should ever define or overwrite the preload bridge.
 */
export const rendererNoPreloadBridgeWritesRule = {
    /**
     * @param {{ getFilename: () => any; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const rawFilename = context.getFilename(),
         normalizedFilename = normalizePath(rawFilename);

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
                const {object} = node.left;
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
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                // Object.defineProperty(window, "electronAPI", ...)
                if (node.callee.type !== "MemberExpression" || node.callee.computed) {
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
                            propertyName.quasis[0]?.value?.cooked === "electronAPI"))
                ) {
                    context.report({
                        messageId: "noBridgeWrites",
                        node,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow mutating window.electronAPI in renderer code (non-test).",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-preload-bridge-writes.md",
        },
        schema: [],
        messages: {
            noBridgeWrites:
                "Do not assign/define window.electronAPI in application code. Preload owns the bridge; renderer should only read it via services.",
        },
    },
};
