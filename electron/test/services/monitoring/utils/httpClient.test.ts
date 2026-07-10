/**
 * Tests for HTTP client utilities. Tests the Axios configuration and timing
 * interceptors.
 */

import type { AxiosInstance } from "axios";
import type { Mock } from "vitest";

import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorServiceConfig } from "../../../../services/monitoring/types";

import { createHttpClient } from "../../../../services/monitoring/utils/httpClient";

// Mock axios
vi.mock("axios", () => ({
    default: {
        create: vi.fn(),
    },
}));

// Mock HTTP and HTTPS agents (node: specifiers match implementation)
vi.mock("node:http", () => ({
    Agent: vi.fn(),
}));

vi.mock("node:https", () => ({
    Agent: vi.fn(),
}));

describe("HTTP Client Utils", () => {
    const mockAxiosCreate = vi.mocked(axios.create);

    type InterceptorHandler = (value: unknown) => unknown;
    type InterceptorUse = (
        onFulfilled?: InterceptorHandler | null,
        onRejected?: InterceptorHandler | null
    ) => number;
    interface MockAxiosInstance {
        interceptors: {
            request: {
                use: Mock<InterceptorUse>;
            };
            response: {
                use: Mock<InterceptorUse>;
            };
        };
    }

    const createMockAxiosInstance = (): MockAxiosInstance => ({
        interceptors: {
            request: {
                use: vi.fn<InterceptorUse>(),
            },
            response: {
                use: vi.fn<InterceptorUse>(),
            },
        },
    });

    const asAxiosInstance = (instance: MockAxiosInstance): AxiosInstance =>
        instance as unknown as AxiosInstance;

    const getInterceptorHandlers = (use: Mock<InterceptorUse>) => {
        const call = use.mock.calls[0];
        if (!call) {
            throw new Error("Expected an interceptor to be registered");
        }

        const [interceptor, errorHandler] = call;
        if (
            typeof interceptor !== "function" ||
            typeof errorHandler !== "function"
        ) {
            throw new TypeError(
                "Expected both interceptor handlers to be functions"
            );
        }

        return { errorHandler, interceptor };
    };

    const getResponseTime = (value: unknown): unknown => {
        if (typeof value !== "object" || value === null) {
            throw new TypeError("Expected an interceptor response object");
        }

        return Reflect.get(value, "responseTime");
    };

    const mockAxiosInstance = createMockAxiosInstance();

    beforeEach(() => {
        vi.clearAllMocks();
        mockAxiosCreate.mockReturnValue(asAxiosInstance(mockAxiosInstance));
    });

    const setupClientAndGetInterceptors = (
        instance: MockAxiosInstance = createMockAxiosInstance()
    ) => {
        mockAxiosCreate.mockReturnValueOnce(asAxiosInstance(instance));
        createHttpClient({});

        const requestHandlers = getInterceptorHandlers(
            instance.interceptors.request.use
        );
        const responseHandlers = getInterceptorHandlers(
            instance.interceptors.response.use
        );

        return {
            instance,
            requestErrorHandler: requestHandlers.errorHandler,
            requestInterceptor: requestHandlers.interceptor,
            responseErrorHandler: responseHandlers.errorHandler,
            responseInterceptor: responseHandlers.interceptor,
        };
    };
    describe(createHttpClient, () => {
        it("should create axios instance with default config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            const config: MonitorServiceConfig = {
                userAgent: "test-agent",
                timeout: 5000,
            };

            // Act
            const result = createHttpClient(config);

            // Assert
            expect(result).toBe(mockAxiosInstance);
            expect(mockAxiosCreate).toHaveBeenCalledWith({
                headers: expect.objectContaining({
                    Accept: "*/*",
                    "User-Agent": "test-agent",
                }),
                httpAgent: expect.any(Object),
                httpsAgent: expect.any(Object),
                maxBodyLength: 8 * 1024, // 8KB default
                maxContentLength: 1 * 1024 * 1024, // 1MB default
                maxRedirects: 3, // Tightened default
                beforeRedirect: expect.any(Function),
                responseType: "text",
                timeout: 5000,
                validateStatus: expect.any(Function),
            });
            expect(
                Object.getPrototypeOf(
                    mockAxiosCreate.mock.calls[0]?.[0]?.headers
                )
            ).toBeNull();
        });
        it("should create axios instance with minimal config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            const config: MonitorServiceConfig = {};

            // Act
            const result = createHttpClient(config);

            // Assert
            expect(result).toBe(mockAxiosInstance);
            expect(mockAxiosCreate).toHaveBeenCalledWith({
                headers: expect.objectContaining({ Accept: "*/*" }),
                httpAgent: expect.any(Object),
                httpsAgent: expect.any(Object),
                maxBodyLength: 8 * 1024,
                maxContentLength: 1 * 1024 * 1024,
                maxRedirects: 3,
                beforeRedirect: expect.any(Function),
                responseType: "text",
                validateStatus: expect.any(Function),
            });
            expect(
                Object.getPrototypeOf(
                    mockAxiosCreate.mock.calls[0]?.[0]?.headers
                )
            ).toBeNull();
        });
        it("should configure validateStatus to accept all statuses (lenient)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            const config: MonitorServiceConfig = {
                timeout: 5000,
            };

            // Act
            createHttpClient(config);

            // Assert
            const axiosConfig = mockAxiosCreate.mock.calls[0]?.[0];
            expect(axiosConfig).toBeDefined();
            expect(axiosConfig?.validateStatus).toBeDefined();
            expect(axiosConfig?.validateStatus!(200)).toBeTruthy();
            expect(axiosConfig?.validateStatus!(302)).toBeTruthy();
            expect(axiosConfig?.validateStatus!(404)).toBeTruthy();
            expect(axiosConfig?.validateStatus!(500)).toBeTruthy();
        });
        it("should remain lenient regardless of UW_HTTP_STRICT_STATUS env", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            const original = process.env["UW_HTTP_STRICT_STATUS"];
            process.env["UW_HTTP_STRICT_STATUS"] = "false";

            try {
                createHttpClient({});
                const axiosConfig = mockAxiosCreate.mock.calls[0]?.[0];
                expect(axiosConfig?.validateStatus).toBeDefined();
                expect(axiosConfig?.validateStatus!(200)).toBeTruthy();
                expect(axiosConfig?.validateStatus!(302)).toBeTruthy();
                expect(axiosConfig?.validateStatus!(404)).toBeTruthy();
                expect(axiosConfig?.validateStatus!(500)).toBeTruthy();
            } finally {
                if (original === undefined) {
                    delete process.env["UW_HTTP_STRICT_STATUS"];
                } else {
                    process.env["UW_HTTP_STRICT_STATUS"] = original;
                }
            }
        });
        it("should clamp oversized HTTP environment tunables", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            const originalValues = {
                UW_HTTP_KEEP_ALIVE_MSECS:
                    process.env["UW_HTTP_KEEP_ALIVE_MSECS"],
                UW_HTTP_MAX_BODY_LENGTH: process.env["UW_HTTP_MAX_BODY_LENGTH"],
                UW_HTTP_MAX_CONTENT_LENGTH:
                    process.env["UW_HTTP_MAX_CONTENT_LENGTH"],
                UW_HTTP_MAX_FREE_SOCKETS:
                    process.env["UW_HTTP_MAX_FREE_SOCKETS"],
                UW_HTTP_MAX_REDIRECTS: process.env["UW_HTTP_MAX_REDIRECTS"],
                UW_HTTP_MAX_SOCKETS: process.env["UW_HTTP_MAX_SOCKETS"],
            };

            process.env["UW_HTTP_KEEP_ALIVE_MSECS"] = "999999999";
            process.env["UW_HTTP_MAX_BODY_LENGTH"] = "999999999";
            process.env["UW_HTTP_MAX_CONTENT_LENGTH"] = "999999999";
            process.env["UW_HTTP_MAX_FREE_SOCKETS"] = "999999999";
            process.env["UW_HTTP_MAX_REDIRECTS"] = "999999999";
            process.env["UW_HTTP_MAX_SOCKETS"] = "999999999";

            try {
                vi.resetModules();
                const freshAxios = vi.mocked((await import("axios")).default);
                freshAxios.create.mockReturnValue(
                    asAxiosInstance(mockAxiosInstance)
                );

                const { createHttpClient: createFreshHttpClient } =
                    await import("../../../../services/monitoring/utils/httpClient");

                createFreshHttpClient({});

                expect(freshAxios.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        maxBodyLength: 1 * 1024 * 1024,
                        maxContentLength: 10 * 1024 * 1024,
                        maxRedirects: 10,
                    })
                );
            } finally {
                if (originalValues.UW_HTTP_KEEP_ALIVE_MSECS === undefined) {
                    delete process.env["UW_HTTP_KEEP_ALIVE_MSECS"];
                } else {
                    process.env["UW_HTTP_KEEP_ALIVE_MSECS"] =
                        originalValues.UW_HTTP_KEEP_ALIVE_MSECS;
                }

                if (originalValues.UW_HTTP_MAX_BODY_LENGTH === undefined) {
                    delete process.env["UW_HTTP_MAX_BODY_LENGTH"];
                } else {
                    process.env["UW_HTTP_MAX_BODY_LENGTH"] =
                        originalValues.UW_HTTP_MAX_BODY_LENGTH;
                }

                if (originalValues.UW_HTTP_MAX_CONTENT_LENGTH === undefined) {
                    delete process.env["UW_HTTP_MAX_CONTENT_LENGTH"];
                } else {
                    process.env["UW_HTTP_MAX_CONTENT_LENGTH"] =
                        originalValues.UW_HTTP_MAX_CONTENT_LENGTH;
                }

                if (originalValues.UW_HTTP_MAX_FREE_SOCKETS === undefined) {
                    delete process.env["UW_HTTP_MAX_FREE_SOCKETS"];
                } else {
                    process.env["UW_HTTP_MAX_FREE_SOCKETS"] =
                        originalValues.UW_HTTP_MAX_FREE_SOCKETS;
                }

                if (originalValues.UW_HTTP_MAX_REDIRECTS === undefined) {
                    delete process.env["UW_HTTP_MAX_REDIRECTS"];
                } else {
                    process.env["UW_HTTP_MAX_REDIRECTS"] =
                        originalValues.UW_HTTP_MAX_REDIRECTS;
                }

                if (originalValues.UW_HTTP_MAX_SOCKETS === undefined) {
                    delete process.env["UW_HTTP_MAX_SOCKETS"];
                } else {
                    process.env["UW_HTTP_MAX_SOCKETS"] =
                        originalValues.UW_HTTP_MAX_SOCKETS;
                }
                vi.resetModules();
            }
        });
        it("should setup timing interceptors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            const config: MonitorServiceConfig = {
                timeout: 5000,
            };

            // Act
            createHttpClient(config);

            // Assert
            expect(
                mockAxiosInstance.interceptors.request.use
            ).toHaveBeenCalled();
            expect(
                mockAxiosInstance.interceptors.response.use
            ).toHaveBeenCalled();
        });
    });
    describe("timing interceptors", () => {
        it("should setup request and response interceptors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            const mockInstance = createMockAxiosInstance();

            // Act
            setupClientAndGetInterceptors(mockInstance);

            // Assert
            expect(mockInstance.interceptors.request.use).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function)
            );
            expect(mockInstance.interceptors.response.use).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function)
            );
        });
        it("should add start time metadata to request config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            vi.spyOn(performance, "now").mockReturnValue(1_234_567_890);

            // Act
            const { requestInterceptor } = setupClientAndGetInterceptors();
            const config = {};
            const result = requestInterceptor(config);

            // Assert
            expect(result).toEqual({
                metadata: {
                    startTime: 1_234_567_890,
                },
            });
        });
        it("should calculate response time for successful response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            const startTime = 1000;
            const endTime = 1500;
            vi.spyOn(performance, "now").mockReturnValue(endTime);

            // Act
            const { responseInterceptor } = setupClientAndGetInterceptors();
            const response = {
                config: {
                    metadata: {
                        startTime,
                    },
                },
            };

            const result = responseInterceptor(response);

            // Assert
            expect(getResponseTime(result)).toBe(500); // 1500 - 1000
        });
        it("should calculate response time when start time is zero", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            vi.spyOn(performance, "now").mockReturnValue(250);

            // Act
            const { responseInterceptor } = setupClientAndGetInterceptors();
            const response = {
                config: {
                    metadata: {
                        startTime: 0,
                    },
                },
            };

            const result = responseInterceptor(response);

            // Assert
            expect(getResponseTime(result)).toBe(250);
        });
        it("should not calculate response time if no start time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            // Arrange
            // Act
            const { responseInterceptor } = setupClientAndGetInterceptors();
            const response = {
                config: {},
            };

            const result = responseInterceptor(response);

            // Assert
            expect(getResponseTime(result)).toBeUndefined();
        });
        it("should handle request and response interceptor errors", async () => {
            // Act
            const { requestErrorHandler, responseErrorHandler } =
                setupClientAndGetInterceptors();

            // Test request error handler
            const requestError = new Error("Request error");
            await expect(requestErrorHandler(requestError)).rejects.toThrow(
                "Request error"
            );

            // Test response error handler
            const responseError = new Error("Response error");
            await expect(responseErrorHandler(responseError)).rejects.toThrow(
                "Response error"
            );

            // Test with non-Error objects
            await expect(requestErrorHandler("String error")).rejects.toThrow(
                "String error"
            );
            await expect(responseErrorHandler("String error")).rejects.toThrow(
                "String error"
            );
        });
        it("should calculate response time for error responses", async () => {
            const startTime = 1000;
            const endTime = 1750;
            vi.spyOn(performance, "now").mockReturnValue(endTime);

            // Act
            const { responseErrorHandler } = setupClientAndGetInterceptors();
            const error: {
                config: { metadata: { startTime: number } };
                responseTime?: number;
            } = {
                config: {
                    metadata: {
                        startTime,
                    },
                },
            };

            // Test error handler modifies the error object with response time
            await expect(responseErrorHandler(error)).rejects.toThrow();

            // The error should have been modified with response time
            expect(error.responseTime).toBe(750); // 1750 - 1000
        });

        it("does not invoke accessor-backed error timing fields", async () => {
            const getter = vi.fn(() => {
                throw new Error("timing getter should not run");
            });
            const config = {};
            Object.defineProperty(config, "metadata", {
                enumerable: true,
                get: getter,
            });
            const error = { config };

            const { responseErrorHandler } = setupClientAndGetInterceptors();

            await expect(responseErrorHandler(error)).rejects.toThrow();
            expect(getter).not.toHaveBeenCalled();
            expect(error).not.toHaveProperty("responseTime");
        });

        it("does not invoke accessor-backed redirect option fields", () => {
            const getter = vi.fn(() => {
                throw new Error("redirect getter should not run");
            });
            createHttpClient({});
            const beforeRedirect =
                mockAxiosCreate.mock.calls.at(-1)?.[0]?.beforeRedirect;
            expect(beforeRedirect).toBeTypeOf("function");
            const options = {};
            Object.defineProperties(options, {
                auth: {
                    enumerable: true,
                    get: getter,
                },
                protocol: {
                    enumerable: true,
                    get: getter,
                },
            });

            expect(() => {
                beforeRedirect?.(
                    options,
                    { headers: {}, statusCode: 302 },
                    { headers: {}, method: "GET", url: "https://example.com" }
                );
            }).not.toThrow();
            expect(getter).not.toHaveBeenCalled();
        });
    });
});
