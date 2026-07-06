import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("getUtfByteLength", () => {
    it("matches Buffer UTF-8 byte lengths for ASCII, BMP, and astral text", async () => {
        const { getUtfByteLength } = await import("../../utils/utfByteLength");
        const value = "status: up 監視 🙂";

        expect(getUtfByteLength(value)).toBe(Buffer.byteLength(value, "utf8"));
    });

    it("uses exact manual UTF-8 counting when platform encoders are unavailable", async () => {
        vi.resetModules();
        vi.stubGlobal("TextEncoder", undefined);
        vi.stubGlobal("Buffer", undefined);

        const { getUtfByteLength } = await import("../../utils/utfByteLength");

        expect(getUtfByteLength("aé監🙂")).toBe(10);
    });
});
