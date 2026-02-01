/**
 * @file Rule: logger-no-error-in-context
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import {
    NORMALIZED_ELECTRON_DIR,
    NORMALIZED_SHARED_DIR,
    NORMALIZED_SRC_DIR,
} from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule preventing passing Error objects via `{ error: ... }` context.
 */
export const loggerNoErrorInContextRule = {
    /**
     * @param {{ getFilename: () => string; report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        const normalizedFilename = normalizePath(context.getFilename());

        if (
            normalizedFilename === "<input>" ||
            (!normalizedFilename.startsWith(`${NORMALIZED_ELECTRON_DIR}/`) &&
                !normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`) &&
                !normalizedFilename.startsWith(`${NORMALIZED_SHARED_DIR}/`))
        ) {
            return {};
        }

        // Allow the logger implementation modules.
        if (
            normalizedFilename.endsWith("/src/services/logger.ts") ||
            normalizedFilename.endsWith("/shared/utils/logger.ts") ||
            normalizedFilename.endsWith("/electron/services/logger.ts")
        ) {
            return {};
        }

        /**
         * @param {any} argument
         */
        function getErrorProperty(argument) {
            if (!argument || argument.type !== "ObjectExpression") {
                return null;
            }

            for (const property of argument.properties ?? []) {
                if (!property || property.type !== "Property") {
                    continue;
                }

                if (property.computed) {
                    continue;
                }

                if (property.key?.type !== "Identifier") {
                    continue;
                }

                if (property.key.name !== "error") {
                    continue;
                }

                return property;
            }

            return null;
        }

        /**
         * @param {any} value
         */
        function looksLikeError(value) {
            if (!value) {
                return false;
            }

            if (value.type === "NewExpression") {
                return value.callee?.type === "Identifier" && value.callee.name === "Error";
            }

            if (value.type === "CallExpression") {
                // EnsureError(...) or normalizeError(...)
                return (
                    value.callee?.type === "Identifier" &&
                    (value.callee.name === "ensureError" ||
                        value.callee.name === "normalizeError")
                );
            }

            // Identifier named error/err is a strong signal.
            if (value.type === "Identifier") {
                return value.name === "error" || value.name === "err";
            }

            return false;
        }

        return {
            /**
             * @param {any} node
             */
            CallExpression(node) {
                const callee = node?.callee;

                if (!callee || callee.type !== "MemberExpression") {
                    return;
                }

                if (callee.computed) {
                    return;
                }

                if (callee.object?.type !== "Identifier") {
                    return;
                }

                if (callee.object.name !== "logger") {
                    return;
                }

                if (callee.property?.type !== "Identifier") {
                    return;
                }

                if (
                    callee.property.name !== "error" &&
                    callee.property.name !== "warn"
                ) {
                    return;
                }

                const arguments_ = node.arguments ?? [],
                 lastArgument = arguments_.at(-1),
                 errorProperty = getErrorProperty(lastArgument);

                if (!errorProperty) {
                    return;
                }

                if (!looksLikeError(errorProperty.value)) {
                    return;
                }

                context.report({
                    messageId: "avoidErrorContext",
                    node: errorProperty,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow passing Error objects via { error: ... } context to logger.error/warn; pass as the dedicated error argument instead",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/logger-no-error-in-context.md",
        },
        schema: [],
        messages: {
            avoidErrorContext:
                "Do not pass Error objects via { error: ... } when calling logger. Pass the Error as the dedicated error argument instead.",
        },
    },
};
