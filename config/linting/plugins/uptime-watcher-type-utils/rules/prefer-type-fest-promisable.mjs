import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const PROMISABLE_PATH_PATTERN =
    /^(?:config\/linting\/plugins\/uptime-watcher-type-utils\/test\/fixtures\/typed|electron\/(?:events|services|utils)|scripts|shared\/utils|src\/(?:hooks|stores|utils)|storybook)(?:\/|$)/v;

const PROMISABLE_TYPE_NAME = "Promisable";
const PROMISE_TYPE_NAME = "Promise";

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
 * @param {import("@typescript-eslint/utils").TSESTree.TypeNode} node
 * @param {string} expectedTypeName
 * @returns {node is import("@typescript-eslint/utils").TSESTree.TSTypeReference & {
 *   typeName: import("@typescript-eslint/utils").TSESTree.Identifier;
 * }}
 */
const isIdentifierTypeReference = (node, expectedTypeName) =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === expectedTypeName;

/**
 * @param {import("@typescript-eslint/utils").TSESTree.TypeNode} node
 * @returns {import("@typescript-eslint/utils").TSESTree.TypeNode | null}
 */
const getPromiseInnerType = (node) => {
    if (!isIdentifierTypeReference(node, PROMISE_TYPE_NAME)) {
        return null;
    }

    const firstTypeArgument = node.typeArguments?.params[0];
    return firstTypeArgument ?? null;
};

const preferTypeFestPromisableRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        const normalizedPath = getRepoRelativePath(filePath);

        if (
            !PROMISABLE_PATH_PATTERN.test(normalizedPath) ||
            isTestFilePath(filePath)
        ) {
            return {};
        }

        const { sourceCode } = context;

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSUnionType} node
             */
            TSUnionType(node) {
                if (node.types.length !== 2) {
                    return;
                }

                const firstMember = node.types[0];
                const secondMember = node.types[1];
                if (!firstMember || !secondMember) {
                    return;
                }

                if (
                    node.types.some((member) =>
                        isIdentifierTypeReference(member, PROMISABLE_TYPE_NAME)
                    )
                ) {
                    return;
                }

                const firstPromiseInner = getPromiseInnerType(firstMember);
                const secondPromiseInner = getPromiseInnerType(secondMember);

                const pair =
                    firstPromiseInner && !secondPromiseInner
                        ? {
                              promiseInner: firstPromiseInner,
                              synchronousMember: secondMember,
                          }
                        : !firstPromiseInner && secondPromiseInner
                          ? {
                                promiseInner: secondPromiseInner,
                                synchronousMember: firstMember,
                            }
                          : null;

                if (pair === null) {
                    return;
                }

                const { promiseInner, synchronousMember } = pair;

                if (
                    synchronousMember.type === "TSNeverKeyword" ||
                    synchronousMember.type === "TSNullKeyword" ||
                    synchronousMember.type === "TSUndefinedKeyword"
                ) {
                    return;
                }

                const promiseInnerText = sourceCode.getText(promiseInner);
                const synchronousMemberText =
                    sourceCode.getText(synchronousMember);

                if (promiseInnerText !== synchronousMemberText) {
                    return;
                }

                context.report({
                    messageId: "preferPromisable",
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
                "require TypeFest Promisable for sync-or-async callback contracts currently expressed as Promise<T> | T unions.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher-type-utils/docs/rules/prefer-type-fest-promisable.md",
        },
        schema: [],
        messages: {
            preferPromisable:
                "Prefer `Promisable<T>` from type-fest over `Promise<T> | T` for sync-or-async contracts.",
        },
    },
    name: "prefer-type-fest-promisable",
});

export { preferTypeFestPromisableRule };
