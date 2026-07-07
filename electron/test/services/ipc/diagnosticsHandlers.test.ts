import { beforeEach, describe, expect, it, vi } from "vitest";

import { DIAGNOSTICS_CHANNELS } from "@shared/types/preload";

import { getUtfByteLength } from "@shared/utils/utfByteLength";

import type { TypedEventBus } from "../../../events/TypedEventBus";

import {
    MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES,
    MAX_DIAGNOSTICS_REPORT_GUARD_BYTES,
    MAX_DIAGNOSTICS_REPORT_REASON_BYTES,
} from "../../../services/ipc/diagnosticsLimits";
import { registerDiagnosticsHandlers } from "../../../services/ipc/handlers/diagnosticsHandlers";

const { mockIpcMain, mockLogger } = vi.hoisted(() => ({
    mockIpcMain: {
        handle: vi.fn(),
    },
    mockLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("electron", () => ({
    ipcMain: mockIpcMain,
}));

vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => true),
}));

vi.mock("../../../utils/logger", () => ({
    diagnosticsLogger: mockLogger,
    logger: mockLogger,
}));

const createTrustedIpcEvent = () => ({
    senderFrame: {
        isDestroyed: () => false,
        url: "http://localhost:5173/index.html",
    },
});

const createDiagnosticsHandlerHarness = () => {
    const emitTyped = vi.fn().mockResolvedValue(undefined);
    const eventEmitter = {
        emitTyped,
    } as unknown as TypedEventBus<any>;

    registerDiagnosticsHandlers({
        eventEmitter,
        registeredHandlers: new Set(),
    });

    const reportEntry = mockIpcMain.handle.mock.calls.find(
        ([channel]) => channel === DIAGNOSTICS_CHANNELS.reportPreloadGuard
    );

    expect(reportEntry).toBeDefined();

    return {
        emitTyped,
        eventEmitter,
        reportHandler: reportEntry?.[1] as (
            event: ReturnType<typeof createTrustedIpcEvent>,
            payload: unknown
        ) => Promise<{ success: boolean }>,
    };
};

describe("sanitizeDiagnosticsReport", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("preserves metadata within byte limits", async () => {
        const { eventEmitter, reportHandler } =
            createDiagnosticsHandlerHarness();
        const metadataValue = "x".repeat(100);
        const timestamp = Date.now();

        const result = await reportHandler(createTrustedIpcEvent(), {
            channel: "test-channel",
            guard: "exampleGuard",
            metadata: { details: metadataValue },
            timestamp,
        });

        expect(result.success).toBeTruthy();
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "diagnostics:report-created",
            expect.objectContaining({
                channel: "test-channel",
                guard: "exampleGuard",
                metadataTruncated: false,
            })
        );
    });

    it("preserves payload previews within the byte budget", async () => {
        const { eventEmitter, reportHandler } =
            createDiagnosticsHandlerHarness();
        const timestamp = Date.now();
        const preview = "payload-preview".repeat(100);

        const result = await reportHandler(createTrustedIpcEvent(), {
            channel: "test-channel",
            guard: "exampleGuard",
            payloadPreview: preview,
            timestamp,
        });

        expect(result.success).toBeTruthy();
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "diagnostics:report-created",
            expect.objectContaining({
                payloadPreviewLength: preview.length,
                payloadPreviewTruncated: false,
            })
        );
    });

    it("sanitizes and bounds report identifiers and reasons", async () => {
        const { emitTyped, reportHandler } = createDiagnosticsHandlerHarness();
        const timestamp = Date.now();
        const result = await reportHandler(createTrustedIpcEvent(), {
            channel: "diagnostics-channel?access_token=SUPER_SECRET\nstatus",
            guard: "payloadGuard\tvalue",
            reason: "refresh_token=SUPER_SECRET\npayload-validation",
            timestamp,
        });

        expect(result.success).toBeTruthy();
        expect(emitTyped).toHaveBeenCalledOnce();

        const [, emittedReport] = emitTyped.mock.calls[0] ?? [];
        expect(emittedReport.channel).not.toContain("SUPER_SECRET");
        expect(emittedReport.channel).not.toContain("\n");
        expect(getUtfByteLength(emittedReport.channel)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES
        );
        expect(emittedReport.guard).not.toContain("\t");
        expect(getUtfByteLength(emittedReport.guard)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_GUARD_BYTES
        );
        expect(emittedReport.reason).not.toContain("SUPER_SECRET");
        expect(emittedReport.reason).not.toContain("\n");
        expect(
            getUtfByteLength(emittedReport.reason ?? "")
        ).toBeLessThanOrEqual(MAX_DIAGNOSTICS_REPORT_REASON_BYTES);
    });

    it("bounds multibyte report fields by UTF-8 byte length", async () => {
        const { emitTyped, reportHandler } = createDiagnosticsHandlerHarness();
        const timestamp = Date.now();
        const result = await reportHandler(createTrustedIpcEvent(), {
            channel: "監視".repeat(40),
            guard: "検証".repeat(20),
            reason: "理由".repeat(80),
            timestamp,
        });

        expect(result.success).toBeTruthy();
        expect(emitTyped).toHaveBeenCalledOnce();

        const [, emittedReport] = emitTyped.mock.calls[0] ?? [];

        expect(getUtfByteLength(emittedReport.channel)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_CHANNEL_BYTES
        );
        expect(getUtfByteLength(emittedReport.guard)).toBeLessThanOrEqual(
            MAX_DIAGNOSTICS_REPORT_GUARD_BYTES
        );
        expect(
            getUtfByteLength(emittedReport.reason ?? "")
        ).toBeLessThanOrEqual(MAX_DIAGNOSTICS_REPORT_REASON_BYTES);
    });
});
