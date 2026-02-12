/**
 * @file Strict coverage tests for the Electron validated external-open helpers.
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

describe("validatedExternalOpen", () => {
    it("blocks non-https urls when requireHttps is enabled", async () => {
        const {
            EXTERNAL_OPEN_HTTPS_REQUIRED_REASON,
            validateExternalOpenUrlCandidateWithPolicy,
        } = await import("@electron/services/shell/validatedExternalOpen");

        const result = validateExternalOpenUrlCandidateWithPolicy(
            "http://example.com/path?token=secret",
            { requireHttps: true }
        );

        expect(result.ok).toBeFalsy();

        if (result.ok) {
            throw new Error("Expected rejection");
        }

        expect(result.reason).toBe(EXTERNAL_OPEN_HTTPS_REQUIRED_REASON);
        expect(result.safeUrlForLogging).toContain("http://example.com");
        expect(result.safeUrlForLogging).not.toContain("token=secret");
    });

    it("opens an allowed url via shell.openExternal", async () => {
        const { openExternalValidatedOrThrow } =
            await import("@electron/services/shell/validatedExternalOpen");

        await openExternalValidatedOrThrow({
            failureMessagePrefix: "Failed to open",
            rejectionVerbPhrase: "Rejected unsafe openExternal",
            url: "https://example.com/real?token=secret",
        });

        expect(openExternalMock).toHaveBeenCalledTimes(1);
        expect(openExternalMock).toHaveBeenCalledWith(
            "https://example.com/real?token=secret"
        );
    });

    it("returns a blocked outcome for disallowed urls", async () => {
        const { tryOpenExternalValidated } =
            await import("@electron/services/shell/validatedExternalOpen");

        const result = await tryOpenExternalValidated({
            failureMessagePrefix: "Failed to open",
            url: "ftp://example.com/path?token=secret",
        });

        expect(result.ok).toBeFalsy();
        if (result.ok) {
            throw new Error("Expected rejection");
        }

        expect(result.outcome).toBe("blocked");
        expect(result.safeUrlForLogging).not.toContain("token=secret");
    });

    it("returns open-failed outcome with stable metadata", async () => {
        openExternalMock.mockRejectedValueOnce(
            Object.assign(new Error("boom"), { code: "EPERM" })
        );

        const { tryOpenExternalValidated } =
            await import("@electron/services/shell/validatedExternalOpen");

        const result = await tryOpenExternalValidated({
            failureMessagePrefix: "Failed to open",
            url: "https://example.com/real?token=secret",
        });

        expect(result.ok).toBeFalsy();
        if (result.ok) {
            throw new Error("Expected open failure");
        }

        if (result.outcome !== "open-failed") {
            throw new Error(
                `Expected open-failed outcome, got ${result.outcome}`
            );
        }

        expect(result.errorName).toBe("Error");
        expect(result.errorCode).toBe("EPERM");
        expect(result.safeUrlForLogging).not.toContain("token=secret");
    });
});
