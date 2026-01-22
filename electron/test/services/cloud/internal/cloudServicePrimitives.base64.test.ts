import { describe, expect, it } from "vitest";

import {
    decodeCanonicalBase64,
    decodeStrictBase64,
    encodeBase64,
} from "@electron/services/cloud/internal/cloudServicePrimitives";

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
        ).toThrowError(/whitespace/i);
    });

    it("rejects base64 with invalid characters", () => {
        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "aGVsbG8@",
            })
        ).toThrowError(/invalid characters/i);
    });

    it("rejects base64 with invalid length", () => {
        expect(() =>
            decodeCanonicalBase64({
                label: "example",
                value: "aGVsbG8", // Missing padding
            })
        ).toThrowError(/multiple of 4/i);
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
        ).toThrowError(/expected 4 bytes/i);
    });
});
