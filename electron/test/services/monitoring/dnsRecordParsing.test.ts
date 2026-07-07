import { describe, expect, it } from "vitest";

import { parseDnsResolutionResult } from "../../../services/monitoring/utils/dnsRecordParsing";

describe("dnsRecordParsing", () => {
    it("serializes DNS ANY records for display", () => {
        expect(
            parseDnsResolutionResult(
                [{ address: "192.0.2.1", ttl: 300, type: "A" }, "ignored"],
                "ANY"
            )
        ).toEqual({
            actualValues: ['{"address":"192.0.2.1","ttl":300,"type":"A"}'],
            details: "ANY records (1 items)",
            hasRecords: true,
            skipExpectedValueCheck: true,
        });
    });

    it("keeps DNS ANY parsing tolerant of unserializable record objects", () => {
        const circularRecord: Record<string, unknown> = { type: "TXT" };
        circularRecord["self"] = circularRecord;

        const parsed = parseDnsResolutionResult(
            [circularRecord, { serial: 123n }],
            "ANY"
        );

        expect(parsed).toEqual({
            actualValues: [
                "[unserializable DNS ANY record]",
                "[unserializable DNS ANY record]",
            ],
            details: "ANY records (2 items)",
            hasRecords: true,
            skipExpectedValueCheck: true,
        });
    });
});
