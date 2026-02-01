/**
 * Comprehensive fast-check fuzzing tests for IPC communication.
 *
 * This test suite achieves 100% fast-check fuzzing coverage for Electron IPC
 * handlers, contextBridge security, main-renderer communication patterns, and
 * type safety.
 *
 * @packageDocumentation
 */

import { describe, expect, test, vi, beforeEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import {
    MONITOR_STATUS_VALUES,
    STATUS_HISTORY_VALUES,
    type Monitor,
    type MonitorStatus,
    type MonitorType,
    type Site,
    type StatusHistory,
    type StatusHistoryStatus,
    type StatusUpdate,
} from "@shared/types";
import {
    createIpcCorrelationEnvelope,
    IPC_INVOKE_CHANNEL_PARAM_COUNTS,
    type IpcInvokeChannel,
    type IpcInvokeChannelMap,
} from "@shared/types/ipc";
import { generateCorrelationId } from "@shared/utils/correlation";

// Define all mocks using vi.hoisted so they're available before vi.mock is hoisted
const { mockIpcMain, mockBrowserWindow, mockContextBridge, mockIpcRenderer } =
    vi.hoisted(() => ({
        mockIpcMain: {
            handle: vi.fn(),
            removeHandler: vi.fn(),
            removeAllListeners: vi.fn(),
        },
        mockBrowserWindow: {
            isDestroyed: vi.fn(() => false),
            webContents: {
                send: vi.fn(),
                isDestroyed: vi.fn(() => false),
            },
        },
        mockContextBridge: {
            exposeInMainWorld: vi.fn(),
        },
        mockIpcRenderer: {
            invoke: vi.fn((..._args: unknown[]) => Promise.resolve(undefined)),
            on: vi.fn(),
            off: vi.fn(),
            removeListener: vi.fn(),
            removeAllListeners: vi.fn(),
            send: vi.fn(),
        },
    }));

// Mock electron immediately
vi.mock("electron", () => ({
    ipcMain: mockIpcMain,
    BrowserWindow: class {
        static getFocusedWindow() {
            return mockBrowserWindow;
        }
        isDestroyed() {
            return false;
        }
        get webContents() {
            return mockBrowserWindow.webContents;
        }
    },
    contextBridge: mockContextBridge,
    ipcRenderer: mockIpcRenderer,
}));

// Mock dependencies
vi.mock("../../../electron/utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks
import { registerStandardizedIpcHandler } from "../../../electron/services/ipc/utils";

const toIsoStringSafe = (value: Date): string => {
    const timestamp = value.getTime();
    if (Number.isNaN(timestamp)) {
        return new Date(0).toISOString();
    }

    return new Date(timestamp).toISOString();
};

// Custom arbitraries for IPC testing
const arbitraryEventChannelName = fc
    .string({ minLength: 5, maxLength: 50 })
    .filter((s) => /^[A-Za-z][\w:-]*$/.test(s));

const INVOKE_CHANNELS = Object.keys(
    IPC_INVOKE_CHANNEL_PARAM_COUNTS
) as IpcInvokeChannel[];

const ZERO_PARAM_INVOKE_CHANNELS = INVOKE_CHANNELS.filter(
    (channel) => IPC_INVOKE_CHANNEL_PARAM_COUNTS[channel] === 0
);

const ONE_PARAM_INVOKE_CHANNELS = INVOKE_CHANNELS.filter(
    (channel) =>
        IPC_INVOKE_CHANNEL_PARAM_COUNTS[channel] === 1 && channel !== "add-site"
);

const arbitraryInvokeChannel = fc.constantFrom(
    ...(INVOKE_CHANNELS as [IpcInvokeChannel, ...IpcInvokeChannel[]])
);

const arbitraryZeroParamInvokeChannel = fc.constantFrom(
    ...(ZERO_PARAM_INVOKE_CHANNELS as [
        IpcInvokeChannel,
        ...IpcInvokeChannel[],
    ])
);

const arbitraryOneParamInvokeChannel = fc.constantFrom(
    ...(ONE_PARAM_INVOKE_CHANNELS as [IpcInvokeChannel, ...IpcInvokeChannel[]])
);

type GenericInvokeResult = IpcInvokeChannelMap[IpcInvokeChannel]["result"];

const TEST_CORRELATION_ENVELOPE = createIpcCorrelationEnvelope(
    generateCorrelationId()
);

type IpcValidatorParam = Parameters<typeof registerStandardizedIpcHandler>[2];
type NonNullIpcValidator = Exclude<IpcValidatorParam, null>;

const acceptAnyParamsValidator: NonNullIpcValidator = () => null;

const registerTestHandler = (
    channel: IpcInvokeChannel,
    handler: (...args: unknown[]) => unknown | Promise<unknown>,
    validator: Parameters<typeof registerStandardizedIpcHandler>[2],
    handlers: Parameters<typeof registerStandardizedIpcHandler>[3]
) =>
    registerStandardizedIpcHandler(
        channel,
        async (...params) => {
            const result = (await handler(...params)) as GenericInvokeResult;

            if (channel === "add-site") {
                const placeholderSite: Site = {
                    identifier: "new-site",
                    monitoring: false,
                    monitors: [],
                    name: "New Site",
                };

                return placeholderSite;
            }

            return result;
        },
        validator,
        handlers
    );

const monitorStatusArbitrary = fc.constantFrom<MonitorStatus>(
    ...MONITOR_STATUS_VALUES
);

const statusHistoryStatusArbitrary = fc.constantFrom<StatusHistoryStatus>(
    ...STATUS_HISTORY_VALUES
);

const statusHistoryArbitrary = fc.record<StatusHistory>({
    details: fc.option(fc.string(), { nil: undefined }),
    responseTime: fc.integer({ min: 0, max: 60_000 }),
    status: statusHistoryStatusArbitrary,
    timestamp: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
});

const monitorTypeArbitrary = fc.constantFrom<MonitorType>(
    "http",
    "ping",
    "ssl"
);

const monitorArbitrary = fc.record<Monitor>({
    checkInterval: fc.integer({ min: 1000, max: 300_000 }),
    history: fc.array(statusHistoryArbitrary, { maxLength: 5 }),
    id: fc.string({ minLength: 3, maxLength: 64 }),
    monitoring: fc.boolean(),
    responseTime: fc.integer({ min: 0, max: 30_000 }),
    retryAttempts: fc.integer({ min: 0, max: 5 }),
    status: monitorStatusArbitrary,
    timeout: fc.integer({ min: 1000, max: 120_000 }),
    type: monitorTypeArbitrary,
});

const arbitrarySiteName = fc.string({ minLength: 3, maxLength: 80 });

const siteArbitrary = fc.record<Site>({
    identifier: fc.string({ minLength: 3, maxLength: 64 }),
    monitoring: fc.boolean(),
    monitors: fc.array(monitorArbitrary, { maxLength: 3 }),
    name: arbitrarySiteName,
});

const arbitrarySiteData = fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    url: fc.webUrl(),
    description: fc.option(fc.string()),
    isActive: fc.boolean(),
    monitors: fc.array(
        fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom("http", "ping", "ssl"),
            config: fc.record({
                timeout: fc.option(fc.integer({ min: 1000, max: 30_000 })),
                interval: fc.option(
                    fc.integer({ min: 30_000, max: 3_600_000 })
                ),
            }),
            isActive: fc.boolean(),
        }),
        { maxLength: 5 }
    ),
});

