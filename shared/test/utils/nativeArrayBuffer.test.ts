import { describe, expect, it, vi } from "vitest";

import {
    getNativeArrayBufferByteLength,
    isNativeArrayBuffer,
} from "../../utils/nativeArrayBuffer";

describe("nativeArrayBuffer helpers", () => {
    it("detects ArrayBuffers from the current realm", () => {
        const buffer = new ArrayBuffer(8);

        expect(isNativeArrayBuffer(buffer)).toBeTruthy();
        expect(getNativeArrayBufferByteLength(buffer)).toBe(8);
    });

    it("rejects objects that spoof ArrayBuffer shape", () => {
        const spoofed = {
            byteLength: 8,
            [Symbol.toStringTag]: "ArrayBuffer",
        };

        expect(isNativeArrayBuffer(spoofed)).toBeFalsy();
        expect(getNativeArrayBufferByteLength(spoofed)).toBeUndefined();
    });

    it("rejects objects that inherit from ArrayBuffer.prototype without native slots", () => {
        const spoofed = Object.create(ArrayBuffer.prototype) as ArrayBuffer;

        expect(spoofed).toBeInstanceOf(ArrayBuffer);
        expect(isNativeArrayBuffer(spoofed)).toBeFalsy();
        expect(getNativeArrayBufferByteLength(spoofed)).toBeUndefined();
    });

    it("does not invoke shadowed byteLength accessors", () => {
        const buffer = new ArrayBuffer(4);
        const byteLength = vi.fn(() => {
            throw new Error("shadowed byteLength should not run");
        });
        Object.defineProperty(buffer, "byteLength", {
            configurable: true,
            get: byteLength,
        });

        expect(getNativeArrayBufferByteLength(buffer)).toBe(4);
        expect(byteLength).not.toHaveBeenCalled();
    });

    it("does not invoke patched ArrayBuffer prototype byteLength", () => {
        const byteLength = vi.spyOn(ArrayBuffer.prototype, "byteLength", "get");
        byteLength.mockImplementation(() => {
            throw new Error("ArrayBuffer prototype byteLength should not run");
        });

        try {
            expect(getNativeArrayBufferByteLength(new ArrayBuffer(4))).toBe(4);
            expect(byteLength).not.toHaveBeenCalled();
        } finally {
            byteLength.mockRestore();
        }
    });
});
