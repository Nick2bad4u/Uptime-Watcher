import { describe, expect, it } from "vitest";

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
            { timestamp: Number.NaN },
            { timestamp: Number.NEGATIVE_INFINITY },
            { timestamp: 2500 },
        ]);

        expect(latest).toBe(2500);
    });
});
