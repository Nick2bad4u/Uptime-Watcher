 

import { beforeEach, describe, expect, it, vi } from "vitest";

import { MonitorFactory } from "../../../services/monitoring/MonitorFactory";
import { HttpMonitor } from "../../../services/monitoring/HttpMonitor";
import { PortMonitor } from "../../../services/monitoring/PortMonitor";
import { MonitorConfig } from "../../../services/monitoring/types";

// Mock the monitor classes
vi.mock("../../../services/monitoring/HttpMonitor");
vi.mock("../../../services/monitoring/PortMonitor");

describe("MonitorFactory", () => {
    const mockConfig: MonitorConfig = {
        timeout: 5000,
        userAgent: "Test Agent",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset static instances
        (MonitorFactory as any).httpMonitor = undefined;
        (MonitorFactory as any).portMonitor = undefined;
    });

    describe("getMonitor", () => {
        it("should create and return HTTP monitor for http type", () => {
            const monitor = MonitorFactory.getMonitor("http", mockConfig);

            expect(HttpMonitor).toHaveBeenCalledWith(mockConfig);
            expect(monitor).toBeInstanceOf(HttpMonitor);
        });

        it("should return same HTTP monitor instance on subsequent calls", () => {
            const monitor1 = MonitorFactory.getMonitor("http", mockConfig);
            const monitor2 = MonitorFactory.getMonitor("http", mockConfig);

            expect(HttpMonitor).toHaveBeenCalledTimes(1);
            expect(monitor1).toBe(monitor2);
        });

        it("should create and return Port monitor for port type", () => {
            const monitor = MonitorFactory.getMonitor("port", mockConfig);

            expect(PortMonitor).toHaveBeenCalledWith(mockConfig);
            expect(monitor).toBeInstanceOf(PortMonitor);
        });

        it("should return same Port monitor instance on subsequent calls", () => {
            const monitor1 = MonitorFactory.getMonitor("port", mockConfig);
            const monitor2 = MonitorFactory.getMonitor("port", mockConfig);

            expect(PortMonitor).toHaveBeenCalledTimes(1);
            expect(monitor1).toBe(monitor2);
        });

        it("should create monitors without config when none provided", () => {
            const httpMonitor = MonitorFactory.getMonitor("http");
            const portMonitor = MonitorFactory.getMonitor("port");

            expect(HttpMonitor).toHaveBeenCalledWith(undefined);
            expect(PortMonitor).toHaveBeenCalledWith(undefined);
            expect(httpMonitor).toBeInstanceOf(HttpMonitor);
            expect(portMonitor).toBeInstanceOf(PortMonitor);
        });

        it("should throw error for unsupported monitor type", () => {
            expect(() => {
                MonitorFactory.getMonitor("dns" as any, mockConfig);
            }).toThrow("Unsupported monitor type: dns");
        });
    });

    describe("updateConfig", () => {
        it("should update config for existing HTTP monitor", () => {
            const mockHttpMonitor = {
                updateConfig: vi.fn(),
            };
            (MonitorFactory as any).httpMonitor = mockHttpMonitor;

            MonitorFactory.updateConfig(mockConfig);

            expect(mockHttpMonitor.updateConfig).toHaveBeenCalledWith(mockConfig);
        });

        it("should update config for existing Port monitor", () => {
            const mockPortMonitor = {
                updateConfig: vi.fn(),
            };
            (MonitorFactory as any).portMonitor = mockPortMonitor;

            MonitorFactory.updateConfig(mockConfig);

            expect(mockPortMonitor.updateConfig).toHaveBeenCalledWith(mockConfig);
        });

        it("should update config for both monitors when both exist", () => {
            const mockHttpMonitor = {
                updateConfig: vi.fn(),
            };
            const mockPortMonitor = {
                updateConfig: vi.fn(),
            };
            (MonitorFactory as any).httpMonitor = mockHttpMonitor;
            (MonitorFactory as any).portMonitor = mockPortMonitor;

            MonitorFactory.updateConfig(mockConfig);

            expect(mockHttpMonitor.updateConfig).toHaveBeenCalledWith(mockConfig);
            expect(mockPortMonitor.updateConfig).toHaveBeenCalledWith(mockConfig);
        });

        it("should not throw error when no monitors exist", () => {
            expect(() => {
                MonitorFactory.updateConfig(mockConfig);
            }).not.toThrow();
        });
    });

    describe("getAvailableTypes", () => {
        it("should return all supported monitor types", () => {
            const types = MonitorFactory.getAvailableTypes();

            expect(types).toEqual(["http", "port"]);
        });

        it("should return the same array reference on multiple calls", () => {
            const types1 = MonitorFactory.getAvailableTypes();
            const types2 = MonitorFactory.getAvailableTypes();

            expect(types1).toEqual(types2);
        });
    });
});
