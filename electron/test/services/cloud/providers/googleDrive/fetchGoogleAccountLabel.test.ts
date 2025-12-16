import { describe, expect, it, vi, beforeEach } from "vitest";

import { fetchGoogleAccountLabel } from "@electron/services/cloud/providers/googleDrive/fetchGoogleAccountLabel";

describe(fetchGoogleAccountLabel, () => {
    beforeEach(() => {
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
    });

    it("falls back to name when email missing", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ name: "Nick" }),
        });
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchGoogleAccountLabel("token")).resolves.toBe("Nick");
    });

    it("returns undefined on non-ok response", async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: false });
        vi.stubGlobal("fetch", fetchMock);

        await expect(fetchGoogleAccountLabel("token")).resolves.toBeUndefined();
    });
});
