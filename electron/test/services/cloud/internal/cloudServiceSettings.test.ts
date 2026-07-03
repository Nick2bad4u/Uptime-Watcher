import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

import { parseEpochMsSetting } from "../../../../services/cloud/internal/cloudServiceSettings";

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
            "1.5",
            "Infinity",
            "NaN",
            String(MAX_VALID_DATE_EPOCH_MS + 1),
        ]) {
            expect(parseEpochMsSetting(value)).toBeNull();
        }
    });
});
