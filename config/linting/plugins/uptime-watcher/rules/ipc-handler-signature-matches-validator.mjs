import ts from "typescript";

import {
    createTypedRule,
    getSignatureParameterTypeAt,
    getTypedRuleServices,
    isTypeAssignableTo,
} from "../_internal/typed-rule.mjs";

const TARGET_REGISTRARS = new Set([
    "registerIpcHandle",
    "registerStandardizedIpcHandler",
]);

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Expression} callee
 */
const getCalleeName = (callee) => {
    if (callee.type === "Identifier") {
        return callee.name;
    }

    if (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.property.type === "Identifier"
    ) {
        return callee.property.name;
    }

    return null;
};

/**
 * @param {import("@typescript-eslint/utils").TSESTree.Node} node
 */
const isFunctionExpressionNode = (node) =>
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression";

const ipcHandlerSignatureMatchesValidatorRule = createTypedRule({
    /**
     * @param {import("@typescript-eslint/utils").TSESLint.RuleContext<string, readonly unknown[]>} context
     */
    create(context) {
        const { checker, parserServices } = getTypedRuleServices(context);

        return {
            /**
             * @param {import("@typescript-eslint/utils").TSESTree.CallExpression} node
             */
            CallExpression(node) {
                const calleeName = getCalleeName(node.callee);
                if (!calleeName || !TARGET_REGISTRARS.has(calleeName)) {
                    return;
                }

                if (node.arguments.length < 3) {
                    return;
                }

                const handlerNode = node.arguments[1];
                const validatorNode = node.arguments[2];

                if (!handlerNode || !validatorNode) {
                    return;
                }

                if (
                    !isFunctionExpressionNode(handlerNode) ||
                    !isFunctionExpressionNode(validatorNode)
                ) {
                    return;
                }

                const tsCall = /** @type {import("typescript").CallLikeExpression} */ (
                    parserServices.esTreeNodeToTSNodeMap.get(node)
                );
                const callSignature = checker.getResolvedSignature(tsCall);

                const expectedHandlerType = getSignatureParameterTypeAt({
                    checker,
                    index: 1,
                    location: tsCall,
                    signature: callSignature,
                });

                const handlerTsNode = parserServices.esTreeNodeToTSNodeMap.get(
                    handlerNode
                );
                const handlerType = checker.getTypeAtLocation(handlerTsNode);

                const expectedHandlerSignature = expectedHandlerType
                    ? checker.getSignaturesOfType(
                          expectedHandlerType,
                          ts.SignatureKind.Call
                      ).at(0) ?? null
                    : null;

                const handlerSignature = checker.getSignaturesOfType(
                    handlerType,
                    ts.SignatureKind.Call
                ).at(0) ?? null;

                const expectedHandlerParamType = getSignatureParameterTypeAt(
                    {
                        checker,
                        index: 0,
                        location: tsCall,
                        signature: expectedHandlerSignature,
                    }
                ) ?? null;

                const expectedHandlerReturnType =
                    expectedHandlerSignature?.getReturnType() ?? null;

                const actualHandlerParamType = getSignatureParameterTypeAt(
                    {
                        checker,
                        index: 0,
                        location: handlerTsNode,
                        signature: handlerSignature,
                    }
                ) ?? null;

                const actualHandlerReturnType =
                    handlerSignature?.getReturnType() ?? null;

                const hasExplicitHandlerSignature =
                    Boolean(handlerNode.returnType) ||
                    handlerNode.params.some(
                        (param) =>
                            param.type === "Identifier" &&
                            Boolean(param.typeAnnotation)
                    );

                const isHandlerParamCompatible =
                    expectedHandlerParamType && actualHandlerParamType
                        ? isTypeAssignableTo(
                              checker,
                              expectedHandlerParamType,
                              actualHandlerParamType
                          )
                        : true;

                const isHandlerReturnCompatible =
                    expectedHandlerReturnType && actualHandlerReturnType
                        ? isTypeAssignableTo(
                              checker,
                              actualHandlerReturnType,
                              expectedHandlerReturnType
                          )
                        : true;

                if (
                    hasExplicitHandlerSignature &&
                    (!isHandlerParamCompatible || !isHandlerReturnCompatible)
                ) {
                    context.report({
                        messageId: "handlerChannelContractMismatch",
                        node: handlerNode,
                    });
                }

                const validatorTsNode = parserServices.esTreeNodeToTSNodeMap.get(
                    validatorNode
                );
                const validatorType = checker.getTypeAtLocation(validatorTsNode);

                const validatorSignature = checker.getSignaturesOfType(
                    validatorType,
                    ts.SignatureKind.Call
                ).at(0) ?? null;

                const validatorReturnType =
                    validatorSignature?.getReturnType() ?? null;
                const handlerParamType = getSignatureParameterTypeAt({
                    checker,
                    index: 0,
                    location: handlerTsNode,
                    signature: handlerSignature,
                }) ?? null;

                if (
                    validatorReturnType === null ||
                    handlerParamType === null
                ) {
                    return;
                }

                if (
                    !isTypeAssignableTo(
                        checker,
                        validatorReturnType,
                        handlerParamType
                    )
                ) {
                    context.report({
                        messageId: "validatorOutputNotAssignableToHandlerInput",
                        node: validatorNode,
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
                "require standardized IPC handler signatures to stay assignable to validator output and channel contracts.",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/ipc-handler-signature-matches-validator.md",
        },
        schema: [],
        messages: {
            handlerChannelContractMismatch:
                "IPC handler signature does not match the channel contract request/response types.",
            validatorOutputNotAssignableToHandlerInput:
                "Validator output type must be assignable to the IPC handler input parameter type.",
        },
    },
    name: "ipc-handler-signature-matches-validator",
});

export { ipcHandlerSignatureMatchesValidatorRule };
