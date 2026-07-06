import {
    MAX_VALID_DATE_EPOCH_MS,
    epochMsSchema,
} from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

import { calculateOAuthTokenExpiresAtEpochMs } from "../../../../services/cloud/providers/oauthTokenExpiry";

describe(calculateOAuthTokenExpiresAtEpochMs, () => {
    it("uses the provider expires_in value when present", () => {
        expect(
            calculateOAuthTokenExpiresAtEpochMs({
                expiresInSeconds: 120,
                nowEpochMs: 1000,
                providerName: "Provider",
            })
        ).toBe(121_000);
    });

    it("uses the OAuth default lifetime when expires_in is omitted", () => {
        expect(
            calculateOAuthTokenExpiresAtEpochMs({
                nowEpochMs: 1000,
                providerName: "Provider",
            })
        ).toBe(3_601_000);
    });

    it.each([
        Number.NaN,
        Infinity,
        -1,
        0,
    ])("rejects invalid expires_in value %s", (expiresInSeconds) => {
        expect(() =>
            calculateOAuthTokenExpiresAtEpochMs({
                expiresInSeconds,
                nowEpochMs: 1000,
                providerName: "Provider",
            })
        ).toThrow(/positive finite/u);
    });

    it("rejects expirations outside the supported Date range", () => {
        const latestSafeExpiresInSeconds = Math.floor(
            MAX_VALID_DATE_EPOCH_MS / 1000
        );

        expect(() =>
            calculateOAuthTokenExpiresAtEpochMs({
                expiresInSeconds: latestSafeExpiresInSeconds + 1,
                nowEpochMs: 1000,
                providerName: "Provider",
            })
        ).toThrow(/outside the supported Date range/u);
    });

    it("returns values accepted by the shared epoch schema", () => {
        const expiresAt = calculateOAuthTokenExpiresAtEpochMs({
            expiresInSeconds: 3600,
            nowEpochMs: Date.now(),
            providerName: "Provider",
        });

        expect(epochMsSchema.safeParse(expiresAt).success).toBeTruthy();
    });
});
