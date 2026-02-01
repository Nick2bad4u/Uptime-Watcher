/**
 * @file Rule: prefer-try-get-error-code
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 */

/**
 * @param {any} typeNode
 */
function typeContainsCodeProperty(typeNode) {
    if (!typeNode) {
        return false;
    }

    if (typeNode.type === "TSUnionType") {
        return typeNode.types.some(typeContainsCodeProperty);
    }

    if (typeNode.type === "TSIntersectionType") {
        return typeNode.types.some(typeContainsCodeProperty);
    }

    if (typeNode.type === "TSTypeLiteral") {
        return typeNode.members.some(
            (/** @type {{type: string, key: any}} */ member) =>
                member.type === "TSPropertySignature" &&
                member.key?.type === "Identifier" &&
                member.key.name === "code"
        );
    }

    return false;
}

/**
 * ESLint rule encouraging use of tryGetErrorCode over asserting `{ code?: ... }`.
 */
export const preferTryGetErrorCodeRule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "require tryGetErrorCode over asserting unknown errors as { code?: ... }",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#prefer-try-get-error-code",
        },
        schema: [],
        messages: {
            prefer:
                "Use tryGetErrorCode(error) instead of asserting error as { code?: ... }.",
        },
    },

    /**
     * @param {{ report: (arg0: { messageId: string; node: any; }) => void; }} context
     */
    create(context) {
        /** @param {any} node */
        function checkTypeAssertion(node) {
            if (!node.typeAnnotation) {
                return;
            }

            if (!typeContainsCodeProperty(node.typeAnnotation)) {
                return;
            }

            context.report({
                messageId: "prefer",
                node,
            });
        }

        return {
            /** @param {any} node */
            TSAsExpression(node) {
                checkTypeAssertion(node);
            },

            /** @param {any} node */
            TSTypeAssertion(node) {
                checkTypeAssertion(node);
            },
        };
    },
};
