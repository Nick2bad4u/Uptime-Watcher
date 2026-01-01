import { describe, expect, it } from "vitest";

import { validateServicePayload } from "../../../services/utils/validation";

describe(validateServicePayload, () => {
    it("returns parsed data when validation succeeds", () => {
        const validator = (_value: unknown) => ({
            success: true as const,
            data: 123,
        });

        const result = validateServicePayload(validator, "ignored", {
            serviceName: "TestService",
            operation: "op",
            diagnostics: { foo: "bar" },
        });

        expect(result).toBe(123);
    });

    it("wraps validator exceptions with helpful context and preserves cause", () => {
        const cause = new Error("boom");
        const validator = (_value: unknown) => {
            throw cause;
        };

        try {
            validateServicePayload(validator, "x", {
                serviceName: "TestService",
                operation: "throws",
                diagnostics: { stage: "parse" },
            });
            throw new Error("Expected validateServicePayload to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);

            const thrown = error as Error & { cause?: unknown };
            expect(thrown.message).toContain(
                "[TestService] throws threw during validation"
            );
            expect(thrown.message).toContain("diagnostics=");
            expect(thrown.cause).toBe(cause);
        }
    });

    it("formats invalid payload errors with issues and handles unserializable diagnostics", () => {
        const diagnostics: Record<string, unknown> = {
            siteId: "site-1",
        };
        diagnostics["self"] = diagnostics;

        const validator = (_value: unknown) => ({
            success: false as const,
            error: {
                issues: [
                    {
                        path: ["field"],
                        message: "missing",
                    },
                ],
            },
        });

        expect(() =>
            validateServicePayload(
                validator,
                { any: "thing" },
                {
                    serviceName: "TestService",
                    operation: "invalid",
                    diagnostics,
                }
            )
        ).toThrowError(/returned invalid payload/);

        try {
            validateServicePayload(
                validator,
                { any: "thing" },
                {
                    serviceName: "TestService",
                    operation: "invalid",
                    diagnostics,
                }
            );
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);

            const message = String((error as Error).message);
            expect(message).toContain("missing");
            expect(message).toContain("diagnostics=[unserializable]");
        }
    });
});
