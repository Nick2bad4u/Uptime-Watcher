import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const JSON_BOUNDARY_PATH_PATTERN =
    /\/(?:config\/linting\/plugins\/uptime-watcher\/test\/fixtures\/typed|electron\/services\/ipc|shared\/(?:types|utils\/logger)|src\/components\/Alerts)\//v;

/**
 * @param {import("@typescript-eslint/utils").TSESTree.TSTypeReference} typeNode
 */
const isRecordLikeUnknown = (typeNode) => {
    if (
        typeNode.type !== "TSTypeReference" ||
        typeNode.typeName.type !== "Identifier" ||
        typeNode.typeName.name !== "Record" ||
        !typeNode.typeArguments ||
        typeNode.typeArguments.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = typeNode.typeArguments.params;
    if (!keyType || !valueType) {
        return false;
    }

    return (
        keyType.type === "TSStringKeyword" &&
        (valueType.type === "TSUnknownKeyword" || valueType.type === "TSAnyKeyword")
    );
};

const rule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        const normalizedPath = filePath.replaceAll("\\", "/");

        if (
            !JSON_BOUNDARY_PATH_PATTERN.test(normalizedPath) ||
            isTestFilePath(filePath)
        ) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSTypeReference} node
             */
            TSTypeReference(node) {
                if (!isRecordLikeUnknown(node)) {
                    return;
                }

                context.report({
                    messageId: "preferJsonValue",
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
                "require TypeFest JsonValue/JsonObject for payload and context-like contract types in serialization boundaries.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-type-fest-json-value.md",
        },
        schema: [],
        messages: {
            preferJsonValue:
                "Use `JsonValue`/`JsonObject` from type-fest for payload/context contracts in serialization boundaries instead of Record<string, unknown>.",
        },
    },
    name: "prefer-type-fest-json-value",
});

export default rule;
