/**
 * @file Rule: no-regexp-v-flag
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal ESLint
 * plugin modular and easier to maintain.
 */

/**
 * ESLint rule disallowing the RegExp `v` flag.
 *
 * @remarks
 * The `v` flag is still experimental and can cause runtime SyntaxErrors
 * depending on runtime/toolchain.
 */
export const noRegexpVFlagRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow RegExp literals using the experimental 'v' flag",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#no-regexp-v-flag",
        },
        schema: [],
        messages: {
            disallowed:
                "RegExp flag 'v' is not allowed. Use 'u'/'gu' or rewrite the regex.",
        },
    },

    /**
     * @param {{ report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        return {
            /**
             * @param {{regex: any}} node
             */
            Literal(node) {
                const regex = node?.regex;
                if (!regex || typeof regex.flags !== "string") {
                    return;
                }

                if (regex.flags.includes("v")) {
                    context.report({
                        node,
                        messageId: "disallowed",
                    });
                }
            },
        };
    },
};
