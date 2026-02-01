/**
 * @file Rule: no-local-identifiers
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal ESLint
 * plugin modular and easier to maintain.
 */

/**
 * ESLint rule disallowing local helper definitions by identifier name.
 *
 * @remarks
 * Used as a configurable drift guard to prevent reintroducing duplicated helper
 * functions/variables across modules.
 */
export const noLocalIdentifiersRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow defining local helper identifiers that should be imported from shared utilities",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#no-local-identifiers",
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

        const shouldReport = (
            /** @type {{kinds: any}} */ entry,
            /** @type {string} */ kind
        ) => {
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