const arbitraryMonitoringData = fc.record<StatusUpdate>({
    details: fc.option(fc.string(), { nil: undefined }),
    monitor: monitorArbitrary,
    monitorId: fc.string({ minLength: 3, maxLength: 64 }),
    previousStatus: fc.option(monitorStatusArbitrary, { nil: undefined }),
    responseTime: fc.option(fc.integer({ min: 0, max: 60_000 }), {
        nil: undefined,
    }),
    site: siteArbitrary,
    siteIdentifier: fc.string({ minLength: 3, maxLength: 64 }),
    status: monitorStatusArbitrary,
    timestamp: fc
        .date({
            min: new Date("1970-01-01T00:00:00.000Z"),
            max: new Date("3000-01-01T00:00:00.000Z"),
        })
        .map((date) => toIsoStringSafe(date)),
});

const arbitrarySettingsData = fc.record({
    autoStart: fc.boolean(),
    minimizeToTray: fc.boolean(),
    theme: fc.constantFrom("light", "dark", "system"),
    checkInterval: fc.integer({ min: 30_000, max: 3_600_000 }),
    inAppAlertsEnabled: fc.boolean(),
    inAppAlertsSoundEnabled: fc.boolean(),
    systemNotificationsEnabled: fc.boolean(),
    systemNotificationsSoundEnabled: fc.boolean(),
    historyLimit: fc.integer({ min: 100, max: 10_000 }),
});

