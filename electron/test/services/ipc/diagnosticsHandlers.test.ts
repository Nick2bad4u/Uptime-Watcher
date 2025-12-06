import { describe, expect, it } from "vitest";

import { DiagnosticsHandlerTestUtils } from "../../../services/ipc/handlers/diagnosticsHandlers";

describe("sanitizeDiagnosticsReport", () => {
    it("removes metadata that exceeds byte limits", () => {
        const largeValue = "x".repeat(5000);
        const timestamp = Date.now();
        const { metadataTruncated, sanitizedReport } =
            DiagnosticsHandlerTestUtils.normalizeDiagnosticsReportPayload({
                channel: "test-channel",
                guard: "exampleGuard",
                metadata: { details: largeValue },
                timestamp,
            });

        expect(metadataTruncated).toBeTruthy();
        expect(sanitizedReport.metadata).toBeUndefined();
    });

    it("truncates payload previews that exceed the byte budget", () => {
        const timestamp = Date.now();
        const preview = "Bearer abcdefghijklmnopqrstuvwxyz".repeat(2000);
        const { payloadPreviewTruncated, sanitizedReport } =
            DiagnosticsHandlerTestUtils.normalizeDiagnosticsReportPayload({
                channel: "test-channel",
                guard: "exampleGuard",
                payloadPreview: preview,
                timestamp,
            });

        expect(payloadPreviewTruncated).toBeTruthy();
        expect((sanitizedReport.payloadPreview ?? "").length).toBeLessThan(
            preview.length
        );
        expect(sanitizedReport.payloadPreview).not.toContain("Bearer ");
    });
});
