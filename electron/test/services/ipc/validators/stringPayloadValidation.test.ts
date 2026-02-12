import { describe, expect, it } from "vitest";

import {
    validateOptionalStringPayload,
    validateRequiredStringPayload,
} from "@electron/services/ipc/validators/utils/stringPayloadValidation";
import { validateDiagnosticsPayloadPreview } from "@electron/services/ipc/validators/utils/diagnosticsValidation";

describe("stringPayloadValidation", () => {
    describe("validateRequiredStringPayload behavior", () => {
        it("returns no errors for valid string payloads", () => {
            const result = validateRequiredStringPayload("hello", {
                maxBytes: 100,
                maxBytesMessage: "text too large",
                paramName: "text",
            });

            expect(result).toStrictEqual([]);
        });

        it("returns max-byte errors for oversized payloads", () => {
            const result = validateRequiredStringPayload("x".repeat(20), {
                maxBytes: 10,
                maxBytesMessage: "text too large",
                paramName: "text",
            });

            expect(result).toStrictEqual(["text too large"]);
        });
    });

    describe("validateOptionalStringPayload behavior", () => {
        it("returns no errors for undefined payloads", () => {
            const result = validateOptionalStringPayload(undefined, {
                maxBytes: 100,
                maxBytesMessage: "preview too large",
                paramName: "preview",
            });

            expect(result).toStrictEqual([]);
        });

        it("returns optional-string errors for invalid non-string payloads", () => {
            const result = validateOptionalStringPayload(42, {
                maxBytes: 100,
                maxBytesMessage: "preview too large",
                paramName: "preview",
            });

            expect(result).toStrictEqual([
                "preview must be a non-empty string when provided",
            ]);
        });

        it("returns max-byte errors for oversized optional payloads", () => {
            const result = validateOptionalStringPayload("x".repeat(20), {
                maxBytes: 10,
                maxBytesMessage: "preview too large",
                paramName: "preview",
            });

            expect(result).toStrictEqual(["preview too large"]);
        });
    });

    describe("validateDiagnosticsPayloadPreview behavior", () => {
        it("uses shared optional payload validation semantics", () => {
            const result = validateDiagnosticsPayloadPreview("x".repeat(12), {
                maxBytes: 10,
                paramName: "payloadPreview",
            });

            expect(result).toStrictEqual(["payloadPreview exceeds 10 bytes"]);
        });
    });
});
