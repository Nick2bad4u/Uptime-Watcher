import { fetchGoogleAccountLabel } from "@electron/services/cloud/providers/googleDrive/fetchGoogleAccountLabel";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe(fetchGoogleAccountLabel, () => {
    beforeEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("returns email when present", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ email: "me@example.com" }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchGoogleAccountLabel("token")).resolves.toBe(
            "me@example.com"
        );
        expect(fetchMock).toHaveBeenCalled();

        const call = fetchMock.mock.calls[0];
        expect(call?.[0]).toBe(
            "https://openidconnect.googleapis.com/v1/userinfo"
        );
        expect(call?.[1]).toEqual(
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer token",
                }),
                signal: expect.any(AbortSignal),
            })
        );
    });

    it("falls back to name when email missing", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ name: "Nick" }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchGoogleAccountLabel("token")).resolves.toBe("Nick");
    });

    it("compacts account label whitespace and control characters", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ email: "  me@example.com\n\t " }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchGoogleAccountLabel("token")).resolves.toBe(
            "me@example.com"
        );
    });

    it("bounds oversized account labels", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ name: "x".repeat(1000) }),
        });
        vi.stubGlobal("fetch", fetchMock);

        const label = await fetchGoogleAccountLabel("token");

        expect(label).toBeDefined();
        expect(label).toHaveLength(323);
        expect(label?.endsWith("...")).toBeTruthy();
    });

    it("returns undefined on non-ok response", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: false });
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchGoogleAccountLabel("token")).resolves.toBeUndefined();
    });

    it("returns undefined when the userinfo request times out", async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
            const { signal } = init ?? {};
            return new Promise((_resolve, reject) => {
                signal?.addEventListener(
                    "abort",
                    () => {
                        reject(signal.reason);
                    },
                    { once: true }
                );
            });
        });
        vi.stubGlobal("fetch", fetchMock);

        const labelPromise = fetchGoogleAccountLabel("token");

        await vi.advanceTimersByTimeAsync(5000);

        await expect(labelPromise).resolves.toBeUndefined();
    });
});
