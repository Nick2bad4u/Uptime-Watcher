/**
 * Comprehensive tests for monitor-forms.ts
 * @file src/test/types/monitor-forms.comprehensive.test.ts
 */

import {
    getDefaultMonitorFields,
    isHttpMonitorFields,
    isPingMonitorFields,
    isPortMonitorFields,
    type HttpMonitorFields,
    type PingMonitorFields,
    type PortMonitorFields,
    type MonitorFormFields,
} from "../../types/monitor-forms";

// Import MonitorType from shared types
type MonitorType = "http" | "ping" | "port";

describe("Monitor Forms Utilities - Comprehensive Coverage", () => {
    describe("getDefaultMonitorFields", () => {
        it("should return default HTTP monitor fields", () => {
            const fields = getDefaultMonitorFields("http");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                expectedStatusCode: 200,
                followRedirects: true,
                headers: {},
                method: "GET",
                url: "",
            });
        });

        it("should return default ping monitor fields", () => {
            const fields = getDefaultMonitorFields("ping");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "",
            });
        });

        it("should return default port monitor fields", () => {
            const fields = getDefaultMonitorFields("port");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                connectionType: "tcp",
                host: "",
                port: 80,
            });
        });

        it("should fallback to HTTP fields for unknown monitor types", () => {
            const fields = getDefaultMonitorFields("unknown" as MonitorType);

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "",
            });
        });

        it("should handle edge case monitor types", () => {
            const fields = getDefaultMonitorFields("" as MonitorType);

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "",
            });
        });

        it("should return objects that satisfy TypeScript interface constraints", () => {
            const httpFields = getDefaultMonitorFields("http");
            const pingFields = getDefaultMonitorFields("ping");
            const portFields = getDefaultMonitorFields("port");

            // These checks ensure the returned objects satisfy the interfaces
            expect(httpFields).toHaveProperty("url");
            expect(httpFields).toHaveProperty("method");
            expect(pingFields).toHaveProperty("host");
            expect(portFields).toHaveProperty("host");
            expect(portFields).toHaveProperty("port");
        });
    });

    describe("isHttpMonitorFields", () => {
        it("should return true for valid HTTP monitor fields", () => {
            const httpFields: HttpMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com",
                method: "GET",
                expectedStatusCode: 200,
                followRedirects: true,
                headers: {},
            };

            expect(isHttpMonitorFields(httpFields)).toBe(true);
        });

        it("should return false for ping monitor fields", () => {
            const pingFields: PingMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
            };

            expect(isHttpMonitorFields(pingFields)).toBe(false);
        });

        it("should return false for port monitor fields", () => {
            const portFields: PortMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
                port: 80,
                connectionType: "tcp",
            };

            expect(isHttpMonitorFields(portFields)).toBe(false);
        });

        it("should handle fields with both url and host (edge case)", () => {
            const mixedFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com",
                host: "example.com",
            } as MonitorFormFields;

            // Should return false because host is present
            expect(isHttpMonitorFields(mixedFields)).toBe(false);
        });

        it("should handle minimal HTTP fields", () => {
            const minimalFields = {
                url: "https://example.com",
            } as MonitorFormFields;

            expect(isHttpMonitorFields(minimalFields)).toBe(true);
        });
    });

    describe("isPingMonitorFields", () => {
        it("should return true for valid ping monitor fields", () => {
            const pingFields: PingMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
            };

            expect(isPingMonitorFields(pingFields)).toBe(true);
        });

        it("should return false for HTTP monitor fields", () => {
            const httpFields: HttpMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com",
                method: "GET",
                expectedStatusCode: 200,
                followRedirects: true,
                headers: {},
            };

            expect(isPingMonitorFields(httpFields)).toBe(false);
        });

        it("should return false for port monitor fields", () => {
            const portFields: PortMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
                port: 80,
                connectionType: "tcp",
            };

            expect(isPingMonitorFields(portFields)).toBe(false);
        });

        it("should validate host is a string", () => {
            const invalidPingFields = {
                host: 123,
                checkInterval: 300_000,
            } as unknown as MonitorFormFields;

            expect(isPingMonitorFields(invalidPingFields)).toBe(false);
        });

        it("should return false when host is present but url is also present", () => {
            const mixedFields = {
                host: "example.com",
                url: "https://example.com",
            } as MonitorFormFields;

            expect(isPingMonitorFields(mixedFields)).toBe(false);
        });

        it("should handle minimal ping fields", () => {
            const minimalFields = {
                host: "example.com",
            } as MonitorFormFields;

            expect(isPingMonitorFields(minimalFields)).toBe(true);
        });
    });

    describe("isPortMonitorFields", () => {
        it("should return true for valid port monitor fields", () => {
            const portFields: PortMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
                port: 80,
                connectionType: "tcp",
            };

            expect(isPortMonitorFields(portFields)).toBe(true);
        });

        it("should return false for HTTP monitor fields", () => {
            const httpFields: HttpMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com",
                method: "GET",
                expectedStatusCode: 200,
                followRedirects: true,
                headers: {},
            };

            expect(isPortMonitorFields(httpFields)).toBe(false);
        });

        it("should return false for ping monitor fields", () => {
            const pingFields: PingMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
            };

            expect(isPortMonitorFields(pingFields)).toBe(false);
        });

        it("should validate both host and port are correct types", () => {
            const invalidHostFields = {
                host: 123,
                port: 80,
            } as unknown as MonitorFormFields;

            const invalidPortFields = {
                host: "example.com",
                port: "80",
            } as unknown as MonitorFormFields;

            expect(isPortMonitorFields(invalidHostFields)).toBe(false);
            expect(isPortMonitorFields(invalidPortFields)).toBe(false);
        });

        it("should return false when only host is present (missing port)", () => {
            const incompleteFields = {
                host: "example.com",
            } as MonitorFormFields;

            expect(isPortMonitorFields(incompleteFields)).toBe(false);
        });

        it("should return false when only port is present (missing host)", () => {
            const incompleteFields = {
                port: 80,
            } as MonitorFormFields;

            expect(isPortMonitorFields(incompleteFields)).toBe(false);
        });

        it("should handle minimal port fields", () => {
            const minimalFields = {
                host: "example.com",
                port: 80,
            } as MonitorFormFields;

            expect(isPortMonitorFields(minimalFields)).toBe(true);
        });
    });

    describe("Type Guards Integration", () => {
        it("should correctly identify different monitor types in an array", () => {
            const fields: MonitorFormFields[] = [
                { url: "https://example.com" } as HttpMonitorFields,
                { host: "example.com" } as PingMonitorFields,
                { host: "example.com", port: 80 } as PortMonitorFields,
            ];

            expect(isHttpMonitorFields(fields[0]!)).toBe(true);
            expect(isPingMonitorFields(fields[0]!)).toBe(false);
            expect(isPortMonitorFields(fields[0]!)).toBe(false);

            expect(isHttpMonitorFields(fields[1]!)).toBe(false);
            expect(isPingMonitorFields(fields[1]!)).toBe(true);
            expect(isPortMonitorFields(fields[1]!)).toBe(false);

            expect(isHttpMonitorFields(fields[2]!)).toBe(false);
            expect(isPingMonitorFields(fields[2]!)).toBe(false);
            expect(isPortMonitorFields(fields[2]!)).toBe(true);
        });

        it("should handle edge cases with empty objects", () => {
            const emptyFields = {} as MonitorFormFields;

            expect(isHttpMonitorFields(emptyFields)).toBe(false);
            expect(isPingMonitorFields(emptyFields)).toBe(false);
            expect(isPortMonitorFields(emptyFields)).toBe(false);
        });
    });

    describe("Base Fields Consistency", () => {
        it("should ensure all monitor types include base fields", () => {
            const httpFields = getDefaultMonitorFields("http");
            const pingFields = getDefaultMonitorFields("ping");
            const portFields = getDefaultMonitorFields("port");

            const expectedBaseFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
            };

            expect(httpFields).toMatchObject(expectedBaseFields);
            expect(pingFields).toMatchObject(expectedBaseFields);
            expect(portFields).toMatchObject(expectedBaseFields);
        });
    });
});
