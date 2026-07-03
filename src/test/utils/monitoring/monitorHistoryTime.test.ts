import { describe, expect, it } from "vitest";

import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";

import { getLatestHistoryTimestamp } from "../../../utils/monitoring/monitorHistoryTime";

describe(getLatestHistoryTimestamp, () => {
    it("returns undefined for empty history", () => {
        expect(getLatestHistoryTimestamp([])).toBeUndefined();
    });

    it("returns the latest finite timestamp even when history is unsorted", () => {
        const latest = getLatestHistoryTimestamp([
            { timestamp: 1000 },
            { timestamp: 5000 },
            { timestamp: 2000 },
        ]);

        expect(latest).toBe(5000);
    });

    it("ignores non-finite timestamp entries", () => {
        const latest = getLatestHistoryTimestamp([
            { timestamp: NaN },
            { timestamp: Number.NEGATIVE_INFINITY },
            { timestamp: 2500 },
        ]);

        expect(latest).toBe(2500);
    });

    it("ignores timestamps outside the supported Date range", () => {
        const latest = getLatestHistoryTimestamp([
            { timestamp: 2500 },
            { timestamp: MAX_VALID_DATE_EPOCH_MS + 1 },
            { timestamp: 5000 },
        ]);

        expect(latest).toBe(5000);
    });

    it("ignores fractional timestamps", () => {
        const latest = getLatestHistoryTimestamp([
            { timestamp: 2500 },
            { timestamp: 5000.5 },
            { timestamp: 5000 },
        ]);

        expect(latest).toBe(5000);
    });
});
