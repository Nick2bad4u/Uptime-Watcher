/**
 * @file Strict coverage tests for the Electron openExternal helpers.
 */

import { describe, expect, it, vi } from "vitest";

const openExternalMock = vi.fn<(url: string) => Promise<void>>(
    async () => undefined
);

vi.mock("electron", () => ({
    shell: {
        openExternal: openExternalMock,
    },
}));

describe("openExternalUtils", () => {
    it("returns an error-code suffix when a code exists", async () => {
        const { getElectronErrorCodeSuffix } =
            await import("@electron/services/shell/openExternalUtils");

        expect(getElectronErrorCodeSuffix({ code: "ENOENT" })).toBe(
            " (ENOENT)"
        );
        expect(getElectronErrorCodeSuffix({ code: "" })).toBe("");
        expect(getElectronErrorCodeSuffix({})).toBe("");
        expect(getElectronErrorCodeSuffix(null)).toBe("");
    });

    it("opens the normalized url via shell.openExternal", async () => {
        const { openExternalOrThrow } =
            await import("@electron/services/shell/openExternalUtils");

        await openExternalOrThrow({
            failureMessagePrefix: "Failed to open",
            normalizedUrl: "https://example.com/real?token=secret",
            safeUrlForLogging: "https://example.com/real?token=[redacted]",
        });

        expect(openExternalMock).toHaveBeenCalledTimes(1);
        expect(openExternalMock).toHaveBeenCalledWith(
            "https://example.com/real?token=secret"
        );
    });

    it("throws an error that never includes the raw url", async () => {
        openExternalMock.mockRejectedValueOnce(
            Object.assign(new Error("boom"), { code: "EPERM" })
        );

        const { openExternalOrThrow } =
            await import("@electron/services/shell/openExternalUtils");

        await expect(
            openExternalOrThrow({
                failureMessagePrefix: "Failed to open",
                normalizedUrl: "https://example.com/real?token=secret",
                safeUrlForLogging: "https://example.com/real?token=[redacted]",
            })
        ).rejects.toMatchObject({
            message: expect.stringContaining(
                "Failed to open: https://example.com/real?token=[redacted] (EPERM)"
            ),
        });

        try {
            await openExternalOrThrow({
                failureMessagePrefix: "Failed to open",
                normalizedUrl: "https://example.com/real?token=secret",
                safeUrlForLogging: "https://example.com/real?token=[redacted]",
            });
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).not.toContain("token=secret");
            expect((error as Error).cause).toBeInstanceOf(Error);
        }
    });
});
