/**
 * @file Rule: electron-cloud-providers-drift-guards
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * Drift guard: prevent ad-hoc cloud provider behavior from drifting.
 */
export const electronCloudProvidersDriftGuardsRule = {
    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; data?: any; }) => void; }} context
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

        // Allowed source of truth.
        if (
            filename.endsWith(
                "/electron/services/cloud/providers/openExternal/openExternalAllowedUrls.ts"
            )
        ) {
            return {};
        }

        const bannedLocals = new Set([
            "buildAllowedExternalOpenUrlRegexes",
            "isAllowedExternalOpenUrl",
        ]),

         reportLocal = (/** @type {{type: string, name: string}} */ id) => {
            if (!id || id.type !== "Identifier") {
                return;
            }

            if (!bannedLocals.has(id.name)) {
                return;
            }

            context.report({
                data: { name: id.name },
                messageId: "bannedLocal",
                node: id,
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
                    messageId: "bannedCall",
                    node: callee,
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

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow ad-hoc cloud provider drift helpers and calls in electron/services/cloud/providers",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-cloud-providers-drift-guards.md",
        },
        schema: [],
        messages: {
            bannedLocal:
                "Do not define local helper '{{name}}' here. Use the centralized allowlist/utility implementation.",
            bannedCall:
                "Do not call isAllowedExternalOpenUrl here. Use the centralized provider allowlist utilities.",
        },
    },
};
