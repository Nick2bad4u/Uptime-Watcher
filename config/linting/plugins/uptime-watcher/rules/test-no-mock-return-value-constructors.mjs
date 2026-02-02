/**
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
 *
 * @file Rule: test-no-mock-return-value-constructors
 */

/**
 * Vitest safety guard.
 *
 * @remarks
 * Vitest implements `mockReturnValue*` as `mockImplementation(() => value)`.
 * Arrow functions are not constructible, so mocking a class/constructor this
 * way can crash code paths that call `new` on the mocked symbol:
 *
 * `() => value is not a constructor`
 *
 * This rule flags `mockReturnValue` / `mockReturnValueOnce` when used on a
 * likely-constructible mock target (PascalCase identifier).
 */
export const testNoMockReturnValueConstructorsRule = {
    /**
     * @param {{
     *     report: (arg0: {
     *         node: any;
     *         messageId: string;
     *         data: { method: any; name: any; replacement: string };
     *     }) => void;
     * }} context
     */
    create(context) {
        const extractMockTargetName = (/** @type {any} */ node) => {
                const unwrapped = unwrapExpression(node);
                if (!unwrapped) {
                    return;
                }

                if (unwrapped.type === "Identifier") {
                    return unwrapped.name;
                }

                if (unwrapped.type === "MemberExpression") {
                    // Prefer the property name (e.g.
                    // BrowserWindow.getAllWindows)
                    if (unwrapped.property?.type === "Identifier") {
                        return unwrapped.property.name;
                    }

                    return;
                }

                if (isViMockedCall(unwrapped)) {
                    const argument = unwrapped.arguments?.[0];
                    return extractMockTargetName(argument);
                }
            },
            isPascalCase = (/** @type {string} */ name) =>
                typeof name === "string" && /^[A-Z][\dA-Za-z]*$/v.test(name),
            isViMockedCall = (
                /** @type {{ type: string; callee: any }} */ node
            ) => {
                if (!node || node.type !== "CallExpression") {
                    return false;
                }

                const callee = unwrapExpression(node.callee);

                // Vi.mocked(...)
                if (
                    callee?.type === "MemberExpression" &&
                    callee.object?.type === "Identifier" &&
                    callee.object.name === "vi" &&
                    callee.property?.type === "Identifier" &&
                    callee.property.name === "mocked"
                ) {
                    return true;
                }

                return false;
            },
            unwrapExpression = (/** @type {any} */ node) => {
                let current = node;
                // Unwrap TS wrappers commonly produced by @typescript-eslint
                // Parser And optional chaining wrappers.

                while (true) {
                    if (!current) {
                        return current;
                    }

                    if (current.type === "ChainExpression") {
                        current = current.expression;
                        continue;
                    }

                    if (current.type === "TSAsExpression") {
                        current = current.expression;
                        continue;
                    }

                    if (current.type === "TSTypeAssertion") {
                        current = current.expression;
                        continue;
                    }

                    if (current.type === "TSNonNullExpression") {
                        current = current.expression;
                        continue;
                    }

                    return current;
                }
            };

        return {
            /**
             * @param {{ callee: any }} node
             */
            CallExpression(node) {
                const callee = unwrapExpression(node.callee);
                if (!callee || callee.type !== "MemberExpression") {
                    return;
                }

                if (callee.computed) {
                    return;
                }

                const { property } = callee;
                if (!property || property.type !== "Identifier") {
                    return;
                }

                const method = property.name;
                if (
                    method !== "mockReturnValue" &&
                    method !== "mockReturnValueOnce"
                ) {
                    return;
                }

                const targetName = extractMockTargetName(callee.object);
                if (!isPascalCase(targetName)) {
                    return;
                }

                context.report({
                    data: {
                        method,
                        name: targetName,
                        replacement:
                            method === "mockReturnValue"
                                ? "mockConstructableReturnValue(mock, value)"
                                : "mockConstructableReturnValueOnce(mock, value)",
                    },
                    messageId: "banned",
                    node: property,
                });
            },
        };
    },

    meta: {
        type: "problem",
        docs: {
            description:
                "disallow mockReturnValue/mockReturnValueOnce on likely constructors (use constructible helper/mockImplementation(function...))",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher/docs/rules/test-no-mock-return-value-constructors.md",
        },
        schema: [],
        messages: {
            banned: "Avoid {{method}} on '{{name}}'. Vitest implements it with an arrow function, which cannot be used with `new`. Prefer {{replacement}} instead.",
        },
    },
};
