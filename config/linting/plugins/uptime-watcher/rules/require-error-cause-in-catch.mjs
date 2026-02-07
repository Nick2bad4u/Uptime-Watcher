/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: require-error-cause-in-catch
 */

import { getContextFilename } from "../_internal/eslint-context-compat.mjs";
import { normalizePath } from "../_internal/path-utils.mjs";

const BUILTIN_ERROR_CTORS = new Set([
    "Error",
    "EvalError",
    "RangeError",
    "ReferenceError",
    "SyntaxError",
    "TypeError",
    "URIError",
]);

/**
 * ESLint rule requiring Error constructor calls in `catch` blocks to include `{
 * cause }`.
 *
 * @remarks
 * When wrapping errors inside a catch block, use the standard error cause chain
 * so we preserve stack/context across boundaries.
 */
export const requireErrorCauseInCatchRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (descriptor: { node: any; messageId: string }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context);
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            normalizedFilename.includes("/test/") ||
            normalizedFilename.includes("/benchmarks/")
        ) {
            return {};
        }

        // The plugin sometimes runs unscoped (configs.all). Keep this rule
        // Limited to the repo’s TypeScript/JS sources to avoid surprising
        // Consumers.
        if (
            !normalizedFilename.includes("/electron/") &&
            !normalizedFilename.includes("/src/") &&
            !normalizedFilename.includes("/shared/") &&
            !normalizedFilename.includes("/storybook/") &&
            !normalizedFilename.includes("/scripts/")
        ) {
            return {};
        }

        let catchDepth = 0;

        /**
         * @param {any} property
         *
         * @returns {null | string}
         */
        const getObjectPropertyKeyName = (property) => {
            if (!property) {
                return null;
            }

            const key = property.key;
            if (property.computed) {
                if (key?.type === "Literal" && typeof key.value === "string") {
                    return key.value;
                }

                return null;
            }

            if (key?.type === "Identifier") {
                return key.name;
            }

            if (key?.type === "Literal" && typeof key.value === "string") {
                return key.value;
            }

            return null;
        };

        /**
         * @param {any} optionsArgument
         *
         * @returns {boolean}
         */
        const hasCauseOption = (optionsArgument) => {
            if (
                !optionsArgument ||
                optionsArgument.type !== "ObjectExpression"
            ) {
                return false;
            }

            for (const property of optionsArgument.properties ?? []) {
                if (property?.type !== "Property") {
                    continue;
                }

                const name = getObjectPropertyKeyName(property);
                if (name === "cause") {
                    return true;
                }
            }

            return false;
        };

        return {
            /** @param {any} node */
            CatchClause(node) {
                if (node) {
                    catchDepth += 1;
                }
            },
            "CatchClause:exit"() {
                catchDepth = Math.max(0, catchDepth - 1);
            },

            /** @param {any} node */
            ThrowStatement(node) {
                if (catchDepth === 0) {
                    return;
                }

                const argument = node.argument;
                if (!argument || argument.type !== "NewExpression") {
                    return;
                }

                const callee = argument.callee;
                if (callee?.type !== "Identifier") {
                    return;
                }

                if (!BUILTIN_ERROR_CTORS.has(callee.name)) {
                    return;
                }

                const args = argument.arguments ?? [];

                // Error(message, { cause })
                const options = args[1];
                if (!options || !hasCauseOption(options)) {
                    context.report({
                        messageId: "missingCause",
                        node: argument,
                    });
                }
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "require Error(..., { cause }) when throwing inside catch blocks",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/require-error-cause-in-catch.md",
        },
        schema: [],
        messages: {
            missingCause:
                "When throwing a new built-in Error inside a catch block, include a `{ cause }` option to preserve the error chain.",
        },
    },
};
