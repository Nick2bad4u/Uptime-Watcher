/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs` to keep the internal
 * ESLint plugin modular and easier to maintain.
 *
 * @file Rule: electron-no-import-meta-dirname
 */

import { normalizePath } from "../_internal/path-utils.mjs";
import { getContextFilename } from "../_internal/eslint-context-compat.mjs";

/**
 * ESLint rule disallowing `import.meta.dirname` / `import.meta.filename` in the
 * Electron main process source.
 *
 * @remarks
 * While Node.js may provide these properties, Vite/Electron bundling can
 * rewrite `import.meta` such that these non-standard properties become
 * undefined at runtime (causing hard crashes in the main process).
 */
export const electronNoImportMetaDirnameRule = {
    /**
     * @param {{
     *     getFilename: () => any;
     *     report: (descriptor: {
     *         node: any;
     *         messageId: string;
     *         data?: Record<string, unknown>;
     *     }) => void;
     * }} context
     */
    create(context) {
        const rawFilename = getContextFilename(context);
        const normalizedFilename = normalizePath(rawFilename);

        if (
            normalizedFilename === "<input>" ||
            !normalizedFilename.includes("/electron/") ||
            normalizedFilename.includes("/electron/test/") ||
            normalizedFilename.includes("/electron/benchmarks/")
        ) {
            return {};
        }

        /**
         * @param {any} node
         *
         * @returns {boolean}
         */
        const isImportMeta = (node) =>
            node?.type === "MetaProperty" &&
            node.meta?.type === "Identifier" &&
            node.meta.name === "import" &&
            node.property?.type === "Identifier" &&
            node.property.name === "meta";

        /**
         * @param {any} node
         *
         * @returns {null | string}
         */
        const getMemberPropertyName = (node) => {
            if (!node) {
                return null;
            }

            if (node.computed) {
                const property = node.property;
                if (
                    property?.type === "Literal" &&
                    typeof property.value === "string"
                ) {
                    return property.value;
                }

                return null;
            }

            const property = node.property;
            if (property?.type === "Identifier") {
                return property.name;
            }

            return null;
        };

        return {
            /**
             * @param {any} node
             */
            MemberExpression(node) {
                if (!isImportMeta(node.object)) {
                    return;
                }

                const propertyName = getMemberPropertyName(node);
                if (propertyName !== "dirname" && propertyName !== "filename") {
                    return;
                }

                context.report({
                    data: { propertyName },
                    messageId: "disallowed",
                    node: node.property ?? node,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow import.meta.dirname/import.meta.filename in Electron sources to avoid bundle-time undefined crashes",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/electron-no-import-meta-dirname.md",
        },
        schema: [],
        messages: {
            disallowed:
                "import.meta.{{propertyName}} is not allowed in Electron sources because bundlers may not preserve it. Prefer path.dirname(fileURLToPath(import.meta.url)).",
        },
    },
};
