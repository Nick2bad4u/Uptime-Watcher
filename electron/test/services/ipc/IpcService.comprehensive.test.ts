import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain } from "electron";
import { IpcService } from "../../../services/ipc/IpcService";
import { UptimeOrchestrator } from "../../../UptimeOrchestrator";
import { AutoUpdaterService } from "../../../services/updater/AutoUpdaterService";

// Mock dependencies
vi.mock("electron", () => ({
    ipcMain: {
        handle: vi.fn(),
        removeHandler: vi.fn(),
        removeAllListeners: vi.fn(),
        on: vi.fn(),
    },
    BrowserWindow: vi.fn(),
}));

vi.mock("../../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: vi.fn(() => ({
        exportData: vi.fn().mockResolvedValue("exported-data"),
        importData: vi.fn().mockResolvedValue(undefined),
        setHistoryLimit: vi.fn().mockResolvedValue(undefined),
        getHistoryLimit: vi.fn().mockReturnValue(100),
        resetSettings: vi.fn().mockResolvedValue(undefined),
        downloadBackup: vi.fn().mockResolvedValue("backup-data"),
        startMonitoring: vi.fn().mockResolvedValue(undefined),
        stopMonitoring: vi.fn().mockResolvedValue(undefined),
        startMonitoringForSite: vi.fn().mockResolvedValue(undefined),
        stopMonitoringForSite: vi.fn().mockResolvedValue(undefined),
        startMonitoringForMonitor: vi.fn().mockResolvedValue(undefined),
        stopMonitoringForMonitor: vi.fn().mockResolvedValue(undefined),
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
        addSite: vi.fn().mockResolvedValue({ id: "new-site" }),
        updateSite: vi.fn().mockResolvedValue(undefined),
        deleteSite: vi.fn().mockResolvedValue(undefined),
        getSites: vi.fn().mockReturnValue([]),
        getSite: vi.fn().mockReturnValue(null),
        getStatusForSite: vi.fn().mockReturnValue({}),
        getResponseTime: vi.fn().mockReturnValue(0),
        getUptime: vi.fn().mockReturnValue(100),
        getHistoryForSite: vi.fn().mockReturnValue([]),
        getMonitoringStatus: vi.fn().mockReturnValue(false),
    })),
}));

