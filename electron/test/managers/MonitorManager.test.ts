import { MonitorManager } from "../../managers/MonitorManager";
import { vi } from "vitest";

describe("MonitorManager", () => {
    let manager: MonitorManager;
    let dependencies: any;
    let enhancedServices: any;

    beforeEach(() => {
        dependencies = {
            databaseService: {
                /* mock */
            },
            eventEmitter: { emitTyped: vi.fn() },
            getHistoryLimit: () => 10,
            getSitesCache: () => ({ get: vi.fn(), set: vi.fn() }),
            repositories: {
                history: {},
                monitor: {},
                site: {},
            },
            siteService: {},
        };

        enhancedServices = {
            checker: {
                checkMonitor: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            },
            operationRegistry: {},
            statusUpdateService: {},
            timeoutManager: {},
        };

        manager = new MonitorManager(dependencies, enhancedServices);
    });

    it("should construct without error", () => {
        expect(manager).toBeDefined();
    });

    it("should get active monitor count (default 0)", () => {
        expect(manager.getActiveMonitorCount()).toBe(0);
    });

    it("should return false for isMonitoringActive()", () => {
        expect(manager.isMonitoringActive()).toBe(false);
    });

    it("should call checkSiteManually and emit event", async () => {
        const mockSite = {
            identifier: "site-1",
            name: "Test Site",
            monitoring: true,
            monitors: [
                { id: "monitor-1", type: "http", url: "https://test.com" },
            ],
        };

        const mockStatusUpdate = {
            siteIdentifier: "site-1",
            monitorId: "monitor-1",
            status: "up",
            timestamp: new Date().toISOString(),
        };

        dependencies.getSitesCache = () => ({ get: () => mockSite });
        dependencies.eventEmitter.emitTyped = vi.fn();

        // Mock the enhanced checker to return a result
        vi.mocked(enhancedServices.checker.checkMonitor).mockResolvedValue(
            mockStatusUpdate
        );

        const result = await manager.checkSiteManually("site-1", "monitor-1");

        expect(enhancedServices.checker.checkMonitor).toHaveBeenCalledWith(
            mockSite,
            "monitor-1",
            true
        );
        expect(dependencies.eventEmitter.emitTyped).toHaveBeenCalled();
        expect(result).toEqual(mockStatusUpdate);
    });
});
