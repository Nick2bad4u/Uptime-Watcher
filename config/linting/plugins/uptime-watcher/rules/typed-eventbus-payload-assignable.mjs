import {
    createTypedRule,
    getSignatureParameterTypeAt,
    getTypedRuleServices,
    isTypeAssignableTo,
} from "../_internal/typed-rule.mjs";

const TARGET_METHODS = new Set([
    "emit",
    "on",
    "onTyped",
]);

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} callee
 */
const getMethodName = (callee) => {
    if (
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.property.type !== "Identifier"
    ) {
        return;
    }

    return callee.property.name;
};

const typedEventbusPayloadAssignableRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<
     *     string,
     *     readonly unknown[]
     * >} context
     */
    create(context) {
        const { checker, parserServices } = getTypedRuleServices(context);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const methodName = getMethodName(node.callee);
                if (!methodName || !TARGET_METHODS.has(methodName)) {
                    return;
                }

                if (node.arguments.length < 2) {
                    return;
                }

                const tsCall =
                    /** @type {import("typescript").CallLikeExpression} */ (
                        parserServices.esTreeNodeToTSNodeMap.get(node)
                    );
                const callSignature = checker.getResolvedSignature(tsCall);
                if (!callSignature) {
                    return;
                }

                if (methodName === "emit") {
                    const expectedPayloadType = getSignatureParameterTypeAt({
                        checker,
                        index: 1,
                        location: tsCall,
                        signature: callSignature,
                    });

                    if (!expectedPayloadType) {
                        return;
                    }

                    const payloadNode = node.arguments[1];
                    if (!payloadNode) {
                        return;
                    }

                    const payloadTsNode =
                        parserServices.esTreeNodeToTSNodeMap.get(payloadNode);
                    const payloadType =
                        checker.getTypeAtLocation(payloadTsNode);

                    if (
                        !isTypeAssignableTo(
                            checker,
                            payloadType,
                            expectedPayloadType
                        )
                    ) {
                        context.report({
                            messageId: "emitPayloadNotAssignable",
                            node: payloadNode,
                        });
                    }

                    return;
                }

                const expectedListenerType = getSignatureParameterTypeAt({
                    checker,
                    index: 1,
                    location: tsCall,
                    signature: callSignature,
                });

                if (!expectedListenerType) {
                    return;
                }

                const listenerNode = node.arguments[1];
                if (!listenerNode) {
                    return;
                }

                const listenerTsNode =
                    parserServices.esTreeNodeToTSNodeMap.get(listenerNode);
                const listenerType = checker.getTypeAtLocation(listenerTsNode);

                if (
                    !isTypeAssignableTo(
                        checker,
                        listenerType,
                        expectedListenerType
                    )
                ) {
                    context.report({
                        messageId: "listenerNotAssignable",
                        node: listenerNode,
                    });
                }
            },
        };
    },
    defaultOptions: [],
    meta: {
        type: "problem",
        docs: {
            description:
                "require TypedEventBus emit payloads and listeners to be assignable to event-map contract types.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/typed-eventbus-payload-assignable.md",
        },
        schema: [],
        messages: {
            emitPayloadNotAssignable:
                "Typed event payload is not assignable to the event contract payload type.",
            listenerNotAssignable:
                "Typed event listener callback is not assignable to the event contract listener type.",
        },
    },
    name: "typed-eventbus-payload-assignable",
});

export { typedEventbusPayloadAssignableRule };
