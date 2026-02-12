/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: no-local-identifiers
 */

/**
 * ESLint rule disallowing local helper definitions by identifier name.
 *
 * @remarks
 * Used as a configurable drift guard to prevent reintroducing duplicated helper
 * functions/variables across modules.
 */
export const noLocalIdentifiersRule = {
    /**
     * @param {{
     *     options: any[];
     *     report: (arg0: {
     *         node: any;
     *         messageId: string;
     *         data: { name: any; details: any } | { name: any; details: any };
     *     }) => void;
     * }} context
     */
    create(context) {
        const option = context.options?.[0],
            banned = Array.isArray(option?.banned) ? option.banned : [],
            bannedByName = new Map(
                banned.map((/** @type {{ name: any }} */ entry) => [
                    entry.name,
                    entry,
                ])
            ),
            detailsFor = (/** @type {{ message: string | any[] }} */ entry) =>
                typeof entry.message === "string" && entry.message.length > 0
                    ? entry.message
                    : "Import and reuse the shared helper instead.",
            shouldReport = (
                /** @type {{ kinds: any }} */ entry,
                /** @type {string} */ kind
            ) => {
                const { kinds } = entry;
                return !Array.isArray(kinds) || kinds.includes(kind);
            };

        return {
            /**
             * @param {{ id: any }} node
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
                    data: {
                        details: detailsFor(entry),
                        name: id.name,
                    },
                    messageId: "banned",
                    node: id,
                });
            },

            /**
             * @param {{ id: any }} node
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
                    data: {
                        details: detailsFor(entry),
                        name: id.name,
                    },
                    messageId: "banned",
                    node: id,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow defining local helper identifiers that should be imported from shared utilities",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-local-identifiers.md",
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                description:
                    "Configuration for banned local identifier definitions (functions and/or variables).",
                properties: {
                    banned: {
                        type: "array",
                        description:
                            "List of identifier names that must not be defined locally.",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            description: "A single banned identifier entry.",
                            properties: {
                                name: {
                                    type: "string",
                                    minLength: 1,
                                    description:
                                        "Identifier name to ban from local declaration.",
                                },
                                message: {
                                    type: "string",
                                    description:
                                        "Optional guidance shown in the lint error (e.g., what module to import from).",
                                },
                                kinds: {
                                    type: "array",
                                    description:
                                        "Restrict this entry to specific declaration kinds.",
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
        defaultOptions: [{ banned: [] }],
        messages: {
            banned: "Local definition of '{{name}}' is not allowed. {{details}}",
        },
    },
};
