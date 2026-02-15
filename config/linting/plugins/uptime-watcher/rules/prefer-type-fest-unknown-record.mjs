import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const ARCHITECTURE_PATH_PATTERN =
    /^(?:config\/linting\/plugins\/uptime-watcher\/test\/fixtures\/typed|electron\/services\/ipc|shared|src\/components\/Alerts|src\/stores)(?:\/|$)/v;

/**
 * @param {string} filePath
 * @returns {string}
 */
const getRepoRelativePath = (filePath) => {
    const normalizedPath = filePath.replaceAll("\\", "/");
    const repoMarker = "/Uptime-Watcher/";
    const markerIndex = normalizedPath.lastIndexOf(repoMarker);

    if (markerIndex === -1) {
        return normalizedPath;
    }

    return normalizedPath.slice(markerIndex + repoMarker.length);
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.TSTypeReference} node
 */
const isRecordStringUnknown = (node) => {
    if (
        node.type !== "TSTypeReference" ||
        node.typeName.type !== "Identifier" ||
        node.typeName.name !== "Record" ||
        !node.typeArguments ||
        node.typeArguments.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = node.typeArguments.params;
    if (!keyType || !valueType) {
        return false;
    }

    return keyType.type === "TSStringKeyword" && valueType.type === "TSUnknownKeyword";
};

const preferTypeFestUnknownRecordRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        const normalizedPath = getRepoRelativePath(filePath);
        if (
            !ARCHITECTURE_PATH_PATTERN.test(normalizedPath) ||
            isTestFilePath(filePath)
        ) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSTypeReference} node
             */
            TSTypeReference(node) {
                if (!isRecordStringUnknown(node)) {
                    return;
                }

                context.report({
                    messageId: "preferUnknownRecord",
                    node,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest UnknownRecord over Record<string, unknown> in architecture-critical layers.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-type-fest-unknown-record.md",
        },
        schema: [],
        messages: {
            preferUnknownRecord:
                "Prefer `UnknownRecord` from type-fest over `Record<string, unknown>` for clearer intent and stronger shared typing conventions.",
        },
    },
    name: "prefer-type-fest-unknown-record",
});

export default preferTypeFestUnknownRecordRule;
