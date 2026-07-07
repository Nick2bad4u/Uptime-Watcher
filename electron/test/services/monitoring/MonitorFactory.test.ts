/**
 * @file Tests for the public MonitorFactory API.
 */

import type { Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    IMonitorService,
    MonitorServiceConfig,
} from "../../../services/monitoring/types";

const loadMonitorFactory = async (): Promise<
    typeof import("../../../services/monitoring/MonitorFactory")
> => {
    vi.resetModules();
    return import("../../../services/monitoring/MonitorFactory");
};

describe("MonitorFactory", () => {
    let mockMonitorConfig: MonitorServiceConfig;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.doUnmock("../../../services/monitoring/MonitorTypeRegistry");
        mockMonitorConfig = {
            timeout: 5000,
            userAgent: "Test-Agent/1.0",
        };
    });

    describe("getMonitor", () => {
        it("gets a ping monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const { getMonitor } = await loadMonitorFactory();
            const monitor = getMonitor("ping", mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe("function");
        });

        it("gets an http monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const { getMonitor } = await loadMonitorFactory();
            const monitor = getMonitor("http", mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe("function");
        });

        it("gets a port monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const { getMonitor } = await loadMonitorFactory();
            const monitor = getMonitor("port", mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe("function");
        });

        it("rejects invalid monitor types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const { getMonitor } = await loadMonitorFactory();
            expect(() =>
                getMonitor("invalid" as never, mockMonitorConfig)
            ).toThrow(/Unsupported monitor type/v);
        });

        it("throws when configuration update fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const failingService: IMonitorService = {
                check: vi.fn(async () => ({
                    responseTime: 0,
                    status: "up" as const,
                })),
                getType: vi.fn(
                    () => "ping"
                ) as () => Site["monitors"][0]["type"],
                updateConfig: vi.fn(() => {
                    throw new Error("Configuration failure");
                }),
            };

            vi.resetModules();
            const registry =
                await vi.importActual<
                    typeof import("../../../services/monitoring/MonitorTypeRegistry")
                >("../../../services/monitoring/MonitorTypeRegistry");

            vi.doMock("../../../services/monitoring/MonitorTypeRegistry", () => ({
                ...registry,
                getMonitorServiceFactory: (type: string) => {
                    if (type === "ping") {
                        return () => failingService;
                    }

                    return registry.getMonitorServiceFactory(type);
                },
            }));

            const { getMonitor } = await import(
                "../../../services/monitoring/MonitorFactory"
            );

            expect(() => getMonitor("ping", mockMonitorConfig)).toThrow(
                /Failed to apply configuration/v
            );
        });

        it("does not re-apply config to cached instances unless forced", async () => {
            const { getMonitor } = await loadMonitorFactory();
            const instance = getMonitor("http", { timeout: 1000 });
            const updateSpy = vi.spyOn(instance, "updateConfig");
            updateSpy.mockClear();

            const cached = getMonitor("http", { timeout: 2000 });
            expect(cached).toBe(instance);
            expect(updateSpy).not.toHaveBeenCalled();

            const forced = getMonitor("http", { timeout: 2000 }, true);
            expect(forced).toBe(instance);
            expect(updateSpy).toHaveBeenCalledTimes(1);
        });
    });
});
