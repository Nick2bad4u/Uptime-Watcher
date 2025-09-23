/**
 * Comprehensive tests for the core bridge factory infrastructure Includes
 * fast-check property-based testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() for proper hoisting
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    createTypedInvoker,
    createVoidInvoker,
    createEventManager,
    defineChannel,
    createDomainBridge,
    IpcError,
    type IpcResponse,
    type ChannelConfig,
} from "../../../preload/core/bridgeFactory";

describe("Bridge Factory Infrastructure", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("IpcError class", () => {
        it("should create error with proper properties", () => {
            const originalError = new Error("Original error");
            const ipcError = new IpcError(
                "Test message",
                "test-channel",
                originalError
            );

            expect(ipcError.name).toBe("IpcError");
            expect(ipcError.message).toBe("Test message");
            expect(ipcError.channel).toBe("test-channel");
            expect(ipcError.originalError).toBe(originalError);
            expect(ipcError.cause).toBe(originalError);
        });

        it("should work without original error", () => {
            const ipcError = new IpcError("Test message", "test-channel");

            expect(ipcError.name).toBe("IpcError");
            expect(ipcError.message).toBe("Test message");
            expect(ipcError.channel).toBe("test-channel");
            expect(ipcError.originalError).toBeUndefined();
            expect(ipcError.cause).toBeUndefined();
        });

        it("should extend Error properly", () => {
            const ipcError = new IpcError("Test", "channel");
            expect(ipcError).toBeInstanceOf(Error);
            expect(ipcError).toBeInstanceOf(IpcError);
        });
    });

    describe(
        () => "createTypedInvoker",
        () => {
            it("should create function that invokes IPC and returns data", async () => {
                const mockResponse: IpcResponse<string> = {
                    success: true,
                    data: "test-data",
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const invoker = createTypedInvoker<string>("test-channel");
                const result = await invoker("arg1", "arg2");

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "test-channel",
                    "arg1",
                    "arg2"
                );
                expect(result).toBe("test-data");
            });

            it("should throw IpcError on failed response", async () => {
                const mockResponse: IpcResponse = {
                    success: false,
                    error: "Operation failed",
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const invoker = createTypedInvoker<string>("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                await expect(invoker()).rejects.toThrow("Operation failed");
            });

            it("should throw IpcError on invalid response format", async () => {
                mockIpcRenderer.invoke.mockResolvedValue("invalid response");

                const invoker = createTypedInvoker<string>("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                await expect(invoker()).rejects.toThrow(
                    "Invalid IPC response format"
                );
            });

            it("should throw IpcError on missing data", async () => {
                const mockResponse: IpcResponse = {
                    success: true,
                    // Data is missing
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const invoker = createTypedInvoker<string>("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                await expect(invoker()).rejects.toThrow(
                    "IPC response missing data field"
                );
            });

            it("should throw IpcError when IPC throws", async () => {
                const originalError = new Error("IPC error");
                mockIpcRenderer.invoke.mockRejectedValue(originalError);

                const invoker = createTypedInvoker<string>("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                const error = await invoker().catch((error_) => error_);
                expect(error).toBeInstanceOf(IpcError);
                expect(error.originalError).toBe(originalError);
                expect(error.channel).toBe("test-channel");
            });

            it("should handle non-Error thrown values", async () => {
                mockIpcRenderer.invoke.mockRejectedValue("string error");

                const invoker = createTypedInvoker<string>("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                const error = await invoker().catch((error_) => error_);
                expect(error.message).toContain("string error");
                expect(error.originalError).toBeUndefined();
            });
        }
    );

    describe(
        () => "createVoidInvoker",
        () => {
            it("should create function that invokes IPC without returning data", async () => {
                const mockResponse: IpcResponse = {
                    success: true,
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const invoker = createVoidInvoker("test-channel");
                const result = await invoker("arg1", "arg2");

                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "test-channel",
                    "arg1",
                    "arg2"
                );
                expect(result).toBeUndefined();
            });

            it("should throw IpcError on failed response", async () => {
                const mockResponse: IpcResponse = {
                    success: false,
                    error: "Operation failed",
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const invoker = createVoidInvoker("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                await expect(invoker()).rejects.toThrow("Operation failed");
            });

            it("should throw IpcError on invalid response format", async () => {
                mockIpcRenderer.invoke.mockResolvedValue(null);

                const invoker = createVoidInvoker("test-channel");

                await expect(invoker()).rejects.toThrow(IpcError);
                await expect(invoker()).rejects.toThrow(
                    "Invalid IPC response format"
                );
            });

            it("should work with success response without data field", async () => {
                const mockResponse: IpcResponse = {
                    success: true,
                    // no data field is fine for void operations
                };
                mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                const invoker = createVoidInvoker("test-channel");

                await expect(invoker()).resolves.toBeUndefined();
            });
        }
    );

    describe(
        () => "createEventManager",
        () => {
            it("should create event manager with proper interface", () => {
                const manager = createEventManager("test-event");

                expect(manager).toHaveProperty("on");
                expect(manager).toHaveProperty("once");
                expect(manager).toHaveProperty("removeAll");
                expect(typeof manager.on).toBe("function");
                expect(typeof manager.once).toBe("function");
                expect(typeof manager.removeAll).toBe("function");
            });

            it("should register event listener with on() method", () => {
                const manager = createEventManager("test-event");
                const callback = vi.fn();

                const removeListener = manager.on(callback);

                expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                    "test-event",
                    expect.any(Function)
                );
                expect(typeof removeListener).toBe("function");
            });

            it("should call callback when event is received", () => {
                const manager = createEventManager("test-event");
                const callback = vi.fn();

                manager.on(callback);

                // Simulate event being received
                const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
                expect(eventHandler).toBeDefined();
                const mockEvent = { sender: {} };
                eventHandler!(mockEvent, "arg1", "arg2");

                expect(callback).toHaveBeenCalledWith("arg1", "arg2");
            });

            it("should remove listener when returned function is called", () => {
                const manager = createEventManager("test-event");
                const callback = vi.fn();

                const removeListener = manager.on(callback);
                removeListener();

                expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
                    "test-event",
                    expect.any(Function)
                );
            });

            it("should register one-time listener with once() method", () => {
                const manager = createEventManager("test-event");
                const callback = vi.fn();

                manager.once(callback);

                expect(mockIpcRenderer.once).toHaveBeenCalledWith(
                    "test-event",
                    expect.any(Function)
                );
            });

            it("should call callback once when using once() method", () => {
                const manager = createEventManager("test-event");
                const callback = vi.fn();

                manager.once(callback);

                // Simulate event being received
                const eventHandler = mockIpcRenderer.once.mock.calls[0]?.[1];
                expect(eventHandler).toBeDefined();
                const mockEvent = { sender: {} };
                eventHandler!(mockEvent, "arg1", "arg2");

                expect(callback).toHaveBeenCalledWith("arg1", "arg2");
            });

            it("should remove all listeners with removeAll() method", () => {
                const manager = createEventManager("test-event");

                manager.removeAll();

                expect(mockIpcRenderer.removeAllListeners).toHaveBeenCalledWith(
                    "test-event"
                );
            });
        }
    );

    describe(
        () => "defineChannel",
        () => {
            it("should create channel configuration with defaults", () => {
                const config = defineChannel("test-channel");

                expect(config).toEqual({
                    channel: "test-channel",
                    methodName: "testChannel",
                    hasParameters: false,
                });
            });

            it("should accept custom method name", () => {
                const config = defineChannel("test-channel", "customMethod");

                expect(config.methodName).toBe("customMethod");
            });

            it("should include output type when provided", () => {
                const config = defineChannel(
                    "test-channel",
                    undefined,
                    "string"
                );

                expect(config.outputType).toBe("string");
            });

            it("should convert kebab-case to camelCase properly", () => {
                const testCases = [
                    { input: "get-sites", expected: "getSites" },
                    { input: "add-monitor", expected: "addMonitor" },
                    {
                        input: "start-monitoring-for-site",
                        expected: "startMonitoringForSite",
                    },
                    { input: "simple", expected: "simple" },
                ];

                for (const { input, expected } of testCases) {
                    const config = defineChannel(input);
                    expect(config.methodName).toBe(expected);
                }
            });
        }
    );

    describe(
        () => "createDomainBridge",
        () => {
            it("should create bridge with typed methods", () => {
                const channels: Record<string, ChannelConfig> = {
                    getData: {
                        channel: "get-data",
                        methodName: "getData",
                        outputType: "string",
                    },
                    setData: {
                        channel: "set-data",
                        methodName: "setData",
                        // no outputType = void
                    },
                };

                const bridge = createDomainBridge(channels);

                expect(bridge).toHaveProperty("getData");
                expect(bridge).toHaveProperty("setData");
                expect(typeof bridge["getData"]).toBe("function");
                expect(typeof bridge["setData"]).toBe("function");
            });

            it("should work with both typed and void methods", async () => {
                const mockTypedResponse: IpcResponse<string> = {
                    success: true,
                    data: "test-data",
                };
                const mockVoidResponse: IpcResponse = {
                    success: true,
                };

                mockIpcRenderer.invoke
                    .mockResolvedValueOnce(mockTypedResponse)
                    .mockResolvedValueOnce(mockVoidResponse);

                const channels: Record<string, ChannelConfig> = {
                    getData: {
                        channel: "get-data",
                        methodName: "getData",
                        outputType: "string",
                    },
                    setData: {
                        channel: "set-data",
                        methodName: "setData",
                    },
                };

                const bridge = createDomainBridge(channels);

                const getResult = await bridge["getData"]!();
                const setResult = await bridge["setData"]!("value");

                expect(getResult).toBe("test-data");
                expect(setResult).toBeUndefined();
            });
        }
    );

    describe("Property-based testing with fast-check", () => {
        it("should handle various channel names correctly", () => {
            fc.assert(
                fc.property(
                    fc.stringMatching(/^[a-z][\da-z-]*[\da-z]$/),
                    (channelName) => {
                        const config = defineChannel(channelName);
                        expect(config.channel).toBe(channelName);
                        expect(config.methodName).toMatch(
                            /^[A-Za-z][\dA-Za-z]*$/
                        );
                    }
                ),
                { numRuns: 50 }
            );
        });

        it("should handle various IPC response scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.record({
                            success: fc.constant(true),
                            data: fc.anything(),
                        }),
                        fc.record({
                            success: fc.constant(false),
                            error: fc.string(),
                        }),
                        fc
                            .anything()
                            .filter(
                                (x) =>
                                    typeof x !== "object" ||
                                    x === null ||
                                    !("success" in x)
                            )
                    ),
                    async (response) => {
                        mockIpcRenderer.invoke.mockResolvedValue(response);
                        const invoker =
                            createTypedInvoker<unknown>("test-channel");

                        if (
                            typeof response === "object" &&
                            response !== null &&
                            "success" in response &&
                            response.success === true &&
                            "data" in response &&
                            response.data !== undefined
                        ) {
                            // Should succeed only if data is not undefined
                            const result = await invoker();
                            expect(result).toBe(response.data);
                        } else {
                            // Should throw IpcError
                            await expect(invoker()).rejects.toThrow(IpcError);
                        }
                    }
                ),
                { numRuns: 30 }
            );
        });

        it("should handle various argument combinations for invokers", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.anything(), { maxLength: 10 }),
                    async (args) => {
                        const mockResponse: IpcResponse<string> = {
                            success: true,
                            data: "test-result",
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(mockResponse);

                        const invoker =
                            createTypedInvoker<string>("test-channel");
                        const result = await invoker(...args);

                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "test-channel",
                            ...args
                        );
                        expect(result).toBe("test-result");
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle event manager with various channel names", () => {
            fc.assert(
                fc.property(
                    fc.string().filter((s) => s.length > 0),
                    (eventChannel) => {
                        const manager = createEventManager(eventChannel);
                        const callback = vi.fn();

                        manager.on(callback);
                        manager.once(callback);
                        manager.removeAll();

                        expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                            eventChannel,
                            expect.any(Function)
                        );
                        expect(mockIpcRenderer.once).toHaveBeenCalledWith(
                            eventChannel,
                            expect.any(Function)
                        );
                        expect(
                            mockIpcRenderer.removeAllListeners
                        ).toHaveBeenCalledWith(eventChannel);
                    }
                ),
                { numRuns: 30 }
            );
        });

        it("should validate error message generation with various inputs", () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    fc.string(),
                    fc.oneof(
                        fc.constant(undefined),
                        fc.record(
                            { message: fc.string() },
                            { requiredKeys: ["message"] }
                        ),
                        fc.string(),
                        fc.float(),
                        fc.integer()
                    ),
                    (message, channel, errorValue) => {
                        let originalError: Error | undefined;
                        if (
                            typeof errorValue === "object" &&
                            errorValue !== null &&
                            "message" in errorValue
                        ) {
                            originalError = errorValue as Error;
                        }

                        const ipcError = new IpcError(
                            message,
                            channel,
                            originalError
                        );

                        expect(ipcError.message).toBe(message);
                        expect(ipcError.channel).toBe(channel);
                        expect(ipcError.originalError).toBe(originalError);
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    describe("Edge cases and error scenarios", () => {
        it("should handle null and undefined responses", async () => {
            for (const response of [null, undefined]) {
                mockIpcRenderer.invoke.mockResolvedValue(response);
                const invoker = createTypedInvoker<string>("test-channel");
                await expect(invoker()).rejects.toThrow(IpcError);
            }
        });

        it("should handle responses without success property", async () => {
            const response = { data: "test" }; // Missing success
            mockIpcRenderer.invoke.mockResolvedValue(response);
            const invoker = createTypedInvoker<string>("test-channel");
            await expect(invoker()).rejects.toThrow(
                "Invalid IPC response format"
            );
        });

        it("should handle success: false without error message", async () => {
            const response = { success: false }; // no error message
            mockIpcRenderer.invoke.mockResolvedValue(response);
            const invoker = createTypedInvoker<string>("test-channel");
            await expect(invoker()).rejects.toThrow(
                "IPC operation failed without error message"
            );
        });

        it("should handle deeply nested error scenarios", async () => {
            const nestedError = new Error("Deep error");
            nestedError.cause = new Error("Even deeper");

            mockIpcRenderer.invoke.mockRejectedValue(nestedError);
            const invoker = createTypedInvoker<string>("test-channel");

            const error = await invoker().catch((error_) => error_);
            expect(error).toBeInstanceOf(IpcError);
            expect(error.originalError).toBe(nestedError);
            expect(error.cause).toBe(nestedError);
        });

        it("should handle concurrent invocations safely", async () => {
            const responses = [
                { success: true, data: "result1" },
                { success: true, data: "result2" },
                { success: true, data: "result3" },
            ];

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(responses[0])
                .mockResolvedValueOnce(responses[1])
                .mockResolvedValueOnce(responses[2]);

            const invoker = createTypedInvoker<string>("test-channel");

            const promises = [
                invoker("arg1"),
                invoker("arg2"),
                invoker("arg3"),
            ];

            const results = await Promise.all(promises);
            expect(results).toEqual([
                "result1",
                "result2",
                "result3",
            ]);
        });

        it("should handle empty strings and special characters in channels", () => {
            const specialChannels = [
                "channel-with-dashes",
                "channel_with_underscores",
                "channel.with.dots",
                "channel123",
                "UPPERCASE-CHANNEL",
            ];

            for (const channel of specialChannels) {
                expect(() => createTypedInvoker(channel)).not.toThrow();
                expect(() => createVoidInvoker(channel)).not.toThrow();
                expect(() => createEventManager(channel)).not.toThrow();
            }
        });

        it("should handle large data payloads", async () => {
            const largeData = "x".repeat(100_000); // 100KB string
            const response: IpcResponse<string> = {
                success: true,
                data: largeData,
            };

            mockIpcRenderer.invoke.mockResolvedValue(response);
            const invoker = createTypedInvoker<string>("test-channel");

            const result = await invoker();
            expect(result).toBe(largeData);
            expect(result).toHaveLength(100_000);
        });

        it("should preserve metadata in successful responses", async () => {
            const response: IpcResponse<string> = {
                success: true,
                data: "test-data",
                metadata: {
                    timestamp: Date.now(),
                    source: "test",
                    nested: { value: 42 },
                },
            };

            mockIpcRenderer.invoke.mockResolvedValue(response);
            const invoker = createTypedInvoker<string>("test-channel");

            const result = await invoker();
            expect(result).toBe("test-data");
            // Metadata is available in the response but not returned by the typed invoker
        });
    });
});
