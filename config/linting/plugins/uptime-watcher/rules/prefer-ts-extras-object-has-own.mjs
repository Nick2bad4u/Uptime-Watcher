import { normalizePath } from "../_internal/path-utils.mjs";
import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const TARGET_PATH_PATTERN =
    /^(?:config\/linting\/plugins\/uptime-watcher\/test\/fixtures\/typed|electron|shared|src)(?:\/|$)/v;

/**
 * @param {string} filePath
 * @returns {string}
 */
const getRepoRelativePath = (filePath) => {
    const normalizedPath = normalizePath(filePath);
    const marker = "/uptime-watcher/";
    const markerIndex = normalizedPath.toLowerCase().indexOf(marker);

    if (markerIndex === -1) {
        return normalizedPath;
    }

    return normalizedPath.slice(markerIndex + marker.length);
};

const preferTsExtrasObjectHasOwnRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        const repoRelativePath = getRepoRelativePath(filePath);

        if (
            !TARGET_PATH_PATTERN.test(repoRelativePath) ||
            isTestFilePath(filePath)
        ) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const { callee } = node;

                if (
                    callee.type !== "MemberExpression" ||
                    callee.computed ||
                    callee.object.type !== "Identifier" ||
                    callee.object.name !== "Object" ||
                    callee.property.type !== "Identifier" ||
                    callee.property.name !== "hasOwn"
                ) {
                    return;
                }

                context.report({
                    messageId: "preferTsExtrasObjectHasOwn",
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
                "require ts-extras objectHasOwn over Object.hasOwn for own-property checks that should also narrow object types.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-ts-extras-object-has-own.md",
        },
        schema: [],
        messages: {
            preferTsExtrasObjectHasOwn:
                "Prefer `objectHasOwn` from `ts-extras` over `Object.hasOwn` for own-property guards with stronger type narrowing.",
        },
    },
    name: "prefer-ts-extras-object-has-own",
});

export default preferTsExtrasObjectHasOwnRule;
