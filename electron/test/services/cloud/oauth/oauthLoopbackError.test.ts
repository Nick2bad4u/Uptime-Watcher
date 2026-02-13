import { describe, expect, it } from "vitest";

import { normalizeProviderOAuthLoopbackError } from "@electron/services/cloud/oauth/oauthLoopbackError";

describe(normalizeProviderOAuthLoopbackError, () => {
    it("maps state mismatches to provider-specific errors", () => {
        const normalized = normalizeProviderOAuthLoopbackError({
            error: new Error("OAuth state mismatch"),
            providerName: "Dropbox",
        });

        expect(normalized.message).toBe("Dropbox OAuth state mismatch");
    });

    it("maps callback details to provider-specific OAuth errors", () => {
        const normalized = normalizeProviderOAuthLoopbackError({
            error: new Error("OAuth callback error: access_denied"),
            providerName: "Google",
        });

        expect(normalized.message).toBe("Google OAuth error: access_denied");
    });

    it("maps timeouts to provider-specific timeout errors", () => {
        const normalized = normalizeProviderOAuthLoopbackError({
            error: new Error("OAuth loopback timeout"),
            providerName: "Dropbox",
        });

        expect(normalized.message).toBe("Dropbox OAuth timed out");
    });

    it("passes through unknown errors unchanged", () => {
        const normalized = normalizeProviderOAuthLoopbackError({
            error: new Error("unexpected error"),
            providerName: "Google",
        });

        expect(normalized.message).toBe("unexpected error");
    });
});
