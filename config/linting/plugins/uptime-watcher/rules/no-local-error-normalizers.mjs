/**
 * @file Rule: no-local-error-normalizers
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 */

import { normalizePath } from "../_internal/path-utils.mjs";

/**
 * ESLint rule disallowing local error-normalizer helper declarations.
 */
export const noLocalErrorNormalizersRule = {
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

        const bannedNames = new Set(["ensureError", "normalizeError"]),

        /** @param {import("estree").Identifier} identifier */
         reportIdentifier = (identifier) => {
            if (!bannedNames.has(identifier.name)) {
                return;
            }

            context.report({
                data: {
                    name: identifier.name,
                },
                messageId: "noLocalErrorNormalizers",
                node: identifier,
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

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow local error-normalizer helper declarations (use shared errorHandling utilities instead)",
            recommended: true,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-local-error-normalizers.md",
        },
        schema: [],
        messages: {
            noLocalErrorNormalizers:
                "Do not declare a local '{{name}}' helper. Import it from '@shared/utils/errorHandling' instead.",
        },
    },
};
