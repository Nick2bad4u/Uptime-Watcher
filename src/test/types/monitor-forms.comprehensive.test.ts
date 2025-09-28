/**
 * Comprehensive tests for monitor-forms.ts
 *
 * @file Src/test/types/monitor-forms.comprehensive.test.ts
 */

import type { MonitorType } from "../../../shared/types";

import {
    getDefaultMonitorFields,
    isHttpMonitorFields,
    isPingMonitorFields,
    isPortMonitorFields,
    type HttpKeywordMonitorFields,
    type HttpMonitorFields,
    type HttpStatusMonitorFields,
    type MonitorFormFields,
    type PingMonitorFields,
    type PortMonitorFields,
} from "../../types/monitor-forms";

import { describe, expect, it } from "vitest";

describe("Monitor Forms Utilities - Comprehensive Coverage", () => {
    describe(getDefaultMonitorFields, () => {
        it("should return default HTTP monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("http");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                followRedirects: true,
                headers: {},
                method: "GET",
                url: "",
            });
        });

        it("should return default HTTP keyword monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("http-keyword");

            expect(fields).toMatchObject({
                bodyKeyword: "",
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "",
            });
        });

        it("should return default HTTP status monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("http-status");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                expectedStatusCode: 200,
                retryAttempts: 3,
                timeout: 10_000,
                url: "",
            });
        });

        it("should return default ping monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("ping");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "",
            });
        });

        it("should return default port monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("port");

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "",
                port: 80,
                ipVersion: "ipv4",
                protocol: {
                    useTls: false,
                },
            });
        });

        it("should fallback to HTTP fields for unknown monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("unknown" as MonitorType);

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "",
            });
        });

        it("should handle edge case monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields = getDefaultMonitorFields("" as MonitorType);

            expect(fields).toMatchObject({
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "",
            });
        });

        it("should return objects that satisfy TypeScript interface constraints", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

    describe(isHttpMonitorFields, () => {
        it("should return true for valid HTTP monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

            expect(isHttpMonitorFields(httpFields)).toBeTruthy();
        });

        it("should return true for HTTP keyword monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const keywordFields: HttpKeywordMonitorFields = {
                bodyKeyword: "status: ok",
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com",
            };

            expect(isHttpMonitorFields(keywordFields)).toBeTruthy();
        });

        it("should return true for HTTP status monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const statusFields: HttpStatusMonitorFields = {
                checkInterval: 300_000,
                expectedStatusCode: 204,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com/status",
            };

            expect(isHttpMonitorFields(statusFields)).toBeTruthy();
        });

        it("should return false for ping monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const pingFields: PingMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
            };

            expect(isHttpMonitorFields(pingFields)).toBeFalsy();
        });

        it("should return false for port monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const portFields: PortMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
                port: 80,
                ipVersion: "ipv4",
                protocol: {
                    useTls: false,
                },
            };

            expect(isHttpMonitorFields(portFields)).toBeFalsy();
        });

        it("should handle fields with both url and host (edge case)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mixedFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                url: "https://example.com",
                host: "example.com",
            } as MonitorFormFields;

            // Should return false because host is present
            expect(isHttpMonitorFields(mixedFields)).toBeFalsy();
        });

        it("should handle minimal HTTP fields", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const minimalFields = {
                url: "https://example.com",
            } as MonitorFormFields;

            expect(isHttpMonitorFields(minimalFields)).toBeTruthy();
        });
    });

    describe(isPingMonitorFields, () => {
        it("should return true for valid ping monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const pingFields: PingMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
            };

            expect(isPingMonitorFields(pingFields)).toBeTruthy();
        });

        it("should return false for HTTP monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

            expect(isPingMonitorFields(httpFields)).toBeFalsy();
        });

        it("should return false for port monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const portFields: PortMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
                port: 80,
                ipVersion: "ipv4",
                protocol: {
                    useTls: false,
                },
            };

            expect(isPingMonitorFields(portFields)).toBeFalsy();
        });

        it("should validate host is a string", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            const invalidPingFields = {
                host: 123,
                checkInterval: 300_000,
            } as unknown as MonitorFormFields;

            expect(isPingMonitorFields(invalidPingFields)).toBeFalsy();
        });

        it("should return false when host is present but url is also present", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mixedFields = {
                host: "example.com",
                url: "https://example.com",
            } as MonitorFormFields;

            expect(isPingMonitorFields(mixedFields)).toBeFalsy();
        });

        it("should handle minimal ping fields", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const minimalFields = {
                host: "example.com",
            } as MonitorFormFields;

            expect(isPingMonitorFields(minimalFields)).toBeTruthy();
        });
    });

    describe(isPortMonitorFields, () => {
        it("should return true for valid port monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const portFields: PortMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
                port: 80,
                ipVersion: "ipv4",
                protocol: {
                    useTls: false,
                },
            };

            expect(isPortMonitorFields(portFields)).toBeTruthy();
        });

        it("should return false for HTTP monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

            expect(isPortMonitorFields(httpFields)).toBeFalsy();
        });

        it("should return false for ping monitor fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const pingFields: PingMonitorFields = {
                checkInterval: 300_000,
                retryAttempts: 3,
                timeout: 10_000,
                host: "example.com",
            };

            expect(isPortMonitorFields(pingFields)).toBeFalsy();
        });

        it("should validate both host and port are correct types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            const invalidHostFields = {
                host: 123,
                port: 80,
            } as unknown as MonitorFormFields;

            const invalidPortFields = {
                host: "example.com",
                port: "80",
            } as unknown as MonitorFormFields;

            expect(isPortMonitorFields(invalidHostFields)).toBeFalsy();
            expect(isPortMonitorFields(invalidPortFields)).toBeFalsy();
        });

        it("should return false when only host is present (missing port)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteFields = {
                host: "example.com",
            } as MonitorFormFields;

            expect(isPortMonitorFields(incompleteFields)).toBeFalsy();
        });

        it("should return false when only port is present (missing host)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteFields = {
                port: 80,
            } as MonitorFormFields;

            expect(isPortMonitorFields(incompleteFields)).toBeFalsy();
        });

        it("should handle minimal port fields", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const minimalFields = {
                host: "example.com",
                port: 80,
            } as MonitorFormFields;

            expect(isPortMonitorFields(minimalFields)).toBeTruthy();
        });
    });

    describe("Type Guards Integration", () => {
        it("should correctly identify different monitor types in an array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fields: MonitorFormFields[] = [
                { url: "https://example.com" } as HttpMonitorFields,
                { host: "example.com" } as PingMonitorFields,
                { host: "example.com", port: 80 } as PortMonitorFields,
            ];

            expect(isHttpMonitorFields(fields[0]!)).toBeTruthy();
            expect(isPingMonitorFields(fields[0]!)).toBeFalsy();
            expect(isPortMonitorFields(fields[0]!)).toBeFalsy();

            expect(isHttpMonitorFields(fields[1]!)).toBeFalsy();
            expect(isPingMonitorFields(fields[1]!)).toBeTruthy();
            expect(isPortMonitorFields(fields[1]!)).toBeFalsy();

            expect(isHttpMonitorFields(fields[2]!)).toBeFalsy();
            expect(isPingMonitorFields(fields[2]!)).toBeFalsy();
            expect(isPortMonitorFields(fields[2]!)).toBeTruthy();
        });

        it("should handle edge cases with empty objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const emptyFields = {} as MonitorFormFields;

            expect(isHttpMonitorFields(emptyFields)).toBeFalsy();
            expect(isPingMonitorFields(emptyFields)).toBeFalsy();
            expect(isPortMonitorFields(emptyFields)).toBeFalsy();
        });
    });

    describe("Base Fields Consistency", () => {
        it("should ensure all monitor types include base fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-forms", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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
