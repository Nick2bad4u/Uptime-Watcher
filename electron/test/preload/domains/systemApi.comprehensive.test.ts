/**
 * Comprehensive tests for System domain API Includes fast-check property-based
 * testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
    send: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    systemApi,
    type SystemApiInterface,
} from "../../../preload/domains/systemApi";

// Helper functions for creating properly formatted IPC responses
function createIpcResponse<T>(data: T): { success: true; data: T } {
    return { success: true, data };
}

describe("System Domain API", () => {
    let api: SystemApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = systemApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required system methods", () => {
            const expectedMethods = ["openExternal", "quitAndInstall"];

            for (const method of expectedMethods) {
                expect(api).toHaveProperty(method);
                expect(typeof api[method as keyof typeof api]).toBe("function");
            }
        });

        it("should reference the same systemApi instance", () => {
            expect(api).toBe(systemApi);
        });
    });

    describe("openExternal", () => {
        it("should call IPC with correct channel and URL", async () => {
            const testUrl = "https://example.com";
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await api.openExternal(testUrl);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "open-external",
                testUrl
            );
            expect(result).toBeTruthy();
            expect(typeof result).toBe("boolean");
        });

        it("should handle successful URL opening", async () => {
            const urls = [
                "https://google.com",
                "https://github.com/user/repo",
                "https://docs.example.com/guide",
                "mailto:test@example.com",
                "file:///C:/Users/test/document.pdf",
            ];

            for (const url of urls) {
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(true)
                );
                const result = await api.openExternal(url);
                expect(result).toBeTruthy();
                expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                    "open-external",
                    url
                );
            }
        });

        it("should handle failed URL opening", async () => {
            const failedUrl = "https://invalid-url-that-fails.com";
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            const result = await api.openExternal(failedUrl);

            expect(result).toBeFalsy();
            expect(typeof result).toBe("boolean");
        });

        it("should handle URL opening errors", async () => {
            const errorUrl = "https://error-url.com";
            const error = new Error("Failed to open external URL");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.openExternal(errorUrl)).rejects.toThrow(
                "Failed to open external URL"
            );
        });

        it("should handle malformed URLs", async () => {
            const malformedUrls = [
                "not-a-url",
                "invalid://url",
                "",
                "   ",
                // eslint-disable-next-line no-script-url -- Security test case for malformed URL validation
                "javascript:alert('xss')",
            ];

            for (const url of malformedUrls) {
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(false)
                );
                const result = await api.openExternal(url);
                expect(typeof result).toBe("boolean");
            }
        });

        it("should handle network connectivity issues", async () => {
            const networkError = new Error("Network unreachable");
            mockIpcRenderer.invoke.mockRejectedValue(networkError);

            await expect(
                api.openExternal("https://example.com")
            ).rejects.toThrow("Network unreachable");
        });

        it("should handle system permission issues", async () => {
            const permissionError = new Error(
                "Permission denied to open external application"
            );
            mockIpcRenderer.invoke.mockRejectedValue(permissionError);

            await expect(
                api.openExternal("mailto:test@example.com")
            ).rejects.toThrow("Permission denied to open external application");
        });

        it("should handle concurrent URL opening requests", async () => {
            const urls = [
                "https://site1.com",
                "https://site2.com",
                "https://site3.com",
                "https://site4.com",
                "https://site5.com",
            ];

            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const promises = urls.map((url) => api.openExternal(url));
            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            for (const result of results) {
                expect(result).toBeTruthy();
            }
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(5);
        });
    });

    describe("quitAndInstall", () => {
        it("should call IPC send with correct channel", () => {
            api.quitAndInstall();

            expect(mockIpcRenderer.send).toHaveBeenCalledWith(
                "quit-and-install"
            );
            expect(mockIpcRenderer.send).toHaveBeenCalledTimes(1);
        });

        it("should not return a value", () => {
            const result = api.quitAndInstall();

            expect(result).toBeUndefined();
        });

        it("should handle multiple quit attempts", () => {
            api.quitAndInstall();
            api.quitAndInstall();
            api.quitAndInstall();

            expect(mockIpcRenderer.send).toHaveBeenCalledTimes(3);
            expect(mockIpcRenderer.send).toHaveBeenCalledWith(
                "quit-and-install"
            );
        });

        it("should work correctly even if IPC send throws", () => {
            mockIpcRenderer.send.mockImplementation(() => {
                throw new Error("IPC send failed");
            });

            expect(() => api.quitAndInstall()).toThrow("IPC send failed");
            expect(mockIpcRenderer.send).toHaveBeenCalledWith(
                "quit-and-install"
            );
        });

        it("should be synchronous operation", () => {
            const start = Date.now();
            api.quitAndInstall();
            const end = Date.now();

            // Should complete immediately (within 10ms tolerance)
            expect(end - start).toBeLessThan(10);
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various URL formats for openExternal", async () => {
            await fc.assert(
                fc.asyncProperty(fc.webUrl(), async (url) => {
                    mockIpcRenderer.invoke.mockResolvedValue(
                        createIpcResponse(true)
                    );

                    const result = await api.openExternal(url);

                    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                        "open-external",
                        url
                    );
                    expect(typeof result).toBe("boolean");
                    expect(result).toBeTruthy();
                }),
                { numRuns: 25 }
            );
        });

        it("should handle various string inputs for openExternal", async () => {
            await fc.assert(
                fc.asyncProperty(fc.string(), async (input) => {
                    mockIpcRenderer.invoke.mockResolvedValue(
                        createIpcResponse(false)
                    );

                    const result = await api.openExternal(input);

                    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                        "open-external",
                        input
                    );
                    expect(typeof result).toBe("boolean");
                }),
                { numRuns: 20 }
            );
        });

        it("should handle various error scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc
                            .string({ minLength: 1 })
                            .map((msg) => new Error(msg)),
                        fc.constant(new Error("System error")),
                        fc.constant(new Error("Permission denied")),
                        fc.constant(new Error("Application not found"))
                    ),
                    async (error) => {
                        mockIpcRenderer.invoke.mockRejectedValue(error);

                        await expect(
                            api.openExternal("https://example.com")
                        ).rejects.toThrow(error.message);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle boolean return values correctly", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.boolean(),
                    fc.webUrl(),
                    async (returnValue, url) => {
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(returnValue)
                        );

                        const result = await api.openExternal(url);

                        expect(result).toBe(returnValue);
                        expect(typeof result).toBe("boolean");
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should validate quitAndInstall behavior", () => {
            fc.assert(
                fc.property(fc.integer({ min: 1, max: 10 }), (callCount) => {
                    mockIpcRenderer.send.mockClear();

                    for (let i = 0; i < callCount; i++) {
                        api.quitAndInstall();
                    }

                    expect(mockIpcRenderer.send).toHaveBeenCalledTimes(
                        callCount
                    );
                    for (let i = 0; i < callCount; i++) {
                        expect(mockIpcRenderer.send).toHaveBeenNthCalledWith(
                            i + 1,
                            "quit-and-install"
                        );
                    }
                }),
                { numRuns: 10 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle complete system operation workflow", async () => {
            // Open multiple external resources
            const urls = [
                "https://docs.app.com/help",
                "https://support.app.com/contact",
                "https://github.com/app/repo/issues",
            ];

            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            for (const url of urls) {
                const result = await api.openExternal(url);
                expect(result).toBeTruthy();
            }

            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(3);

            // Then quit and install update
            api.quitAndInstall();
            expect(mockIpcRenderer.send).toHaveBeenCalledWith(
                "quit-and-install"
            );
        });

        it("should handle error recovery in external URL opening", async () => {
            const primaryUrl = "https://primary-site.com";
            const fallbackUrl = "https://fallback-site.com";

            // First attempt fails
            mockIpcRenderer.invoke.mockRejectedValueOnce(
                new Error("Primary site unreachable")
            );
            await expect(api.openExternal(primaryUrl)).rejects.toThrow(
                "Primary site unreachable"
            );

            // Fallback succeeds
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(true)
            );
            const result = await api.openExternal(fallbackUrl);
            expect(result).toBeTruthy();
        });

        it("should handle mixed success/failure scenarios", async () => {
            const testCases = [
                { url: "https://working-site.com", result: true },
                { url: "https://broken-site.com", result: false },
                { url: "https://another-working-site.com", result: true },
            ];

            for (const testCase of testCases) {
                mockIpcRenderer.invoke.mockResolvedValueOnce(
                    createIpcResponse(testCase.result)
                );
                const result = await api.openExternal(testCase.url);
                expect(result).toBe(testCase.result);
            }
        });

        it("should handle system state transitions", () => {
            // Normal operation state
            expect(() => api.quitAndInstall()).not.toThrow();

            // Application preparing to quit state
            expect(() => api.quitAndInstall()).not.toThrow();

            // Multiple quit attempts
            expect(() => {
                api.quitAndInstall();
                api.quitAndInstall();
            }).not.toThrow();
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle very long URLs", async () => {
            const longUrl = `https://example.com/${"a".repeat(2000)}`;
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            const result = await api.openExternal(longUrl);
            expect(typeof result).toBe("boolean");
        });

        it("should handle special characters in URLs", async () => {
            const specialUrls = [
                "https://example.com/path with spaces",
                "https://example.com/path?query=value&other=!@#$%^&*()",
                "https://example.com/path#fragment-with-dashes",
                "https://ürün.example.com/üçüncü",
                "https://例え.テスト",
            ];

            for (const url of specialUrls) {
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(true)
                );
                const result = await api.openExternal(url);
                expect(typeof result).toBe("boolean");
            }
        });

        it("should handle null and undefined inputs gracefully", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(false));

            // These should still call IPC but likely return false
            const nullResult = await api.openExternal(
                null as unknown as string
            );
            const undefinedResult = await api.openExternal(
                undefined as unknown as string
            );

            expect(typeof nullResult).toBe("boolean");
            expect(typeof undefinedResult).toBe("boolean");
        });

        it("should handle timeout scenarios", async () => {
            const timeoutError = new Error("Operation timed out");
            mockIpcRenderer.invoke.mockRejectedValue(timeoutError);

            await expect(
                api.openExternal("https://slow-site.com")
            ).rejects.toThrow("Operation timed out");
        });

        it("should handle system resource exhaustion", async () => {
            const resourceError = new Error("System resources exhausted");
            mockIpcRenderer.invoke.mockRejectedValue(resourceError);

            await expect(
                api.openExternal("https://example.com")
            ).rejects.toThrow("System resources exhausted");
        });

        it("should handle IPC communication failures", async () => {
            const ipcError = new Error("IPC communication failed");
            mockIpcRenderer.invoke.mockRejectedValue(ipcError);

            await expect(
                api.openExternal("https://example.com")
            ).rejects.toThrow("IPC communication failed");
        });

        it("should handle quit operation when no update is available", () => {
            mockIpcRenderer.send.mockImplementation(() => {
                // Simulate no-op when no update available
            });

            expect(() => api.quitAndInstall()).not.toThrow();
            expect(mockIpcRenderer.send).toHaveBeenCalledWith(
                "quit-and-install"
            );
        });

        it("should handle rapid successive operations", async () => {
            const rapidUrls = Array.from(
                { length: 50 },
                (_, i) => `https://rapid-${i}.com`
            );

            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const promises = rapidUrls.map((url) => api.openExternal(url));
            const results = await Promise.all(promises);

            expect(results).toHaveLength(50);
            expect(results.every((result) => result === true)).toBeTruthy();
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for openExternal return values", async () => {
            const testCases = [true, false];

            for (const expectedResult of testCases) {
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(expectedResult)
                );
                const result = await api.openExternal("https://example.com");

                expect(typeof result).toBe("boolean");
                expect(result).toBe(expectedResult);
            }
        });

        it("should handle function context properly", async () => {
            const { openExternal, quitAndInstall } = api;

            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await openExternal("https://example.com");
            expect(typeof result).toBe("boolean");

            const quitResult = quitAndInstall();
            expect(quitResult).toBeUndefined();
        });

        it("should return Promise types correctly for async methods", () => {
            const promise = api.openExternal("https://example.com");
            expect(promise).toBeInstanceOf(Promise);
        });

        it("should handle parameter types correctly", async () => {
            // String parameter
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));
            await api.openExternal("https://example.com");
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "open-external",
                "https://example.com"
            );

            // Multiple parameters (via ...args)
            await api.openExternal("https://example.com", "extra-param");
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "open-external",
                "https://example.com",
                "extra-param"
            );
        });

        it("should maintain consistent API contracts", () => {
            // OpenExternal should always return Promise<boolean>
            const openPromise = api.openExternal("test");
            expect(openPromise).toBeInstanceOf(Promise);

            // QuitAndInstall should always return void (undefined)
            const quitResult = api.quitAndInstall();
            expect(quitResult).toBeUndefined();
        });

        it("should handle edge case return values gracefully", async () => {
            // Non-boolean return value should still be handled
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse("not-boolean" as unknown as boolean)
            );
            const result = await api.openExternal("https://example.com");

            // Result may not be boolean due to mock, but API contract expects boolean
            expect(result).toBe("not-boolean");
        });
    });

    describe("Performance and reliability", () => {
        it("should handle high-frequency URL opening requests", async () => {
            const startTime = Date.now();
            const urlCount = 100;

            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const promises = Array.from({ length: urlCount }, (_, i) =>
                api.openExternal(`https://perf-test-${i}.com`)
            );

            const results = await Promise.all(promises);

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(results).toHaveLength(urlCount);
            expect(results.every((result) => result === true)).toBeTruthy();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(urlCount);

            // Should complete within reasonable time (5 seconds tolerance)
            expect(duration).toBeLessThan(5000);
        });

        it("should handle memory efficiency with large data", async () => {
            const largeUrl = `https://example.com/${"x".repeat(10_000)}`;
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await api.openExternal(largeUrl);
            expect(result).toBeTruthy();
        });

        it("should maintain responsiveness during operations", async () => {
            const operationPromises: Promise<boolean>[] = [];

            // Start multiple operations
            for (let i = 0; i < 10; i++) {
                mockIpcRenderer.invoke.mockResolvedValue(
                    createIpcResponse(true)
                );
                operationPromises.push(
                    api.openExternal(`https://responsive-${i}.com`)
                );
            }

            // Operations should complete successfully
            const results = await Promise.all(operationPromises);
            expect(results.every((result) => result === true)).toBeTruthy();
        });

        it("should handle graceful degradation under load", async () => {
            const urls = Array.from(
                { length: 20 },
                (_, i) => `https://load-test-${i}.com`
            );

            // Simulate some failures under load
            mockIpcRenderer.invoke.mockImplementation((_, url) => {
                const urlIndex = Number.parseInt(url.split("-")[2], 10);
                return Promise.resolve(createIpcResponse(urlIndex % 3 !== 0)); // Fail every 3rd request
            });

            const results = await Promise.allSettled(
                urls.map((url) => api.openExternal(url))
            );

            const successful = results.filter(
                (result) =>
                    result.status === "fulfilled" && result.value === true
            );
            const failed = results.filter(
                (result) =>
                    result.status === "fulfilled" && result.value === false
            );

            expect(successful.length).toBeGreaterThan(0);
            expect(failed.length).toBeGreaterThan(0);
            expect(successful.length + failed.length).toBe(urls.length);
        });
    });
});
