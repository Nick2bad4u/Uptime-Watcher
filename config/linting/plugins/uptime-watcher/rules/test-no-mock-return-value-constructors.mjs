/**
 * @file Rule: test-no-mock-return-value-constructors
 *
 * @remarks
 * Extracted from the monolithic `uptime-watcher.mjs`.
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
    meta: {
        type: "problem",
        docs: {
            description:
                "disallow mockReturnValue/mockReturnValueOnce on likely constructors (use constructible helper/mockImplementation(function...))",
            recommended: false,
            url: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/config/linting/plugins/uptime-watcher.mjs#test-no-mock-return-value-constructors",
        },
        schema: [],
        messages: {
            banned: "Avoid {{method}} on '{{name}}'. Vitest implements it with an arrow function, which cannot be used with `new`. Prefer {{replacement}} instead.",
        },
    },

    /**
     * @param {{ report: (arg0: { node: any; messageId: string; data: { method: any; name: any; replacement: string; }; }) => void; }} context
     */
    create(context) {
        const unwrapExpression = (/** @type {any} */ node) => {
            let current = node;
            // Unwrap TS wrappers commonly produced by @typescript-eslint parser
            // and optional chaining wrappers.

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

        const isPascalCase = (/** @type {string} */ name) =>
            typeof name === "string" && /^[A-Z][A-Za-z0-9]*$/.test(name);

        const isViMockedCall = (
            /** @type {{type: string, callee: any}} */ node
        ) => {
            if (!node || node.type !== "CallExpression") {
                return false;
            }

            const callee = unwrapExpression(node.callee);

            // vi.mocked(...)
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
        };

        const extractMockTargetName = (/** @type {any} */ node) => {
            const unwrapped = unwrapExpression(node);
            if (!unwrapped) {
                return undefined;
            }

            if (unwrapped.type === "Identifier") {
                return unwrapped.name;
            }

            if (unwrapped.type === "MemberExpression") {
                // Prefer the property name (e.g. BrowserWindow.getAllWindows)
                if (unwrapped.property?.type === "Identifier") {
                    return unwrapped.property.name;
                }

                return undefined;
            }

            if (isViMockedCall(unwrapped)) {
                const arg = unwrapped.arguments?.[0];
                return extractMockTargetName(arg);
            }

            return undefined;
        };

        return {
            /**
             * @param {{callee: any}} node
             */
            CallExpression(node) {
                const callee = unwrapExpression(node.callee);
                if (!callee || callee.type !== "MemberExpression") {
                    return;
                }

                if (callee.computed) {
                    return;
                }

                const property = callee.property;
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
                    node: property,
                    messageId: "banned",
                    data: {
                        method,
                        name: targetName,
                        replacement:
                            method === "mockReturnValue"
                                ? "mockConstructableReturnValue(mock, value)"
                                : "mockConstructableReturnValueOnce(mock, value)",
                    },
                });
            },
        };
    },
};
