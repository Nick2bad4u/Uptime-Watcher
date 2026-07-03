import { type Monitor, STATUS_KIND } from "@shared/types";
import { describe, expect, it } from "vitest";

import {
    extractNestedFieldValue,
    normalizeResponseTime,
    normalizeTimestampValue,
    validateMonitorUrl,
} from "../../../../services/monitoring/shared/monitorServiceHelpers";

function createMonitorWithUrl(url: string): Monitor {
    return {
        checkInterval: 60_000,
        history: [],
        id: "m-test",
        monitoring: true,
        responseTime: 0,
        retryAttempts: 0,
        status: STATUS_KIND.UP,
        timeout: 10_000,
        type: "http",
        url,
    };
}

describe(validateMonitorUrl, () => {
    it("accepts http/https URLs", () => {
        expect(
            validateMonitorUrl(createMonitorWithUrl("https://example.com"))
        ).toBeNull();
        expect(
            validateMonitorUrl(
                createMonitorWithUrl("http://localhost:1234/health")
            )
        ).toBeNull();
    });

    it("rejects non-http protocols", () => {
        expect(
            validateMonitorUrl(createMonitorWithUrl("ftp://example.com"))
        ).not.toBeNull();
    });
});

describe(extractNestedFieldValue, () => {
    it("resolves dot-separated nested values", () => {
        expect(
            extractNestedFieldValue(
                {
                    details: {
                        status: {
                            code: "ok",
                        },
                    },
                },
                "details.status.code"
            )
        ).toBe("ok");
    });

    it("returns undefined for missing or blank paths", () => {
        expect(
            extractNestedFieldValue({ details: {} }, "details.missing")
        ).toBe(undefined);
        expect(extractNestedFieldValue({ details: {} }, " ".repeat(3))).toBe(
            undefined
        );
    });
});

describe(normalizeTimestampValue, () => {
    it("converts valid Date values to epoch milliseconds", () => {
        expect(
            normalizeTimestampValue(new Date("2025-01-02T03:04:05.000Z"))
        ).toBe(1_735_787_045_000);
    });

    it("rejects invalid Date values", () => {
        expect(normalizeTimestampValue(new Date(Number.NaN))).toBeUndefined();
    });

    it("normalizes numeric timestamp strings", () => {
        expect(normalizeTimestampValue("1735787045")).toBe(1_735_787_045_000);
        expect(normalizeTimestampValue("1735787045000")).toBe(
            1_735_787_045_000
        );
    });

    it("normalizes strict ISO timestamp strings", () => {
        expect(normalizeTimestampValue("2025-01-02T03:04:05.000Z")).toBe(
            1_735_787_045_000
        );
        expect(normalizeTimestampValue(" 2025-01-02T03:04:05.000Z ")).toBe(
            1_735_787_045_000
        );
    });

    it("rejects loose or impossible timestamp strings", () => {
        for (const value of [
            "",
            "2025-01-02",
            "January 2, 2025",
            "2026-02-30T00:00:00.000Z",
        ]) {
            expect(normalizeTimestampValue(value)).toBeUndefined();
        }
    });
});

describe(normalizeResponseTime, () => {
    it("rounds finite response times to non-negative milliseconds", () => {
        expect(normalizeResponseTime(12.6)).toBe(13);
        expect(normalizeResponseTime(-4.4)).toBe(0);
    });

    it("uses a normalized fallback for invalid response times", () => {
        expect(normalizeResponseTime(Number.NaN, 250.8)).toBe(251);
        expect(normalizeResponseTime(Infinity, -10)).toBe(0);
        expect(normalizeResponseTime("100", 75)).toBe(75);
    });
});
