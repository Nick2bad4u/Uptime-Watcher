import { createTypedRule, isTestFilePath } from "../_internal/typed-rule.mjs";

const BRAND_PROPERTY_NAMES = new Set(["__brand", "__tag", "brand"]);

/**
 * @param {import("@typescript-eslint/utils").TSESTree.TypeNode} typeNode
 * @returns {boolean}
 */
const typeContainsTaggedReference = (typeNode) => {
    if (
        typeNode.type === "TSTypeReference" &&
        typeNode.typeName.type === "Identifier" &&
        typeNode.typeName.name === "Tagged"
    ) {
        return true;
    }

    if (
        typeNode.type === "TSIntersectionType" ||
        typeNode.type === "TSUnionType"
    ) {
        return typeNode.types.some(
            /** @returns {boolean} */ (member) =>
                typeContainsTaggedReference(member)
        );
    }

    return false;
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.TypeNode} typeNode
 * @returns {boolean}
 */
const hasAdHocBrandLiteral = (typeNode) => {
    if (typeNode.type !== "TSIntersectionType") {
        return false;
    }

    return typeNode.types.some(
        /** @returns {boolean} */ (member) => {
        if (member.type !== "TSTypeLiteral") {
            return false;
        }

        return member.members.some(
            /** @returns {boolean} */ (literalMember) => {
            if (literalMember.type !== "TSPropertySignature") {
                return false;
            }

            const key = literalMember.key;
            if (key.type !== "Identifier") {
                return false;
            }

            return BRAND_PROPERTY_NAMES.has(key.name);
            }
        );
        }
    );
};

const preferTypeFestTaggedBrandsRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const filePath = context.filename ?? "";
        if (isTestFilePath(filePath)) {
            return {};
        }

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.TSTypeAliasDeclaration} node
             */
            TSTypeAliasDeclaration(node) {
                if (typeContainsTaggedReference(node.typeAnnotation)) {
                    return;
                }

                if (!hasAdHocBrandLiteral(node.typeAnnotation)) {
                    return;
                }

                context.report({
                    data: {
                        alias: node.id.name,
                    },
                    messageId: "preferTaggedBrand",
                    node: node.id,
                });
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "suggestion",
        docs: {
            description:
                "require TypeFest Tagged over ad-hoc intersection branding with __brand/__tag fields.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/prefer-type-fest-tagged-brands.md",
        },
        schema: [],
        messages: {
            preferTaggedBrand:
                "Type alias '{{alias}}' uses ad-hoc branding. Prefer `Tagged` from type-fest for branded primitive identifiers.",
        },
    },
    name: "prefer-type-fest-tagged-brands",
});

export { preferTypeFestTaggedBrandsRule };
