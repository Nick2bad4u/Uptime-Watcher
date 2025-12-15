/**
 * Coverage tests for IPC helper initialization error paths.
 *
 * @remarks
 * Several renderer services wrap `getIpcServiceHelpers` in a try/catch IIFE.
 * Those catch blocks are intentionally hard to hit in normal runtime, but they
 * still need coverage because they are part of our defensive error handling.
 */

import { describe, expect, it, vi } from "vitest";

describe("IPC service helper initialization failures", () => {
    it("surfaces CloudService helper initialization errors", async () => {
        vi.resetModules();
        vi.doMock("../../services/utils/createIpcServiceHelpers", () => ({
            getIpcServiceHelpers: () => {
                throw new Error("CloudService init failed");
            },
        }));

        await expect(
            import("../../services/CloudService")
        ).rejects.toThrowError("CloudService init failed");

        vi.doUnmock("../../services/utils/createIpcServiceHelpers");
    });

    it("surfaces DataService helper initialization errors", async () => {
        vi.resetModules();
        vi.doMock("../../services/utils/createIpcServiceHelpers", () => ({
            getIpcServiceHelpers: () => {
                throw new Error("DataService init failed");
            },
        }));

        await expect(import("../../services/DataService")).rejects.toThrowError(
            "DataService init failed"
        );

        vi.doUnmock("../../services/utils/createIpcServiceHelpers");
    });

    it("surfaces NotificationPreferenceService helper initialization errors", async () => {
        vi.resetModules();
        vi.doMock("../../services/utils/createIpcServiceHelpers", () => ({
            getIpcServiceHelpers: () => {
                throw new Error("NotificationPreferenceService init failed");
            },
        }));

        await expect(
            import("../../services/NotificationPreferenceService")
        ).rejects.toThrowError("NotificationPreferenceService init failed");

        vi.doUnmock("../../services/utils/createIpcServiceHelpers");
    });
});
