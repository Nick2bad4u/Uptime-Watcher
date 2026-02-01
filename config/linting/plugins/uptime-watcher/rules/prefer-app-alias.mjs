/**
 * @file Rule: prefer-app-alias
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal ESLint
 * plugin modular and easier to maintain.
 */

import * as path from "node:path";
import { normalizePath } from "../_internal/path-utils.mjs";
import { NORMALIZED_SRC_DIR, SRC_DIR } from "../_internal/repo-paths.mjs";

// repo path constants live in ../_internal/repo-paths.mjs

/**
 * ESLint rule ensuring files outside of src reference renderer modules via the
 * @app alias.
 */
export const preferAppAliasRule = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require using the @app alias instead of relative paths into src from external packages.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#prefer-app-alias",
        },
        fixable: "code",
        schema: [],
        messages: {
            useAlias:
                "Import from src via the @app alias instead of relative paths.",
        },
    },

    /**
     * @param {{getFilename: () => any; report: (arg0: {fix: (fixer: any) => any; messageId: string; node: any}) => void}} context
     */
    create(context) {
        const filename = context.getFilename();
        const normalizedFilename = normalizePath(filename);

        if (
            normalizedFilename === "<input>" ||
            normalizedFilename.startsWith(`${NORMALIZED_SRC_DIR}/`)
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

                const importAbsolutePath = path.resolve(importerDirectory, importPath);
                const normalizedImportAbsolute = normalizePath(importAbsolutePath);

                if (
                    normalizedImportAbsolute !== NORMALIZED_SRC_DIR &&
                    !normalizedImportAbsolute.startsWith(`${NORMALIZED_SRC_DIR}/`)
                ) {
                    return;
                }

                const relativeToSrc = normalizePath(
                    path.relative(SRC_DIR, importAbsolutePath)
                );

                if (!relativeToSrc || relativeToSrc.startsWith("..")) {
                    return;
                }

                const aliasSuffix = relativeToSrc.replace(
                    /\.(?:[cm]?[jt]sx?|d\.ts)$/u,
                    ""
                );
                const cleanedSuffix = aliasSuffix.replace(/^\.\/?/u, "");
                const aliasPath =
                    cleanedSuffix.length > 0 ? `@app/${cleanedSuffix}` : "@app";
                const rawSource = node.source.raw ?? node.source.extra?.raw;
                const quote = rawSource?.startsWith("'") ? "'" : '"';

                context.report({
                    /**
                     * @param {{ replaceText: (arg0: any, arg1: string) => any; }} fixer
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
};
