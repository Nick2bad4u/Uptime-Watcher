/**
 * @file Rule: renderer-no-direct-preload-bridge
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

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
export const rendererNoDirectPreloadBridgeRule = {
    /**
     * @param {{ getFilename: () => any; report: (arg0: { data: { owner: string; }; messageId: string; node: any; }) => void; }} context
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
            const {property} = member;
            if (member.computed) {
                if (property.type === "Literal" && property.value === "electronAPI") {
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

            const {object} = member;
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
                const innerObject = object.object,
                 innerProperty = object.property;
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

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow direct window.electronAPI usage outside the IPC service helper utilities.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-direct-preload-bridge.md",
        },
        schema: [],
        messages: {
            avoidDirectBridge:
                "Do not access {{owner}}.electronAPI directly. Use the established src/services/*Service wrappers (via getIpcServiceHelpers) instead.",
        },
    },
};