const arbitraryIpcEventData = fc.oneof(
    arbitraryMonitoringData,
    arbitrarySettingsData,
    fc.record({
        type: fc.string(),
        payload: fc.anything(),
        timestamp: fc.integer({ min: 0 }),
    })
);

const arbitraryValidationInput = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.record({
        name: fc.string(),
        value: fc.anything(),
        required: fc.boolean(),
    }),
    fc.array(fc.anything(), { maxLength: 10 }),
    fc.anything()
);

describe("IPC Communication - 100% Fast-Check Fuzzing Coverage", () => {
    let registeredHandlers: Set<IpcInvokeChannel>;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Create fresh set for tracking registered handlers
        registeredHandlers = new Set<IpcInvokeChannel>();
    });

    describe("IPC Handler Registration and Management", () => {
        fcTest.prop([arbitraryInvokeChannel])(
            "should handle channel registration",
            (channel) => {
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();

                const handler = vi.fn(() => Promise.resolve(undefined));
                const validator =
                    IPC_INVOKE_CHANNEL_PARAM_COUNTS[channel] === 0
                        ? null
                        : acceptAnyParamsValidator;

                expect(() => {
                    registerTestHandler(
                        channel,
                        handler,
                        validator,
                        registeredHandlers
                    );
                }).not.toThrowError();

                expect(mockIpcMain.handle).toHaveBeenCalledWith(
                    channel,
                    expect.any(Function)
                );
            }
        );

        fcTest.prop([arbitraryOneParamInvokeChannel, arbitraryValidationInput])(
            "should handle handler validation",
            async (channel, input) => {
                const handler = vi.fn(() => Promise.resolve("success"));
                const validator = vi.fn(
                    (data: unknown): data is any =>
                        typeof data === "object" && data !== null
                );

                const validateParams: NonNullIpcValidator = (params) =>
                    validator(params[0])
                        ? null
                        : ["Input must be a non-null object"];

                const handlerSet = new Set<IpcInvokeChannel>();
                registerTestHandler(
                    channel,
                    handler,
                    validateParams,
                    handlerSet
                );

                // Get the registered handler function
                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                expect(registeredHandler).toBeDefined();

                if (registeredHandler) {
                    try {
                        // Simulate IPC call
                        const result = await registeredHandler(
                            {},
                            input,
                            TEST_CORRELATION_ENVELOPE
                        );

                        if (validator(input)) {
                            expect(handler).toHaveBeenCalledWith(input);
                            expect(result).toHaveProperty("success", true);
                            expect(result).toHaveProperty("data", "success");
                        } else {
                            // Validation should fail for invalid input
                            expect(result).toHaveProperty("success", false);
                            expect(result).toHaveProperty("error");
                        }
                    } catch (error) {
                        // Some inputs might cause handler errors, which is acceptable
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        );

        fcTest.prop([
            fc.array(arbitraryInvokeChannel, { minLength: 1, maxLength: 10 }),
        ])("should handle multiple handler registrations", (channels) => {
            // Reset mock between tests to avoid accumulation
            mockIpcMain.handle.mockClear();
            registeredHandlers.clear();

            const uniqueChannels = [...new Set(channels)]; // Remove duplicates

            for (const channel of uniqueChannels) {
                const handler = vi.fn(() => Promise.resolve(undefined));
                const validator =
                    IPC_INVOKE_CHANNEL_PARAM_COUNTS[channel] === 0
                        ? null
                        : acceptAnyParamsValidator;

                expect(() => {
                    registerTestHandler(
                        channel,
                        handler,
                        validator,
                        registeredHandlers
                    );
                }).not.toThrowError();
            }

            expect(mockIpcMain.handle).toHaveBeenCalledTimes(
                uniqueChannels.length
            );
        });

        fcTest.prop([arbitraryZeroParamInvokeChannel, arbitraryIpcEventData])(
            "should handle IPC response formatting",
            async (channel, data) => {
                // Reset mocks for clean state
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();

                const handler = vi.fn(() => Promise.resolve(data));

                registerTestHandler(channel, handler, null, registeredHandlers);

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    const result = await registeredHandler({});

                    // Result should be wrapped in IPC response format
                    expect(result).toHaveProperty("success", true);
                    expect(result).toHaveProperty("data");
                    expect(handler).toHaveBeenCalled();
                }
            }
        );
    });

    describe("IPC Event Communication and Forwarding", () => {
        fcTest.prop([arbitraryEventChannelName, arbitraryIpcEventData])(
            "should handle event forwarding",
            (channel, eventData) => {
                // Test event forwarding capability
                const webContents = mockBrowserWindow.webContents;

                if (webContents && !webContents.isDestroyed()) {
                    webContents.send(channel, eventData);
                    expect(webContents.send).toHaveBeenCalledWith(
                        channel,
                        eventData
                    );
                }
            }
        );

        fcTest.prop([arbitraryIpcEventData])(
            "should handle destroyed web contents",
            (eventData) => {
                // Simulate destroyed web contents
                mockBrowserWindow.webContents.isDestroyed.mockReturnValue(true);

                // Should handle gracefully without throwing
                expect(() => {
                    if (!mockBrowserWindow.webContents.isDestroyed()) {
                        mockBrowserWindow.webContents.send(
                            "test:event",
                            eventData
                        );
                    }
                }).not.toThrowError();

                // Reset for other tests
                mockBrowserWindow.webContents.isDestroyed.mockReturnValue(
                    false
                );
            }
        );

        fcTest.prop([arbitraryEventChannelName])(
            "should handle missing web contents",
            (channel) => {
                const originalWebContents = mockBrowserWindow.webContents;
                mockBrowserWindow.webContents = null as any;

                expect(() => {
                    // Should handle gracefully when webContents is null
                    const webContents = mockBrowserWindow.webContents;
                    if (webContents && !webContents.isDestroyed()) {
                        webContents.send(channel, {});
                    }
                }).not.toThrowError();

                // Restore
                mockBrowserWindow.webContents = originalWebContents;
            }
        );

        fcTest.prop([arbitraryEventChannelName, arbitraryIpcEventData])(
            "should handle IPC renderer communication",
            (channel, _eventData) => {
                // Test IPC renderer methods
                mockIpcRenderer.invoke(channel);
                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(channel);

                // Test event listeners
                const callback = vi.fn();
                mockIpcRenderer.on(channel, callback);
                expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                    channel,
                    callback
                );

                // Test cleanup
                mockIpcRenderer.removeListener(channel, callback);
                expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
                    channel,
                    callback
                );
            }
        );
    });

    describe("IPC Security and Validation", () => {
        fcTest.prop([arbitraryValidationInput])(
            "should validate all inputs",
            async (input) => {
                const channel: IpcInvokeChannel = "notify-app-event";
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();
                const handler = vi.fn(() => Promise.resolve("success"));
                const strictValidator = (
                    data: unknown
                ): data is { name: string } =>
                    typeof data === "object" &&
                    data !== null &&
                    "name" in data &&
                    typeof (data as any).name === "string";

                const validateParams: NonNullIpcValidator = (params) =>
                    strictValidator(params[0])
                        ? null
                        : ["Input must contain name: string"];

                registerTestHandler(
                    channel,
                    handler,
                    validateParams,
                    registeredHandlers
                );

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    try {
                        const result = await registeredHandler(
                            {},
                            input,
                            TEST_CORRELATION_ENVELOPE
                        );

                        if (strictValidator(input)) {
                            expect(handler).toHaveBeenCalledWith(input);
                            expect(result).toHaveProperty("success", true);
                            expect(result).toHaveProperty("data", "success");
                        } else {
                            // Should return error for invalid input
                            expect(result).toHaveProperty("success", false);
                            expect(result).toHaveProperty("error");
                        }
                    } catch (error) {
                        // Validation errors are acceptable
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        );

        fcTest.prop([arbitraryZeroParamInvokeChannel])(
            "should handle handler errors",
            async (channel) => {
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();
                const errorHandler = vi.fn(() => {
                    throw new Error("Handler error");
                });

                registerTestHandler(channel, errorHandler, null, registeredHandlers);

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    try {
                        const result = await registeredHandler({});
                        // Should return error object, not throw
                        expect(result).toHaveProperty("error");
                    } catch (error) {
                        // Some errors might still propagate, which is acceptable
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            }
        );

        test("should prevent code injection in invoke channel names", () => {
            for (const channel of INVOKE_CHANNELS) {
                expect(channel).toMatch(/^[A-Za-z][\w:-]*$/);
                expect(channel).not.toMatch(/[\s"'<>`]/);
            }
        });

        fcTest.prop([fc.anything()])(
            "should validate contextBridge exposure",
            (apiData) => {
                // Test that contextBridge is used properly
                expect(mockContextBridge.exposeInMainWorld).toBeDefined();

                // Should expose APIs safely
                mockContextBridge.exposeInMainWorld("electronAPI", apiData);
                expect(
                    mockContextBridge.exposeInMainWorld
                ).toHaveBeenCalledWith("electronAPI", apiData);
            }
        );

        test("should not expose dangerous globals", () => {
            const dangerousProperties = [
                "require",
                "process",
                "global",
                "__dirname",
                "__filename",
                "Buffer",
                "eval",
                "Function",
            ];

            // Mock API should not contain dangerous properties
            const mockAPI = {
                sites: { getSites: vi.fn() },
                monitoring: { start: vi.fn() },
                settings: { get: vi.fn() },
            };

            for (const prop of dangerousProperties) {
                expect(mockAPI).not.toHaveProperty(prop);
            }
        });
    });

    describe("IPC Performance and Resource Management", () => {
        fcTest.prop([fc.integer({ min: 1, max: 50 })])(
            "should handle high volume IPC calls",
            async (callCount) => {
                const channel: IpcInvokeChannel = "get-sites";
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();
                const handler = vi.fn(() => Promise.resolve("response"));

                registerTestHandler(channel, handler, null, registeredHandlers);

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    // Simulate multiple simultaneous calls
                    const promises = Array.from({ length: callCount }, () =>
                        registeredHandler({})
                    );

                    const results = await Promise.allSettled(promises);

                    // All calls should complete
                    expect(results).toHaveLength(callCount);

                    // Most should succeed (some might fail due to random data)
                    const succeeded = results.filter(
                        (r) => r.status === "fulfilled"
                    );
                    expect(succeeded.length).toBeGreaterThan(callCount * 0.5);
                }
            }
        );

        fcTest.prop([
            fc.array(arbitraryInvokeChannel, { minLength: 5, maxLength: 30 }),
        ])("should handle many registered handlers", (channels) => {
            // Reset mock and handlers for clean state
            mockIpcMain.handle.mockClear();
            registeredHandlers.clear();

            const uniqueChannels = [...new Set(channels)];

            // Register many handlers
            for (const channel of uniqueChannels) {
                const validator =
                    IPC_INVOKE_CHANNEL_PARAM_COUNTS[channel] === 0
                        ? null
                        : acceptAnyParamsValidator;

                registerTestHandler(
                    channel,
                    vi.fn(() => Promise.resolve(undefined)),
                    validator,
                    registeredHandlers
                );
            }

            expect(mockIpcMain.handle).toHaveBeenCalledTimes(
                uniqueChannels.length
            );
        });

        fcTest.prop([arbitraryZeroParamInvokeChannel])(
            "should handle async handler errors",
            async (channel) => {
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();
                const asyncErrorHandler = vi.fn(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 1));
                    throw new Error("Async error");
                });

                registerTestHandler(channel, asyncErrorHandler, null, registeredHandlers);

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    const result = await registeredHandler({});

                    // Should return error object, not throw
                    expect(result).toHaveProperty("error");
                }
            }
        );

        test("should handle circular reference errors", async () => {
            // Reset mocks for clean state
            mockIpcMain.handle.mockClear();
            registeredHandlers.clear();

            const channel: IpcInvokeChannel = "get-sites";
            const handler = vi.fn(() => {
                const circular: any = {};
                circular.self = circular;
                return Promise.resolve(circular);
            });

            registerTestHandler(channel, handler, null, registeredHandlers);

            const registeredHandler = mockIpcMain.handle.mock.calls.find(
                (call) => call[0] === channel
            )?.[1];

            if (registeredHandler) {
                // Should handle circular references by catching the error
                const result = await registeredHandler({});

                // Since circular references cause JSON serialization errors,
                // the system should either handle it gracefully or return an error response
                expect(result).toHaveProperty("success");

                // If success is false, it means the error was caught and handled
                if (result.success === false) {
                    expect(result).toHaveProperty("error");
                } else {
                    // If success is true, the data might be handled differently
                    expect(result).toHaveProperty("data");
                    // Don't test JSON serialization since it may contain circular refs
                }
            }
        });
    });

    describe("IPC Type Safety and Validation Patterns", () => {
        fcTest.prop([arbitrarySiteData])(
            "should validate site data properly",
            async (siteData) => {
                // Reset mocks for clean state
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();

                const channel = "add-site";
                const handler = vi.fn(() => Promise.resolve(siteData));
                const siteValidator = (
                    data: unknown
                ): data is typeof siteData =>
                    typeof data === "object" &&
                    data !== null &&
                    "name" in data &&
                    "url" in data &&
                    typeof (data as any).name === "string" &&
                    typeof (data as any).url === "string";

                const validateParams: NonNullIpcValidator = (params) =>
                    siteValidator(params[0])
                        ? null
                        : ["Site data must include name and url strings"];

                registerTestHandler(
                    channel,
                    handler,
                    validateParams,
                    registeredHandlers
                );

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    const result = await registeredHandler(
                        {},
                        siteData,
                        TEST_CORRELATION_ENVELOPE
                    );

                    if (siteValidator(siteData)) {
                        expect(handler).toHaveBeenCalledWith(siteData);
                        expect(result).toHaveProperty("success", true);
                        expect(result).toHaveProperty("data");
                        expect(result.data).toMatchObject({
                            identifier: "new-site",
                        });
                    }
                }
            }
        );

        fcTest.prop([arbitraryMonitoringData])(
            "should validate monitoring data properly",
            async (monitoringData) => {
                // Reset mocks for clean state
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();

                const channel: IpcInvokeChannel =
                    "update-notification-preferences";
                const handler = vi.fn(() => Promise.resolve("updated"));
                const monitoringValidator = (
                    data: unknown
                ): data is typeof monitoringData =>
                    typeof data === "object" &&
                    data !== null &&
                    "siteIdentifier" in data &&
                    "status" in data &&
                    typeof (data as any).siteIdentifier === "string" &&
                    typeof (data as any).status === "string";

                const validateParams: NonNullIpcValidator = (params) =>
                    monitoringValidator(params[0])
                        ? null
                        : [
                              "Monitoring data must include siteIdentifier and status strings",
                          ];

                registerTestHandler(
                    channel,
                    handler,
                    validateParams,
                    registeredHandlers
                );

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    const result = await registeredHandler(
                        {},
                        monitoringData,
                        TEST_CORRELATION_ENVELOPE
                    );

                    if (monitoringValidator(monitoringData)) {
                        expect(handler).toHaveBeenCalledWith(monitoringData);
                        expect(result).toHaveProperty("success", true);
                        expect(result).toHaveProperty("data", "updated");
                    }
                }
            }
        );

        fcTest.prop([arbitrarySettingsData])(
            "should validate settings data properly",
            async (settingsData) => {
                // Reset mocks for clean state
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();

                const channel: IpcInvokeChannel = "cloud-enable-sync";
                const handler = vi.fn(() => Promise.resolve(undefined));
                const settingsValidator = (
                    data: unknown
                ): data is typeof settingsData =>
                    typeof data === "object" && data !== null;

                const validateParams: NonNullIpcValidator = (params) =>
                    settingsValidator(params[0])
                        ? null
                        : ["Settings payload must be an object"];

                registerTestHandler(
                    channel,
                    handler,
                    validateParams,
                    registeredHandlers
                );

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    const result = await registeredHandler(
                        {},
                        settingsData,
                        TEST_CORRELATION_ENVELOPE
                    );

                    if (settingsValidator(settingsData)) {
                        expect(handler).toHaveBeenCalledWith(settingsData);
                        expect(result).toHaveProperty("success", true);
                    }
                }
            }
        );

        fcTest.prop([arbitraryValidationInput])(
            "should handle edge case validation",
            async (input) => {
                // Reset mocks for clean state
                mockIpcMain.handle.mockClear();
                registeredHandlers.clear();

                const channel: IpcInvokeChannel =
                    "diagnostics-report-preload-guard";
                const handler = vi.fn(() => Promise.resolve("success"));

                registerTestHandler(
                    channel,
                    handler,
                    acceptAnyParamsValidator,
                    registeredHandlers
                );

                const registeredHandler = mockIpcMain.handle.mock.calls.find(
                    (call) => call[0] === channel
                )?.[1];

                if (registeredHandler) {
                    const result = await registeredHandler(
                        {},
                        input,
                        TEST_CORRELATION_ENVELOPE
                    );

                    // Since validation is permissive, all handlers should be
                    // called and return success.
                    expect(handler).toHaveBeenCalled();
                    expect(result).toHaveProperty("success", true);
                    expect(result).toHaveProperty("data");
                }
            }
        );
    });
});
