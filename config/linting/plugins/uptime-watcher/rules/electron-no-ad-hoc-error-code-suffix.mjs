/**
 * @file Rule: electron-no-ad-hoc-error-code-suffix
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_ELECTRON_DIR } from "../_internal/repo-paths.mjs";

// repo path constants live in ../_internal/repo-paths.mjs

/**
 * Drift guard: disallow ad-hoc error code suffix formatting in electron/services.
 *
 * @remarks
 * Targets patterns like: `code ? ` (${code})` : ""`.
 */
export const electronNoAdHocErrorCodeSuffixRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow ad-hoc error code suffix formatting in electron/services; use getElectronErrorCodeSuffix instead",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#electron-no-ad-hoc-error-code-suffix",
        },
        schema: [],
        messages: {
            banned: "Use getElectronErrorCodeSuffix from electron/services/shell/openExternalUtils.ts instead of ad-hoc error code suffix formatting.",
        },
    },

    /**
     * @param {{ getFilename: () => string; report: (arg0: { node: any; messageId: string; }) => void; }} context
     */
    create(context) {
        const filename = normalizePath(context.getFilename());

        if (!filename.startsWith(`${NORMALIZED_ELECTRON_DIR}/services/`)) {
            return {};
        }

        // Allowed source of truth.
        if (filename.endsWith("/electron/services/shell/openExternalUtils.ts")) {
            return {};
        }

        const isEmptyStringLiteral = (/** @type {{type: string, value: string}} */ node) =>
            node?.type === "Literal" && node.value === "";

        const isCodeSuffixTemplate = (/** @type {{type: string, expressions: any, quasis: any}} */ node) => {
            if (!node || node.type !== "TemplateLiteral") {
                return false;
            }

            const hasCodeIdentifier = (node.expressions ?? []).some(
                (/** @type {{type: string, name: string}} */ expr) =>
                    expr?.type === "Identifier" && expr.name === "code"
            );

            if (!hasCodeIdentifier) {
                return false;
            }

            return (node.quasis ?? []).some(
                (/** @type {{value: {raw: any}}} */ quasi) => {
                    const raw = quasi?.value?.raw;
                    return typeof raw === "string" && raw.includes(" (");
                }
            );
        };

        return {
            /**
             * @param {{consequent: any, alternate: any}} node
             */
            ConditionalExpression(node) {
                const consequent = node?.consequent;
                const alternate = node?.alternate;

                const matches =
                    (isCodeSuffixTemplate(consequent) &&
                        isEmptyStringLiteral(alternate)) ||
                    (isCodeSuffixTemplate(alternate) &&
                        isEmptyStringLiteral(consequent));

                if (!matches) {
                    return;
                }

                context.report({
                    node,
                    messageId: "banned",
                });
            },
        };
    },
};
