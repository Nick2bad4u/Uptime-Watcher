import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it, vi } from "vitest";

import {
    parseEpochMsSetting,
    SETTINGS_KEY_LAST_ERROR,
    setLastError,
} from "@electron/services/cloud/internal/cloudServiceSettings";

describe(parseEpochMsSetting, () => {
    it("parses valid persisted epoch millisecond values", () => {
        expect(parseEpochMsSetting("0")).toBe(0);
        expect(parseEpochMsSetting("1700000000000")).toBe(1_700_000_000_000);
        expect(parseEpochMsSetting(String(MAX_VALID_DATE_EPOCH_MS))).toBe(
            MAX_VALID_DATE_EPOCH_MS
        );
    });

    it("returns null for absent or invalid timestamp settings", () => {
        for (const value of [
            undefined,
            "",
            " ",
            "-1",
            "+1",
            "1.5",
            "1e3",
            "0x10",
            "0b10",
            "Infinity",
            "NaN",
            String(MAX_VALID_DATE_EPOCH_MS + 1),
        ]) {
            expect(parseEpochMsSetting(value)).toBeNull();
        }
    });
});

describe(setLastError, () => {
    it("normalizes persisted cloud errors before writing settings", async () => {
        const set = vi.fn<Parameters<typeof setLastError>[0]["set"]>();

        await setLastError(
            {
                get: vi.fn(),
                set,
            },
            `refresh_token=SUPER_SECRET_TOKEN&status=failed\n\t${"x".repeat(1200)}`
        );

        expect(set).toHaveBeenCalledWith(
            SETTINGS_KEY_LAST_ERROR,
            expect.stringContaining("refresh_token=[redacted]&status=failed")
        );
        const persisted = set.mock.calls[0]?.[1];
        expect(persisted).toBeDefined();
        expect(persisted).not.toContain("SUPER_SECRET_TOKEN");
        expect(persisted).not.toContain("\n");
        expect(persisted).not.toContain("\t");
        expect(persisted?.endsWith("...")).toBeTruthy();
        expect(persisted?.length).toBeLessThanOrEqual(1003);
    });
});
