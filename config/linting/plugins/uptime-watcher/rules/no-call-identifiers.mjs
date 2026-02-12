/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: no-call-identifiers
 */

/**
 * ESLint rule disallowing calls to identifiers by name.
 */
export const noCallIdentifiersRule = {
    /**
     * @param {{
     *     options: any[];
     *     report: (arg0: {
     *         node: any;
     *         messageId: string;
     *         data: { name: any; details: any };
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
                    : "Call the shared helper instead.";

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                if (node.callee.type === "Identifier") {
                    const entry = bannedByName.get(node.callee.name);
                    if (!entry) {
                        return;
                    }

                    context.report({
                        data: {
                            details: detailsFor(entry),
                            name: node.callee.name,
                        },
                        messageId: "bannedCall",
                        node: node.callee,
                    });
                }

                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.property.type === "Identifier"
                ) {
                    const entry = bannedByName.get(node.callee.property.name);
                    if (!entry) {
                        return;
                    }

                    context.report({
                        data: {
                            details: detailsFor(entry),
                            name: node.callee.property.name,
                        },
                        messageId: "bannedCall",
                        node: node.callee.property,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow calling specific identifiers by name to prevent drift away from shared utilities",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/no-call-identifiers.md",
        },
        schema: [
            {
                type: "object",
                additionalProperties: false,
                description:
                    "Configuration for banned identifier calls (both direct calls and member calls).",
                properties: {
                    banned: {
                        type: "array",
                        description:
                            "List of identifier names that must not be called.",
                        items: {
                            type: "object",
                            additionalProperties: false,
                            description: "A single banned identifier entry.",
                            properties: {
                                name: {
                                    type: "string",
                                    minLength: 1,
                                    description:
                                        "Identifier name to ban (e.g., 'danger' or 'openExternal').",
                                },
                                message: {
                                    type: "string",
                                    description:
                                        "Optional guidance shown in the lint error (e.g., what to import instead).",
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
            bannedCall: "Calling '{{name}}' is not allowed. {{details}}",
        },
    },
};
