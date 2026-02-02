/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: no-local-record-guards
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule disallowing local record-guard helper declarations.
 */
export const noLocalRecordGuardsRule = {
    /**
     * @param {{
     *     getFilename: () => string;
     *     report: (arg0: {
     *         node: import("estree").Identifier;
     *         messageId: string;
     *         data: { name: string };
     *     }) => void;
     * }} context
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
            "asRecord",
            "isObjectRecord",
            "isRecordLike",
            "toRecord",
        ]);

        /**
         * @param {import("estree").Identifier} identifier
         */
        const reportIdentifier = (identifier) => {
            if (!bannedNames.has(identifier.name)) {
                return;
            }

            context.report({
                data: {
                    name: identifier.name,
                },
                messageId: "noLocalRecordGuards",
                node: identifier,
            });
        };

        return {
            /**
             * @param {{ id: import("estree").Identifier }} node
             */
            FunctionDeclaration(node) {
                if (node.id?.type === "Identifier") {
                    reportIdentifier(node.id);
                }
            },

            /**
             * @param {{ id: import("estree").Identifier }} node
             */
            VariableDeclarator(node) {
                if (node.id?.type === "Identifier") {
                    reportIdentifier(node.id);
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow local record-guard helper declarations (use shared type helpers instead)",
            recommended: true,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-local-record-guards.md",
        },
        schema: [],
        messages: {
            noLocalRecordGuards:
                "Do not declare a local '{{name}}' helper. Import 'isRecord' and/or 'ensureRecordLike' from '@shared/utils/typeHelpers' instead.",
        },
    },
};
