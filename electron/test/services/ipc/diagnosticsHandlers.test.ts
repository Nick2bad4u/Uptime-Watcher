import { describe, expect, it } from "vitest";

import { getUtfByteLength } from "@shared/utils/utfByteLength";

import {
    MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES,
    MAX_DIAGNOSTICS_REPORT_GUARD_BYTES,
    MAX_DIAGNOSTICS_REPORT_REASON_BYTES,
} from "../../../services/ipc/diagnosticsLimits";
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

    it("sanitizes and bounds report identifiers and reasons", () => {
        const timestamp = Date.now();
        const { sanitizedReport } =
            DiagnosticsHandlerTestUtils.normalizeDiagnosticsReportPayload({
                channel: `diagnostics-channel?access_token=SUPER_SECRET\n${"c".repeat(1000)}`,
                guard: `payloadGuard\t${"g".repeat(1000)}`,
                reason: `refresh_token=SUPER_SECRET\n${"r".repeat(1000)}`,
                timestamp,
            });

        expect(sanitizedReport.channel).not.toContain("SUPER_SECRET");
        expect(sanitizedReport.channel).not.toContain("\n");
        expect(getUtfByteLength(sanitizedReport.channel)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES
        );
        expect(sanitizedReport.guard).not.toContain("\t");
        expect(getUtfByteLength(sanitizedReport.guard)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_GUARD_BYTES
        );
        expect(sanitizedReport.reason).not.toContain("SUPER_SECRET");
        expect(sanitizedReport.reason).not.toContain("\n");
        expect(
            getUtfByteLength(sanitizedReport.reason ?? "")
        ).toBeLessThanOrEqual(MAX_DIAGNOSTICS_REPORT_REASON_BYTES);
    });

    it("bounds multibyte report fields by UTF-8 byte length", () => {
        const timestamp = Date.now();
        const { sanitizedReport } =
            DiagnosticsHandlerTestUtils.normalizeDiagnosticsReportPayload({
                channel: "監視".repeat(500),
                guard: "検証".repeat(500),
                reason: "理由".repeat(500),
                timestamp,
            });

        expect(getUtfByteLength(sanitizedReport.channel)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES
        );
        expect(getUtfByteLength(sanitizedReport.guard)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_GUARD_BYTES
        );
        expect(
            getUtfByteLength(sanitizedReport.reason ?? "")
        ).toBeLessThanOrEqual(MAX_DIAGNOSTICS_REPORT_REASON_BYTES);
    });
});