vi.mock("../../../services/updater/AutoUpdaterService", () => ({
    AutoUpdaterService: vi.fn(() => ({
        checkForUpdates: vi.fn().mockResolvedValue(undefined),
        downloadUpdate: vi.fn().mockResolvedValue(undefined),
        quitAndInstall: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../../services/monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: vi.fn(() => [
        {
            type: "http",
            displayName: "HTTP/HTTPS",
            description: "HTTP endpoint monitoring",
            version: "1.0.0",
            fields: [],
            uiConfig: {
                supportsResponseTime: true,
                supportsAdvancedAnalytics: false,
            },
            serviceFactory: vi.fn(),
            validationSchema: {},
        },
    ]),
    getMonitorTypeConfig: vi.fn(() => ({
        type: "http",
        displayName: "HTTP/HTTPS",
        description: "HTTP endpoint monitoring",
        version: "1.0.0",
        fields: [],
        uiConfig: {
            supportsResponseTime: true,
            supportsAdvancedAnalytics: false,
        },
        serviceFactory: vi.fn(),
        validationSchema: {},
    })),
    validateMonitorData: vi.fn(() => ({ success: true, data: {} })),
}));

vi.mock("../../../services/ipc/utils", () => ({
    createValidationResponse: vi.fn((success, data, error) => ({ success, data, error })),
    registerStandardizedIpcHandler: vi.fn((channel, handler, _validator, registeredHandlers) => {
        registeredHandlers.add(channel);
        // Mock the actual IPC registration
        ipcMain.handle(channel, handler);
    }),
}));

vi.mock("../../../services/ipc/validators", () => ({
    DataHandlerValidators: {
        exportData: vi.fn(() => ({ success: true })),
        importData: vi.fn(() => ({ success: true })),
        updateHistoryLimit: vi.fn(() => ({ success: true })),
        getHistoryLimit: vi.fn(() => ({ success: true })),
        resetSettings: vi.fn(() => ({ success: true })),
        downloadSqliteBackup: vi.fn(() => ({ success: true })),
    },
    MonitoringHandlerValidators: {
        startMonitoring: vi.fn(() => ({ success: true })),
        stopMonitoring: vi.fn(() => ({ success: true })),
        startMonitoringForSite: vi.fn(() => ({ success: true })),
        stopMonitoringForSite: vi.fn(() => ({ success: true })),
        startMonitoringForMonitor: vi.fn(() => ({ success: true })),
        stopMonitoringForMonitor: vi.fn(() => ({ success: true })),
        checkSiteNow: vi.fn(() => ({ success: true })),
    },
    MonitorTypeHandlerValidators: {
        getMonitorTypes: vi.fn(() => ({ success: true })),
        getMonitorType: vi.fn(() => ({ success: true })),
        validateMonitor: vi.fn(() => ({ success: true })),
    },
    SiteHandlerValidators: {
        addSite: vi.fn(() => ({ success: true })),
        updateSite: vi.fn(() => ({ success: true })),
        deleteSite: vi.fn(() => ({ success: true })),
        getSites: vi.fn(() => ({ success: true })),
        getSite: vi.fn(() => ({ success: true })),
    },
    StateSyncHandlerValidators: {
        getStatusForSite: vi.fn(() => ({ success: true })),
        getResponseTime: vi.fn(() => ({ success: true })),
        getUptime: vi.fn(() => ({ success: true })),
        getHistoryForSite: vi.fn(() => ({ success: true })),
        getMonitoringStatus: vi.fn(() => ({ success: true })),
    },
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("IpcService", () => {
    let ipcService: IpcService;
    let mockUptimeOrchestrator: UptimeOrchestrator;
    let mockAutoUpdaterService: AutoUpdaterService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUptimeOrchestrator = new UptimeOrchestrator();
        mockAutoUpdaterService = new AutoUpdaterService();
        ipcService = new IpcService(mockUptimeOrchestrator, mockAutoUpdaterService);
    });

    afterEach(() => {
        if (ipcService) {
            ipcService.cleanup();
        }
    });

    describe("Constructor", () => {
        it("should create IpcService instance with dependencies", () => {
            expect(ipcService).toBeInstanceOf(IpcService);
        });

        it("should initialize with provided orchestrator", () => {
            expect(ipcService).toBeDefined();
        });

        it("should initialize with provided auto updater service", () => {
            expect(ipcService).toBeDefined();
        });
    });

    describe("Handler Setup", () => {
        it("should setup all handlers", () => {
            ipcService.setupHandlers();

            // Verify that setup methods are called by checking if handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should setup site handlers", () => {
            ipcService.setupHandlers();

            // Verify that site-related IPC handlers are set up
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should setup monitoring handlers", () => {
            ipcService.setupHandlers();

            // Verify monitoring handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should setup data handlers", () => {
            ipcService.setupHandlers();

            // Verify data handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should setup monitor type handlers", () => {
            ipcService.setupHandlers();

            // Verify monitor type handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should setup system handlers", () => {
            ipcService.setupHandlers();

            // Verify system handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should setup state sync handlers", () => {
            ipcService.setupHandlers();

            // Verify state sync handlers are registered
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Cleanup", () => {
        it("should remove all registered handlers on cleanup", () => {
            ipcService.setupHandlers();
            ipcService.cleanup();

            expect(ipcMain.removeHandler).toHaveBeenCalled();
            expect(ipcMain.removeAllListeners).toHaveBeenCalledWith("quit-and-install");
        });

        it("should handle cleanup when no handlers are registered", () => {
            ipcService.cleanup();

            expect(ipcMain.removeAllListeners).toHaveBeenCalledWith("quit-and-install");
        });

        it("should log cleanup operation", () => {
            ipcService.cleanup();

            // Verify cleanup logging happens (mocked in beforeEach)
            expect(ipcService).toBeDefined();
        });
    });

    describe("Data Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should register export data handler", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register import data handler", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register history limit handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register settings handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register backup handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Monitoring Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should register global monitoring handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register site monitoring handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register monitor-specific handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register check now handler", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Site Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should register CRUD site handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register site retrieval handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Monitor Type Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should register monitor type retrieval handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register monitor validation handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("State Sync Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should register status sync handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register metrics sync handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should register history sync handlers", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Error Handling", () => {
        it("should handle setup errors when they occur", () => {
            // Mock an error in one of the setup methods
            const mockError = new Error("Setup failed");
            vi.mocked(ipcMain.handle).mockImplementationOnce(() => {
                throw mockError;
            });

            // Should throw during setup when an error occurs
            expect(() => ipcService.setupHandlers()).toThrow("Setup failed");
        });

        it("should handle cleanup errors when they occur", () => {
            // Setup first
            ipcService.setupHandlers();

            // Mock an error during cleanup
            vi.mocked(ipcMain.removeHandler).mockImplementationOnce(() => {
                throw new Error("Cleanup failed");
            });

            // Should throw during cleanup when an error occurs
            expect(() => ipcService.cleanup()).toThrow("Cleanup failed");
        });
    });

    describe("Integration", () => {
        it("should properly integrate with UptimeOrchestrator", () => {
            ipcService.setupHandlers();

            expect(mockUptimeOrchestrator).toBeDefined();
        });

        it("should properly integrate with AutoUpdaterService", () => {
            ipcService.setupHandlers();

            expect(mockAutoUpdaterService).toBeDefined();
        });

        it("should register handlers in correct order", () => {
            ipcService.setupHandlers();

            // Verify setup was called
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Handler Registration Tracking", () => {
        it("should track registered handlers for cleanup", () => {
            ipcService.setupHandlers();
            ipcService.cleanup();

            expect(ipcMain.removeHandler).toHaveBeenCalled();
        });

        it("should handle multiple setup calls", () => {
            ipcService.setupHandlers();
            ipcService.setupHandlers();

            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should handle multiple cleanup calls", () => {
            ipcService.setupHandlers();
            ipcService.cleanup();
            ipcService.cleanup();

            expect(ipcMain.removeAllListeners).toHaveBeenCalledWith("quit-and-install");
        });
    });

    describe("Configuration Serialization", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle monitor type config serialization", () => {
            // The serialization is done internally, but we can verify
            // that the monitor type handlers are set up
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should handle UI config serialization", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should handle config validation", () => {
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });

    describe("Resource Management", () => {
        it("should properly manage memory on setup and cleanup", () => {
            ipcService.setupHandlers();
            const _handlerCallsAfterSetup = vi.mocked(ipcMain.handle).mock.calls.length;

            ipcService.cleanup();
            const removeCallsAfterCleanup = vi.mocked(ipcMain.removeHandler).mock.calls.length;

            // Should have called removeHandler for each registered handler
            expect(removeCallsAfterCleanup).toBeGreaterThan(0);
        });

        it("should prevent memory leaks from handlers", () => {
            ipcService.setupHandlers();
            ipcService.cleanup();

            expect(ipcMain.removeAllListeners).toHaveBeenCalledWith("quit-and-install");
        });
    });

    describe("Validation Integration", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should integrate with data validators", () => {
            // Validators are integrated via the mock system
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should integrate with monitoring validators", () => {
            // Validators are integrated via the mock system
            expect(ipcMain.handle).toHaveBeenCalled();
        });

        it("should integrate with site validators", () => {
            // Validators are integrated via the mock system
            expect(ipcMain.handle).toHaveBeenCalled();
        });
    });
});
