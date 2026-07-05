import { describe, expect, it } from "vitest";

import { validateGuardReportPayload } from "@electron/services/ipc/validators/utils/guardReportValidation";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";

const limits = {
    maxChannelBytes: 8,
    maxGuardBytes: 8,
    maxMetadataBytes: 128,
    maxPayloadPreviewBytes: 128,
    maxReasonBytes: 8,
} as const;

describe(validateGuardReportPayload, () => {
    it("rejects oversized diagnostics identifiers and reasons", () => {
        const result = validateGuardReportPayload(
            {
                channel: "channel-too-long",
                guard: "guard-too-long",
                reason: "reason-too-long",
                timestamp: Date.now(),
            },
            limits
        );

        expect(result).toStrictEqual([
            "channel exceeds 8 bytes",
            "guard exceeds 8 bytes",
            "reason exceeds 8 bytes",
        ]);
    });

    it("rejects diagnostics timestamps outside epoch millisecond bounds", () => {
        for (const timestamp of [
            -1,
            1.5,
            Number.MAX_SAFE_INTEGER,
            MAX_VALID_DATE_EPOCH_MS + 1,
        ]) {
            const result = validateGuardReportPayload(
                {
                    channel: "channel",
                    guard: "guard",
                    timestamp,
                },
                limits
            );

            expect(result).toStrictEqual([
                "timestamp must be a valid epoch millisecond timestamp",
            ]);
        }
    });
});
