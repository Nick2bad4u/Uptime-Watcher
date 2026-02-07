/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: renderer-no-direct-networking
 */

import {
    getContextFilename,
    getContextSourceCode,
} from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing direct networking calls from UI code.
 *
 * @remarks
 * Renderer code should not scatter `fetch`/`axios` calls throughout components
 * and hooks. If networking is required in the renderer, centralize it in the
 * service layer (src/services/**) so callers share retry, logging, caching, and
 * error normalization.
 */
export const rendererNoDirectNetworkingRule = {
    /**
     * @param {{
     *     sourceCode: any;
     *     getSourceCode: () => any;
     *     getFilename: () => any;
     *     report: (arg0: {
     *         data:
     *             | { api: string }
     *             | { api: string }
     *             | { api: string }
     *             | {
     *                   api: string;
     *               };
     *         messageId: string;
     *         node: any;
     *     }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context),
            normalizedFilename = normalizePath(rawFilename),
            sourceCode = getContextSourceCode(context);

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
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const { callee } = node;

                // Fetch(...)
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

                // Axios(...)
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

                // Axios.get(...)
                if (
                    callee.type === "MemberExpression" &&
                    !callee.computed &&
                    callee.object.type === "Identifier" &&
                    axiosLocalNames.has(callee.object.name)
                ) {
                    context.report({
                        data: { api: "axios" },
                        messageId: "noDirectNetworking",
                        node: callee,
                    });
                }
            },

            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    node.source.value !== "axios"
                ) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    // Default import: import axios from "axios"
                    if (specifier.type === "ImportDefaultSpecifier") {
                        axiosLocalNames.add(specifier.local.name);
                        continue;
                    }

                    // Namespace import: import * as axios from "axios"
                    if (specifier.type === "ImportNamespaceSpecifier") {
                        axiosLocalNames.add(specifier.local.name);
                        continue;
                    }

                    // Named import: import { Axios } from "axios" (rare)
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
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow direct fetch/axios usage outside the renderer service layer.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/renderer-no-direct-networking.md",
        },
        schema: [],
        messages: {
            noDirectNetworking:
                "Do not perform direct networking ({{api}}) here. Centralize networking in src/services/* (or Electron) to avoid duplicated codepaths.",
        },
    },
};
