import { describe, expect, it } from "vitest";

import { validateGuardReportPayload } from "@electron/services/ipc/validators/utils/guardReportValidation";

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
});
