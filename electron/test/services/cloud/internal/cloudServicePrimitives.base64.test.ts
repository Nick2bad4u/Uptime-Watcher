import {
    decodeCanonicalBase64,
    decodeStrictBase64,
    encodeBase64,
} from "@electron/services/cloud/internal/cloudServicePrimitives";
import { describe, expect, it, vi } from "vitest";

describe("cloudServicePrimitives base64", () => {
    it("decodes canonical base64", () => {
        const buffer = Buffer.from("hello", "utf8");
        const value = encodeBase64(buffer);

        expect(
            decodeCanonicalBase64({ label: "example", value }).toString("utf8")
        ).toBe("hello");
    });

    it("rejects base64 containing whitespace", () => {
        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "aGVsbG8=\n",
            })
        ).toThrow(/whitespace/i);
    });

    it("rejects base64 with invalid characters", () => {
        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "aGVsbG8@",
            })
        ).toThrow(/invalid characters/i);
    });

    it("rejects base64 with invalid length", () => {
        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "aGVsbG8", // Missing padding
            })
        ).toThrow(/multiple of 4/iv);
    });

    it("rejects non-canonical base64 aliases with non-zero padding bits", () => {
        expect(Buffer.from("AB==", "base64").toString("base64")).toBe("AA==");
        expect(Buffer.from("AAB=", "base64").toString("base64")).toBe("AAA=");

        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "AB==",
            })
        ).toThrow(/not canonical/i);

        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "AAB=",
            })
        ).toThrow(/not canonical/i);
    });

    it("decodeStrictBase64 enforces byte length", () => {
        const value = encodeBase64(
            Buffer.from([
                1,
                2,
                3,
            ])
        );
        expect(
            decodeStrictBase64({
                expectedBytes: 3,
                label: "salt",
                value,
            })
        ).toHaveLength(3);

        expect(() =>
            decodeStrictBase64({
                expectedBytes: 4,
                label: "salt",
                value,
            })
        ).toThrow(/expected 4 bytes/i);
    });

    it("decodeStrictBase64 rejects oversized values before decoding", () => {
        const oversizedValue = encodeBase64(Buffer.alloc(1024, 1));
        const fromSpy = vi.spyOn(Buffer, "from");

        try {
            expect(() =>
                decodeStrictBase64({
                    expectedBytes: 16,
                    label: "salt",
                    value: oversizedValue,
                })
            ).toThrow(/expected 16 bytes/i);

            expect(fromSpy).not.toHaveBeenCalled();
        } finally {
            fromSpy.mockRestore();
        }
    });
});
