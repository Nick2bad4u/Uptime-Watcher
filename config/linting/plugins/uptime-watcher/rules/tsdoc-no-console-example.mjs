/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: tsdoc-no-console-example
 */

/**
 * ESLint rule detecting console usage within TSDoc example code blocks.
 */
import { getContextSourceCode } from "../_internal/eslint-context-compat.mjs";

export const tsdocNoConsoleExampleRule = {
    /**
     * @param {{
     *     getSourceCode: () => any;
     *     report: (arg0: { loc: { end: any; start: any }; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const sourceCode = getContextSourceCode(context);

        return {
            Program() {
                const comments = sourceCode.getAllComments();
                for (const comment of comments) {
                    if (
                        comment.type !== "Block" ||
                        !comment.value.startsWith("*")
                    ) {
                        continue;
                    }

                    if (!comment.range) {
                        continue;
                    }

                    if (!comment.range) {
                        continue;
                    }

                    const consolePattern = /console\.[A-Za-z]+/v,
                        examplePattern = /```[\s\S]*?```/gv;
                    let match;

                    while (
                        (match = examplePattern.exec(comment.value)) !== null
                    ) {
                        if (!consolePattern.test(match[0])) {
                            continue;
                        }

                        const reportIndex = comment.range[0] + 2 + match.index,
                            loc = sourceCode.getLocFromIndex(reportIndex);
                        context.report({
                            loc: {
                                end: sourceCode.getLocFromIndex(
                                    reportIndex + match[0].length
                                ),
                                start: loc,
                            },
                            messageId: "replaceConsole",
                        });
                    }
                }
            },
        };
    },

    meta: {
        type: "suggestion",
        docs: {
            description:
                "disallow console.* in TSDoc example code blocks; prefer structured logger.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/tsdoc-no-console-example.md",
        },
        schema: [],
        messages: {
            replaceConsole:
                "Replace console usage in examples with the structured logger.",
        },
    },
};
