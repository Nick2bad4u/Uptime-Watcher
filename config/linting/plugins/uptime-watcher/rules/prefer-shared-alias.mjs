/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: prefer-shared-alias
 */

import * as path from "node:path";

import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SHARED_DIR,
SHARED_DIR } from "../_internal/repo-paths.mjs";

// Repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule enforcing the `@shared` path alias instead of relative imports.
 */
export const preferSharedAliasRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (arg0: { fix: (fixer: any) => any; messageId: string; node:
     *     any }) => void;
     * }} context
     */
    create(context) {
        const filename = context.getFilename(),
            normalizedFilename = normalizePath(filename);

        if (
            normalizedFilename === "<input>" ||
            normalizedFilename.includes("/shared/")
        ) {
            return {};
        }

        const importerDirectory = path.dirname(filename);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.ImportDeclaration} node
             */
            ImportDeclaration(node) {
                if (
                    node.source.type !== "Literal" ||
                    typeof node.source.value !== "string"
                ) {
                    return;
                }

                const importPath = String(node.source.value);
                if (!importPath.startsWith(".")) {
                    return;
                }

                const importAbsolutePath = path.resolve(
                        importerDirectory,
                        importPath
                    ),
                    normalizedImportAbsolute =
                        normalizePath(importAbsolutePath);

                if (normalizedImportAbsolute === NORMALIZED_SHARED_DIR) {
                    return;
                }

                if (
                    !normalizedImportAbsolute.startsWith(
                        `${NORMALIZED_SHARED_DIR}/`
                    )
                ) {
                    return;
                }

                const relativeToShared = normalizePath(
                    path.relative(SHARED_DIR, importAbsolutePath)
                );

                if (!relativeToShared || relativeToShared.startsWith("..")) {
                    return;
                }

                const aliasSuffix = relativeToShared.replace(
                        /\.(?:[cm]?[jt]sx?|d\.ts)$/v,
                        ""
                    ),
                    aliasPath = `@shared/${aliasSuffix}`,
                    rawSource =
                        typeof node.source.raw === "string"
                            ? node.source.raw
                            : null,
                    quote = rawSource?.startsWith("'") ? "'" : '"';

                context.report({
                    /**
                     * @param {{
                     *     replaceText: (arg0: any, arg1: string) => any;
                     * }} fixer
                     */
                    fix(fixer) {
                        return fixer.replaceText(
                            node.source,
                            `${quote}${aliasPath}${quote}`
                        );
                    },
                    messageId: "useAlias",
                    node: node.source,
                });
            },
        };
    },

    meta: {
        type: "suggestion",
        docs: {
            description:
                "require @shared/* import aliases instead of relative shared paths.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-shared-alias.md",
        },
        fixable: "code",
        schema: [],
        messages: {
            useAlias:
                "Import from shared modules via the @shared alias instead of relative paths.",
        },
    },
};
