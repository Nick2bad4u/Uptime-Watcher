/**
 * Test suite for MonitorManager
 *
 * @module MonitorManager
 *
 * @file Comprehensive tests for monitoring service management in the Uptime
 *   Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Monitoring
 *
 * @tags ["monitor", "test", "management", "core"]
 */

import { MonitorManager } from "../../managers/MonitorManager";
import { vi, describe, beforeEach, it, expect } from "vitest";

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

    it("should construct without error", async ({ annotate, task }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorManager", "component");
            annotate("Category: Manager", "category");
            annotate("Type: Error Handling", "type");

        await annotate("Component: MonitorManager", "component");
        await annotate("Test Type: Unit - Constructor", "test-type");
        await annotate("Operation: Manager Instantiation", "operation");
        await annotate("Priority: Critical - Object Creation", "priority");
        await annotate(
            "Complexity: Low - Basic Constructor Test",
            "complexity"
        );
        await annotate(
            "Dependencies: Database, event emitter, services",
            "dependencies"
        );
        await annotate(
            "Purpose: Ensure MonitorManager can be instantiated properly",
            "purpose"
        );

        expect(manager).toBeDefined();
    });

    it("should get active monitor count (default 0)", async ({ annotate, task }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorManager", "component");
            annotate("Category: Manager", "category");
            annotate("Type: Data Retrieval", "type");

        await annotate("Component: MonitorManager", "component");
        await annotate("Test Type: Unit - State Query", "test-type");
        await annotate(
            "Operation: Active Monitor Count Retrieval",
            "operation"
        );
        await annotate("Priority: Medium - Status Monitoring", "priority");
        await annotate("Complexity: Low - Simple State Query", "complexity");
        await annotate(
            "Initial State: No active monitors at startup",
            "initial-state"
        );
        await annotate(
            "Purpose: Validate initial active monitor count is zero",
            "purpose"
        );

        expect(manager.getActiveMonitorCount()).toBe(0);
    });

    it("should return false for isMonitoringActive()", async ({ annotate, task }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorManager", "component");
            annotate("Category: Manager", "category");
            annotate("Type: Monitoring", "type");

        await annotate("Component: MonitorManager", "component");
        await annotate("Test Type: Unit - State Query", "test-type");
        await annotate(
            "Operation: Monitoring Active Status Check",
            "operation"
        );
        await annotate("Priority: Medium - Status Monitoring", "priority");
        await annotate("Complexity: Low - Boolean State Check", "complexity");
        await annotate(
            "Initial State: Monitoring is inactive at startup",
            "initial-state"
        );
        await annotate(
            "Purpose: Validate monitoring is inactive by default",
            "purpose"
        );

        expect(manager.isMonitoringActive()).toBe(false);
    });

    it("should call checkSiteManually and emit event", async ({ annotate, task }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: MonitorManager", "component");
            annotate("Category: Manager", "category");
            annotate("Type: Event Processing", "type");

        await annotate("Component: MonitorManager", "component");
        await annotate(
            "Test Type: Integration - Manual Check Flow",
            "test-type"
        );
        await annotate(
            "Operation: Manual Site Check with Event Emission",
            "operation"
        );
        await annotate(
            "Priority: Critical - Core Monitoring Functionality",
            "priority"
        );
        await annotate(
            "Complexity: High - Multi-Service Integration",
            "complexity"
        );
        await annotate(
            "Event Flow: Check monitor -> emit status update event",
            "event-flow"
        );
        await annotate(
            "Purpose: Validate manual site checking triggers proper event flow",
            "purpose"
        );

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
