/**
 * @file Comprehensive test suite for SystemService
 *
 *   Tests all system operations including external browser integration,
 *   initialization, error handling, and edge cases to achieve 95%+ coverage.
 *
 * @author Generated Test Suite
 *
 * @since 2024
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ensureError } from "@shared/utils/errorHandling";

import { SystemService } from "../../services/SystemService";

// Mock dependencies using vi.hoisted for proper initialization order
const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super("Electron bridge not ready");
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);
const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
}));

const mockElectronAPI = vi.hoisted(() => ({
    system: {
        openExternal: vi.fn(),
        quitAndInstall: vi.fn(),
        writeClipboardText: vi.fn(),
    },
}));

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();
    return {
        ...actual,
        ensureError: vi.fn(actual.ensureError),
    };
});

describe("SystemService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock implementations
        mockWaitForElectronBridge.mockResolvedValue(undefined);
        mockElectronAPI.system.openExternal.mockResolvedValue(true);
        mockElectronAPI.system.quitAndInstall.mockResolvedValue(true);
        mockElectronAPI.system.writeClipboardText.mockResolvedValue(true);

        // Set up global window.electronAPI mock
        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    describe("Service Structure", () => {
        it("should expose all required methods", () => {
            expect(SystemService).toBeDefined();
            expect(typeof SystemService.initialize).toBe("function");
            expect(typeof SystemService.openExternal).toBe("function");
            expect(typeof SystemService.quitAndInstall).toBe("function");
        });
    });

    describe("initialize", () => {
        it("should initialize successfully when electron API is available", async () => {
            await expect(SystemService.initialize()).resolves.toBeUndefined();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const error = new Error("Electron API unavailable");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(SystemService.initialize()).rejects.toThrowError(
                "Electron API unavailable"
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[SystemService] Failed to initialize:",
                error
            );
        });

        it("should handle non-error initialization failures", async () => {
            const error = "String error";
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(SystemService.initialize()).rejects.toBe(error);
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(error);
        });

        it("should handle null/undefined initialization errors", async () => {
            mockWaitForElectronBridge.mockRejectedValue(null);

            await expect(SystemService.initialize()).rejects.toBeNull();
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(null);
        });
    });

    describe("openExternal", () => {
        it("should open external URL successfully after initialization", async () => {
            const testUrl = "https://example.com";

            await expect(
                SystemService.openExternal(testUrl)
            ).resolves.toBeTruthy();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                testUrl
            );
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrowError("Initialization failed");
            expect(mockElectronAPI.system.openExternal).not.toHaveBeenCalled();
        });

        it("should handle openExternal API errors", async () => {
            const error = new Error("Failed to open external URL");
            mockElectronAPI.system.openExternal.mockRejectedValue(error);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrowError("Failed to open external URL");
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("should handle varied but valid URL formats", async () => {
            const urls = [
                "https://example.com",
                "http://localhost:3000/status",
                "https://example.com/path?query=value&other=test",
                "https://example.com/path#fragment",
                "mailto:test@example.com",
            ];

            for (const url of urls) {
                await expect(
                    SystemService.openExternal(url)
                ).resolves.toBeTruthy();
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }

            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );
        });

        it("should reject invalid or unsupported URLs before invoking IPC", async () => {
            const invalidUrls = [
                "",
                " ",
                "ftp://example.com",
                // eslint-disable-next-line no-script-url -- intentionally verifying script protocol rejection
                "javascript:alert('xss')",
                "https://example.com/path with spaces",
                // Disallow embedded credentials in URLs.
                "https://user:pass@example.com:8080/path",
            ];

            for (const url of invalidUrls) {
                await expect(
                    SystemService.openExternal(url)
                ).rejects.toBeInstanceOf(TypeError);
            }

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(
                invalidUrls.length
            );
            expect(mockElectronAPI.system.openExternal).not.toHaveBeenCalled();
            const unsafeLogs = mockLogger.error.mock.calls.filter(
                ([message]) =>
                    message === "Rejected unsafe URL for external navigation"
            );
            expect(unsafeLogs).toHaveLength(invalidUrls.length);
        });

        it("should handle URLs with encoded special characters", async () => {
            const urls = [
                "https://example.com/path%20with%20spaces",
                "https://example.com/path%3Fwith%26encoded",
                "https://example.com/%C3%A9clair",
                "http://localhost:8080/%E2%9C%93",
            ];

            for (const url of urls) {
                await expect(
                    SystemService.openExternal(url)
                ).resolves.toBeTruthy();
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }

            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );
        });
    });

    describe("quitAndInstall", () => {
        it("should trigger quit-and-install successfully", async () => {
            await expect(
                SystemService.quitAndInstall()
            ).resolves.toBeUndefined();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(mockElectronAPI.system.quitAndInstall).toHaveBeenCalledTimes(
                1
            );
        });

        it("should propagate initialization failure", async () => {
            const error = new Error("init failed");
            mockWaitForElectronBridge.mockRejectedValueOnce(error);

            await expect(SystemService.quitAndInstall()).rejects.toThrowError(
                "init failed"
            );
            expect(
                mockElectronAPI.system.quitAndInstall
            ).not.toHaveBeenCalled();
        });

        it("should reject when bridge resolves to non-boolean", async () => {
            mockElectronAPI.system.quitAndInstall.mockResolvedValueOnce(
                "invalid"
            );

            await expect(SystemService.quitAndInstall()).rejects.toThrowError(
                /Invalid response received from quitAndInstall/
            );
        });

        it("should reject when bridge reports failure", async () => {
            mockElectronAPI.system.quitAndInstall.mockResolvedValueOnce(false);

            await expect(SystemService.quitAndInstall()).rejects.toThrowError(
                "Electron declined to execute quitAndInstall request"
            );
        });

        it("should surface underlying errors", async () => {
            const failure = new Error("Updater blew up");
            mockElectronAPI.system.quitAndInstall.mockRejectedValueOnce(
                failure
            );

            await expect(SystemService.quitAndInstall()).rejects.toThrowError(
                "Updater blew up"
            );
        });
    });

    describe("writeClipboardText", () => {
        it("should write clipboard text successfully", async () => {
            await expect(
                SystemService.writeClipboardText("hello")
            ).resolves.toBeUndefined();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.system.writeClipboardText
            ).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.system.writeClipboardText
            ).toHaveBeenCalledWith("hello");
        });
    });

    describe("Integration Testing", () => {
        it("should handle multiple openExternal calls in sequence", async () => {
            const urls = [
                "https://site1.com",
                "https://site2.com",
                "https://site3.com",
            ];

            for (const url of urls) {
                await expect(
                    SystemService.openExternal(url)
                ).resolves.toBeTruthy();
            }

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(
                urls.length
            );
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );

            for (const [index, url] of urls.entries()) {
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenNthCalledWith(index + 1, url);
            }
        });

        it("should handle concurrent openExternal calls", async () => {
            const urls = [
                "https://site1.com",
                "https://site2.com",
                "https://site3.com",
            ];

            const promises = urls.map((url) => SystemService.openExternal(url));
            await expect(Promise.all(promises)).resolves.toEqual(
                Array.from({ length: urls.length }).fill(true)
            );

            // Concurrent calls share a single in-flight bridge readiness check.
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );
        });

        it("should handle repeated initialization calls gracefully", async () => {
            await SystemService.initialize();
            await SystemService.initialize();
            await SystemService.initialize();

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(3);
        });

        it("should handle mixed initialization and operation calls", async () => {
            await SystemService.initialize();
            await expect(
                SystemService.openExternal("https://example.com")
            ).resolves.toBeTruthy();
            await SystemService.initialize();
            await expect(
                SystemService.openExternal("https://another.com")
            ).resolves.toBeTruthy();

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(4); // 2 explicit + 2 from openExternal
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                2
            );
        });
    });

    describe("Error Edge Cases", () => {
        it("should handle electron API method throwing synchronously", async () => {
            mockElectronAPI.system.openExternal.mockImplementation(() => {
                throw new Error("Synchronous error");
            });

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrowError("Synchronous error");
        });

        it("should handle missing electron API gracefully", async () => {
            const error = new Error("Missing electron API");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrowError("Missing electron API");
        });

        it("should handle partial electron API gracefully", async () => {
            mockElectronAPI.system.openExternal.mockImplementation(() => {
                throw new TypeError("Cannot read properties of undefined");
            });

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrowError();
        });

        it("should handle network-like errors in open operations", async () => {
            const networkErrors = [
                new Error("Network unreachable"),
                new Error("Timeout"),
                new Error("DNS resolution failed"),
                new Error("Connection refused"),
            ];

            for (const error of networkErrors) {
                mockElectronAPI.system.openExternal.mockRejectedValueOnce(
                    error
                );
                await expect(
                    SystemService.openExternal("https://example.com")
                ).rejects.toThrowError(error.message);
            }
        });

        it("should handle permission and security errors", async () => {
            const securityErrors = [
                new Error("Permission denied"),
                new Error("Access blocked by security policy"),
                new Error("Untrusted URL"),
                new Error("Malformed URL"),
            ];

            for (const error of securityErrors) {
                mockElectronAPI.system.openExternal.mockRejectedValueOnce(
                    error
                );
                await expect(
                    SystemService.openExternal("https://example.com")
                ).rejects.toThrowError(error.message);
            }
        });
    });

    describe("URL Validation Edge Cases", () => {
        it("should handle extremely long URLs", async () => {
            const longPath = "a".repeat(2000);
            const longUrl = `https://example.com/${longPath}`;

            await expect(
                SystemService.openExternal(longUrl)
            ).resolves.toBeTruthy();
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                longUrl
            );
        });

        it("should handle unicode characters in URLs", async () => {
            const unicodeUrls = [
                "https://example.com/测试",
                "https://example.com/тест",
                "https://example.com/δοκιμή",
                "https://example.com/🚀",
                "https://example.com/café",
            ];

            for (const url of unicodeUrls) {
                await expect(
                    SystemService.openExternal(url)
                ).resolves.toBeTruthy();
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }
        });

        it("should reject navigation for unsupported browser protocols", async () => {
            const protocolUrls = [
                "data:text/html,<h1>Test</h1>",
                "blob:https://example.com/test",
                "about:blank",
                "chrome://settings",
                "file:///path/to/file.html",
            ];

            for (const url of protocolUrls) {
                await expect(
                    SystemService.openExternal(url)
                ).rejects.toBeInstanceOf(TypeError);
            }

            expect(mockElectronAPI.system.openExternal).not.toHaveBeenCalled();
        });

        it("should support encoded URLs with unusual characters", async () => {
            const unusualUrls = [
                "https://example.com/path%20with%20spaces",
                "https://example.com/path%22quotes%22",
                "https://example.com/path%60backticks%60",
                "https://example.com/path%7Bbraces%7D",
                "https://example.com/path%5Bbrackets%5D",
            ];

            for (const url of unusualUrls) {
                await expect(
                    SystemService.openExternal(url)
                ).resolves.toBeTruthy();
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }
        });
    });

    describe("Return Value Handling", () => {
        it("should handle successful openExternal returning true", async () => {
            mockElectronAPI.system.openExternal.mockResolvedValue(true);

            await expect(
                SystemService.openExternal("https://example.com")
            ).resolves.toBeTruthy();
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("should handle openExternal returning false", async () => {
            mockElectronAPI.system.openExternal.mockResolvedValue(false);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrowError(
                "Electron declined to open external URL: https://example.com"
            );
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("should handle openExternal returning unexpected values", async () => {
            const unexpectedValues = [
                null,
                undefined,
                0,
                "",
                {},
                [],
            ];

            for (const value of unexpectedValues) {
                mockElectronAPI.system.openExternal.mockResolvedValueOnce(
                    value
                );
                await expect(
                    SystemService.openExternal("https://example.com")
                ).rejects.toThrowError(
                    "Electron declined to open external URL: https://example.com"
                );
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith("https://example.com");
            }
        });
    });
});
