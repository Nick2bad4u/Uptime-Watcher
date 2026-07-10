/**
 * Tests IPC helper initialization error paths.
 *
 * @remarks
 * Renderer services initialize IPC helpers at module load time. Those error
 * paths are intentionally hard to hit in normal runtime, but they still need
 * behavior because they are part of our defensive error handling.
 */

import { describe, expect, it, vi } from "vitest";

describe("IPC service helper initialization failures", () => {
    it.each([
        {
            description: "surfaces CloudService helper initialization errors",
            errorMessage: "CloudService init failed",
            loadService: () => import("../../services/CloudService"),
        },
        {
            description: "surfaces DataService helper initialization errors",
            errorMessage: "DataService init failed",
            loadService: () => import("../../services/DataService"),
        },
        {
            description:
                "surfaces NotificationPreferenceService helper initialization errors",
            errorMessage: "NotificationPreferenceService init failed",
            loadService: () =>
                import("../../services/NotificationPreferenceService"),
        },
    ])("$description", async ({ errorMessage, loadService }) => {
        vi.resetModules();
        const helpersModule =
            await import("../../services/utils/createIpcServiceHelpers");
        const getHelpersSpy = vi
            .spyOn(helpersModule, "getIpcServiceHelpers")
            .mockImplementation(() => {
                throw new Error(errorMessage);
            });

        await expect(loadService()).rejects.toThrow(errorMessage);

        getHelpersSpy.mockRestore();
    });
});
