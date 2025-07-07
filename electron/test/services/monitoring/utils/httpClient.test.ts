/**
 * Tests for HTTP client utilities.
 * Tests the Axios configuration and timing interceptors.
 */

 

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios, { AxiosInstance } from "axios";
import { createHttpClient, setupTimingInterceptors } from "../../../../services/monitoring/utils/httpClient";
import { MonitorConfig } from "../../../../services/monitoring/types";

// Mock axios
vi.mock("axios", () => ({
    default: {
        create: vi.fn(),
    },
}));

// Mock http and https agents
vi.mock("http", () => ({
    Agent: vi.fn(),
}));

vi.mock("https", () => ({
    Agent: vi.fn(),
}));

describe("HTTP Client Utils", () => {
    const mockAxiosCreate = vi.mocked(axios.create);
    const mockAxiosInstance = {
        interceptors: {
            request: {
                use: vi.fn(),
            },
            response: {
                use: vi.fn(),
            },
        },
    } as unknown as AxiosInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        mockAxiosCreate.mockReturnValue(mockAxiosInstance);
    });

    describe("createHttpClient", () => {
        it("should create axios instance with default config", () => {
            // Arrange
            const config: MonitorConfig = {
                userAgent: "test-agent",
                timeout: 5000,
            };

            // Act
            const result = createHttpClient(config);

            // Assert
            expect(result).toBe(mockAxiosInstance);
            expect(mockAxiosCreate).toHaveBeenCalledWith({
                headers: {
                    "User-Agent": "test-agent",
                },
                httpAgent: expect.any(Object),
                httpsAgent: expect.any(Object),
                maxBodyLength: 1024,
                maxContentLength: 10 * 1024 * 1024,
                maxRedirects: 5,
                responseType: "text",
                timeout: 5000,
                validateStatus: expect.any(Function),
            });
        });

        it("should create axios instance with minimal config", () => {
            // Arrange
            const config: MonitorConfig = {};

            // Act
            const result = createHttpClient(config);

            // Assert
            expect(result).toBe(mockAxiosInstance);
            expect(mockAxiosCreate).toHaveBeenCalledWith({
                headers: {
                    "User-Agent": undefined,
                },
                httpAgent: expect.any(Object),
                httpsAgent: expect.any(Object),
                maxBodyLength: 1024,
                maxContentLength: 10 * 1024 * 1024,
                maxRedirects: 5,
                responseType: "text",
                timeout: undefined,
                validateStatus: expect.any(Function),
            });
        });

        it("should configure validateStatus to always return true", () => {
            // Arrange
            const config: MonitorConfig = {
                timeout: 5000,
            };

            // Act
            createHttpClient(config);

            // Assert
            const axiosConfig = mockAxiosCreate.mock.calls[0]?.[0];
            expect(axiosConfig).toBeDefined();
            expect(axiosConfig?.validateStatus).toBeDefined();
            expect(axiosConfig?.validateStatus!(200)).toBe(true);
            expect(axiosConfig?.validateStatus!(404)).toBe(true);
            expect(axiosConfig?.validateStatus!(500)).toBe(true);
        });

        it("should setup timing interceptors", () => {
            // Arrange
            const config: MonitorConfig = {
                timeout: 5000,
            };

            // Act
            createHttpClient(config);

            // Assert
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
    });

    describe("setupTimingInterceptors", () => {
        it("should setup request and response interceptors", () => {
            // Arrange
            const mockInstance = {
                interceptors: {
                    request: {
                        use: vi.fn(),
                    },
                    response: {
                        use: vi.fn(),
                    },
                },
            } as unknown as AxiosInstance;

            // Act
            setupTimingInterceptors(mockInstance);

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

        it("should add start time metadata to request config", () => {
            // Arrange
            const mockInstance = {
                interceptors: {
                    request: {
                        use: vi.fn(),
                    },
                    response: {
                        use: vi.fn(),
                    },
                },
            } as unknown as AxiosInstance;

            vi.spyOn(performance, "now").mockReturnValue(1234567890);

            // Act
            setupTimingInterceptors(mockInstance);

            // Get the request interceptor function
            const requestInterceptor = (mockInstance.interceptors.request.use as any).mock.calls[0][0];
            const config = {} as any;
            const result = requestInterceptor(config);

            // Assert
            expect(result).toEqual({
                metadata: {
                    startTime: 1234567890,
                },
            });
        });

        it("should calculate response time for successful response", () => {
            // Arrange
            const mockInstance = {
                interceptors: {
                    request: {
                        use: vi.fn(),
                    },
                    response: {
                        use: vi.fn(),
                    },
                },
            } as unknown as AxiosInstance;

            const startTime = 1000;
            const endTime = 1500;
            vi.spyOn(performance, "now").mockReturnValue(endTime);

            // Act
            setupTimingInterceptors(mockInstance);

            // Get the response interceptor function
            const responseInterceptor = (mockInstance.interceptors.response.use as any).mock.calls[0][0];
            const response = {
                config: {
                    metadata: {
                        startTime,
                    },
                },
            } as any;

            const result = responseInterceptor(response);

            // Assert
            expect(result.responseTime).toBe(500); // 1500 - 1000
        });

        it("should not calculate response time if no start time", () => {
            // Arrange
            const mockInstance = {
                interceptors: {
                    request: {
                        use: vi.fn(),
                    },
                    response: {
                        use: vi.fn(),
                    },
                },
            } as unknown as AxiosInstance;

            // Act
            setupTimingInterceptors(mockInstance);

            // Get the response interceptor function
            const responseInterceptor = (mockInstance.interceptors.response.use as any).mock.calls[0][0];
            const response = {
                config: {},
            } as any;

            const result = responseInterceptor(response);

            // Assert
            expect(result.responseTime).toBeUndefined();
        });

        it("should handle request and response interceptor errors", async () => {
            // Arrange
            const mockInstance = {
                interceptors: {
                    request: {
                        use: vi.fn(),
                    },
                    response: {
                        use: vi.fn(),
                    },
                },
            } as unknown as AxiosInstance;

            // Act
            setupTimingInterceptors(mockInstance);

            // Get the interceptor error handlers
            const requestErrorHandler = (mockInstance.interceptors.request.use as any).mock.calls[0][1];
            const responseErrorHandler = (mockInstance.interceptors.response.use as any).mock.calls[0][1];

            // Test request error handler
            const requestError = new Error("Request error");
            await expect(requestErrorHandler(requestError)).rejects.toThrow("Request error");

            // Test response error handler
            const responseError = new Error("Response error");
            await expect(responseErrorHandler(responseError)).rejects.toThrow("Response error");

            // Test with non-Error objects
            await expect(requestErrorHandler("String error")).rejects.toThrow("String error");
            await expect(responseErrorHandler("String error")).rejects.toThrow("String error");
        });

        it("should calculate response time for error responses", () => {
            // Arrange
            const mockInstance = {
                interceptors: {
                    request: {
                        use: vi.fn(),
                    },
                    response: {
                        use: vi.fn(),
                    },
                },
            } as unknown as AxiosInstance;

            const startTime = 1000;
            const endTime = 1750;
            vi.spyOn(performance, "now").mockReturnValue(endTime);

            // Act
            setupTimingInterceptors(mockInstance);

            // Get the response error handler
            const responseErrorHandler = (mockInstance.interceptors.response.use as any).mock.calls[0][1];
            const error = {
                config: {
                    metadata: {
                        startTime,
                    },
                },
            } as any;

            // Test error handler modifies the error object with response time
            try {
                responseErrorHandler(error);
            } catch (modifiedError: any) {
                expect(modifiedError.responseTime).toBe(750); // 1750 - 1000
            }
        });
    });
});
