/**
 * Tests for barrel export index files.
 * Validates that exports work correctly from index files.
 */

import { describe, expect, it } from "vitest";

describe("Barrel exports", () => {
    describe("Application services", () => {
        it("should export ApplicationService from index", async () => {
            const { ApplicationService } = await import("../services/application/index");
            expect(ApplicationService).toBeDefined();
            expect(typeof ApplicationService).toBe("function");
        });
    });

    describe("Database services", () => {
        it("should export all database services from index", async () => {
            const exports = await import("../services/database/index");

            expect(exports.DatabaseService).toBeDefined();
            expect(exports.SiteRepository).toBeDefined();
            expect(exports.MonitorRepository).toBeDefined();
            expect(exports.HistoryRepository).toBeDefined();
            expect(exports.SettingsRepository).toBeDefined();

            expect(typeof exports.DatabaseService).toBe("function");
            expect(typeof exports.SiteRepository).toBe("function");
            expect(typeof exports.MonitorRepository).toBe("function");
            expect(typeof exports.HistoryRepository).toBe("function");
            expect(typeof exports.SettingsRepository).toBe("function");
        });
    });

    describe("IPC services", () => {
        it("should export IpcService from index", async () => {
            const { IpcService } = await import("../services/ipc/index");
            expect(IpcService).toBeDefined();
            expect(typeof IpcService).toBe("function");
        });
    });

    describe("Monitoring services", () => {
        it("should export all monitoring services from index", async () => {
            const exports = await import("../services/monitoring/index");

            expect(exports.MonitorFactory).toBeDefined();
            expect(exports.MonitorScheduler).toBeDefined();

            expect(typeof exports.MonitorFactory).toBe("function");
            expect(typeof exports.MonitorScheduler).toBe("function");
        });
    });

    describe("Notification services", () => {
        it("should export NotificationService from index", async () => {
            const { NotificationService } = await import("../services/notifications/index");
            expect(NotificationService).toBeDefined();
            expect(typeof NotificationService).toBe("function");
        });
    });

    describe("Updater services", () => {
        it("should export AutoUpdaterService from index", async () => {
            const { AutoUpdaterService } = await import("../services/updater/index");
            expect(AutoUpdaterService).toBeDefined();
            expect(typeof AutoUpdaterService).toBe("function");
        });
    });

    describe("Window services", () => {
        it("should export WindowService from index", async () => {
            const { WindowService } = await import("../services/window/index");
            expect(WindowService).toBeDefined();
            expect(typeof WindowService).toBe("function");
        });
    });
});
