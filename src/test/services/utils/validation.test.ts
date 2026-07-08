import type { UnknownRecord } from "type-fest";

import { describe, expect, it } from "vitest";

import {
    parseServiceStringResponse,
    validateServicePayload,
} from "../../../services/utils/validation";

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

    it("wraps validator exceptions with sanitized diagnostics and preserves cause", () => {
        const cause = new Error("boom");
        const validator = (_value: unknown) => {
            throw cause;
        };

        try {
            validateServicePayload(validator, "x", {
                serviceName: "TestService",
                operation: "throws",
                diagnostics: {
                    access_token: "SUPER_SECRET",
                    note: `parse\n${"x".repeat(1200)}`,
                },
            });
            throw new Error("Expected validateServicePayload to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);

            const thrown = error as Error & {
                cause?: unknown;
                details?: UnknownRecord;
            };
            expect(thrown.message).toContain(
                "[TestService] throws threw during validation"
            );
            expect(thrown.message).toContain("diagnostics=");
            expect(thrown.message).not.toContain("SUPER_SECRET");
            expect(thrown.message).not.toContain("\n");
            expect(thrown.message.length).toBeLessThan(1200);
            expect(thrown.cause).toBe(cause);
            expect(thrown.details?.["diagnostics"]).toEqual({
                diagnosticsPreview: expect.stringContaining(
                    '"access_token":"[redacted]"'
                ),
                diagnosticsTruncated: true,
            });
        }
    });

    it("formats invalid payload errors with issues and handles circular diagnostics", () => {
        const diagnostics: UnknownRecord = {
            refresh_token: "SUPER_SECRET",
            siteIdentifier: "site-1",
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
        ).toThrow(/returned invalid payload/v);

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

            const message = (error as Error).message;
            expect(message).toContain("missing");
            expect(message).toContain("diagnostics=");
            expect(message).toContain('"self":"[Circular]"');
            expect(message).not.toContain("SUPER_SECRET");
        }
    });

    it("redacts secrets from invalid payload issue messages", () => {
        const validator = (_value: unknown) => ({
            success: false as const,
            error: {
                issues: [
                    {
                        path: ["token"],
                        message:
                            "request failed access_token=SUPER_SECRET refresh_token: OTHER_SECRET",
                    },
                ],
            },
        });

        try {
            validateServicePayload(validator, "x", {
                serviceName: "TestService",
                operation: "invalid",
            });
            throw new Error("Expected validateServicePayload to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);

            const thrown = error as Error & { details?: UnknownRecord };
            const issues = String(thrown.details?.["issues"]);
            expect(thrown.message).toContain("access_token=[redacted]");
            expect(thrown.message).toContain("refresh_token: [redacted]");
            expect(thrown.message).not.toContain("SUPER_SECRET");
            expect(thrown.message).not.toContain("OTHER_SECRET");
            expect(issues).not.toContain("SUPER_SECRET");
            expect(issues).not.toContain("OTHER_SECRET");
        }
    });

    it("redacts secrets from fallback validation error messages", () => {
        const validator = (_value: unknown) => ({
            success: false as const,
            error: new Error("fallback token=SUPER_SECRET"),
        });

        try {
            validateServicePayload(validator, "x", {
                serviceName: "TestService",
                operation: "invalid",
            });
            throw new Error("Expected validateServicePayload to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);

            const thrown = error as Error & { details?: UnknownRecord };
            expect(thrown.message).toContain("token=[redacted]");
            expect(thrown.message).not.toContain("SUPER_SECRET");
            expect(thrown.details?.["issues"]).toBe(
                "fallback token=[redacted]"
            );
        }
    });

    it("does not invoke accessor-backed validation issue arrays", () => {
        let getterCalls = 0;
        const validationError = {
            message: "fallback reason",
        };
        Object.defineProperty(validationError, "issues", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return [{ message: "accessor issue" }];
            },
        });
        const validator = (_value: unknown) => ({
            success: false as const,
            error: validationError,
        });

        expect(() =>
            validateServicePayload(validator, "x", {
                serviceName: "TestService",
                operation: "invalid",
            })
        ).toThrow(/fallback reason/v);
        expect(getterCalls).toBe(0);
    });

    it("does not invoke accessor-backed issue details", () => {
        let getterCalls = 0;
        const issue = {};
        Object.defineProperty(issue, "message", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return "accessor issue";
            },
        });
        Object.defineProperty(issue, "path", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return ["field"];
            },
        });
        const validator = (_value: unknown) => ({
            success: false as const,
            error: {
                issues: [issue],
                message: "fallback reason",
            },
        });

        expect(() =>
            validateServicePayload(validator, "x", {
                serviceName: "TestService",
                operation: "invalid",
            })
        ).toThrow(/fallback reason/v);
        expect(getterCalls).toBe(0);
    });
});

describe(parseServiceStringResponse, () => {
    it("returns string responses unchanged", () => {
        expect(
            parseServiceStringResponse("formatThing", "", {
                serviceName: "TestService",
            })
        ).toBe("");
        expect(
            parseServiceStringResponse("formatThing", "value", {
                serviceName: "TestService",
            })
        ).toBe("value");
    });

    it("throws an ApplicationError with operation diagnostics for non-strings", () => {
        try {
            parseServiceStringResponse("formatThing", 42, {
                details: { type: "http" },
                serviceName: "TestService",
            });
            throw new Error("Expected parseServiceStringResponse to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(Error);

            const thrown = error as Error & {
                code?: string;
                details?: UnknownRecord;
            };
            expect(thrown.message).toBe(
                "[TestService] formatThing returned invalid string response"
            );
            expect(thrown.code).toBe("RENDERER_SERVICE_INVALID_PAYLOAD");
            expect(thrown.details).toEqual({
                operation: "formatThing",
                receivedType: "number",
                serviceName: "TestService",
                type: "http",
            });
        }
    });
});
