import { describe, expect, it } from "vitest";
import type {
    AddSiteFormState,
    FormMode,
    HttpFormData,
    MonitorFieldValidation,
    MonitorFormData,
    PingFormData,
    PortFormData,
    SiteFormData,
} from "../../../../shared/types/formData";
import {
    DEFAULT_FORM_DATA,
    isHttpFormData,
    isPingFormData,
    isPortFormData,
} from "../../../../shared/types/formData";

describe("FormData Types", () => {
    describe("SiteFormData", () => {
        it("should define proper structure", () => {
            const validSiteFormData: SiteFormData = {
                identifier: "site-123",
                name: "Test Site",
                monitor: {
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 300000,
                    retryAttempts: 3,
                    timeout: 30000,
                },
            };

            expect(validSiteFormData.identifier).toBe("site-123");
            expect(validSiteFormData.name).toBe("Test Site");
            expect(validSiteFormData.monitor).toBeDefined();
            expect(validSiteFormData.monitor.type).toBe("http");
        });

        it("should allow different monitor types", () => {
            const httpSite: SiteFormData = {
                identifier: "http-site",
                name: "HTTP Site",
                monitor: {
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 300000,
                    retryAttempts: 3,
                    timeout: 30000,
                },
            };

            const pingSite: SiteFormData = {
                identifier: "ping-site",
                name: "Ping Site",
                monitor: {
                    type: "ping",
                    host: "example.com",
                    checkInterval: 300000,
                    retryAttempts: 3,
                    timeout: 30000,
                },
            };

            expect(httpSite.monitor.type).toBe("http");
            expect(pingSite.monitor.type).toBe("ping");
        });

        it("should enforce proper types", () => {
            const siteFormData: SiteFormData = {
                identifier: "test-site",
                name: "Test Site",
                monitor: {
                    type: "port",
                    host: "example.com",
                    port: 80,
                    checkInterval: 300000,
                    retryAttempts: 3,
                    timeout: 30000,
                },
            };

            expect(typeof siteFormData.identifier).toBe("string");
            expect(typeof siteFormData.name).toBe("string");
            expect(typeof siteFormData.monitor.checkInterval).toBe("number");
        });
    });

    describe("HttpFormData", () => {
        it("should define proper structure", () => {
            const validHttpFormData: HttpFormData = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(validHttpFormData.type).toBe("http");
            expect(validHttpFormData.url).toBe("https://example.com");
            expect(validHttpFormData.checkInterval).toBe(300000);
            expect(validHttpFormData.timeout).toBe(30000);
            expect(validHttpFormData.retryAttempts).toBe(3);
        });

        it("should allow optional fields", () => {
            const httpWithOptions: HttpFormData = {
                type: "http",
                url: "https://api.example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
                method: "POST",
                expectedStatusCode: 201,
                followRedirects: false,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer token123",
                },
                auth: {
                    username: "user",
                    password: "pass",
                },
                expectedContent: "success",
            };

            expect(httpWithOptions.method).toBe("POST");
            expect(httpWithOptions.expectedStatusCode).toBe(201);
            expect(httpWithOptions.followRedirects).toBe(false);
            expect(httpWithOptions.headers).toBeDefined();
            expect(httpWithOptions.auth).toBeDefined();
            expect(httpWithOptions.expectedContent).toBe("success");
        });
    });

    describe("PingFormData", () => {
        it("should define proper structure", () => {
            const validPingFormData: PingFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(validPingFormData.type).toBe("ping");
            expect(validPingFormData.host).toBe("example.com");
            expect(validPingFormData.checkInterval).toBe(300000);
            expect(validPingFormData.timeout).toBe(30000);
            expect(validPingFormData.retryAttempts).toBe(3);
        });

        it("should allow optional ping-specific fields", () => {
            const pingWithOptions: PingFormData = {
                type: "ping",
                host: "192.168.1.1",
                checkInterval: 60000,
                timeout: 10000,
                retryAttempts: 2,
                packetCount: 5,
                packetSize: 64,
                maxPacketLoss: 10,
            };

            expect(pingWithOptions.packetCount).toBe(5);
            expect(pingWithOptions.packetSize).toBe(64);
            expect(pingWithOptions.maxPacketLoss).toBe(10);
        });

        it("should enforce number types for ping parameters", () => {
            const pingFormData: PingFormData = {
                type: "ping",
                host: "test.com",
                checkInterval: 120000,
                timeout: 15000,
                retryAttempts: 1,
                packetCount: 4,
                packetSize: 32,
                maxPacketLoss: 5,
            };

            expect(typeof pingFormData.packetCount).toBe("number");
            expect(typeof pingFormData.packetSize).toBe("number");
            expect(typeof pingFormData.maxPacketLoss).toBe("number");
        });
    });

    describe("PortFormData", () => {
        it("should define proper structure", () => {
            const validPortFormData: PortFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(validPortFormData.type).toBe("port");
            expect(validPortFormData.host).toBe("example.com");
            expect(validPortFormData.port).toBe(80);
            expect(validPortFormData.checkInterval).toBe(300000);
            expect(validPortFormData.timeout).toBe(30000);
            expect(validPortFormData.retryAttempts).toBe(3);
        });

        it("should allow connection timeout", () => {
            const portWithTimeout: PortFormData = {
                type: "port",
                host: "192.168.1.1",
                port: 443,
                checkInterval: 60000,
                timeout: 10000,
                retryAttempts: 2,
                connectionTimeout: 5000,
            };

            expect(portWithTimeout.connectionTimeout).toBe(5000);
            expect(typeof portWithTimeout.connectionTimeout).toBe("number");
        });

        it("should enforce port number constraints", () => {
            const commonPorts = [
                80,
                443,
                22,
                3389,
                3306,
                5432,
            ];

            commonPorts.forEach((port) => {
                const portData: PortFormData = {
                    type: "port",
                    host: "example.com",
                    port,
                    checkInterval: 300000,
                    timeout: 30000,
                    retryAttempts: 3,
                };

                expect(portData.port).toBe(port);
                expect(typeof portData.port).toBe("number");
                expect(portData.port).toBeGreaterThan(0);
                expect(portData.port).toBeLessThanOrEqual(65535);
            });
        });
    });

    describe("BaseFormData", () => {
        it("should be extended by all monitor types", () => {
            const httpData: HttpFormData = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const pingData: PingFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const portData: PortFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            // All types should have base properties
            [httpData, pingData, portData].forEach((data) => {
                expect(data).toHaveProperty("checkInterval");
                expect(data).toHaveProperty("timeout");
                expect(data).toHaveProperty("retryAttempts");
                expect(data).toHaveProperty("type");
            });
        });
    });

    describe("MonitorFormData Union Type", () => {
        it("should accept all monitor types", () => {
            const httpMonitor: MonitorFormData = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const pingMonitor: MonitorFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const portMonitor: MonitorFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(httpMonitor.type).toBe("http");
            expect(pingMonitor.type).toBe("ping");
            expect(portMonitor.type).toBe("port");
        });
    });

    describe("Type Guards", () => {
        it("should identify HTTP form data", () => {
            const httpData: MonitorFormData = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const pingData: MonitorFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(isHttpFormData(httpData)).toBe(true);
            expect(isHttpFormData(pingData)).toBe(false);

            if (isHttpFormData(httpData)) {
                expect(httpData.url).toBeDefined();
            }
        });

        it("should identify ping form data", () => {
            const pingData: MonitorFormData = {
                type: "ping",
                host: "example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const portData: MonitorFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(isPingFormData(pingData)).toBe(true);
            expect(isPingFormData(portData)).toBe(false);

            if (isPingFormData(pingData)) {
                expect(pingData.host).toBeDefined();
            }
        });

        it("should identify port form data", () => {
            const portData: MonitorFormData = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const httpData: MonitorFormData = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300000,
                timeout: 30000,
                retryAttempts: 3,
            };

            expect(isPortFormData(portData)).toBe(true);
            expect(isPortFormData(httpData)).toBe(false);

            if (isPortFormData(portData)) {
                expect(portData.port).toBeDefined();
            }
        });
    });

    describe("DEFAULT_FORM_DATA", () => {
        it("should provide HTTP defaults", () => {
            const httpDefaults = DEFAULT_FORM_DATA.http;

            expect(httpDefaults.type).toBe("http");
            expect(httpDefaults.checkInterval).toBe(300000);
            expect(httpDefaults.timeout).toBe(30000);
            expect(httpDefaults.retryAttempts).toBe(3);
            expect(httpDefaults.enabled).toBe(true);
            expect(httpDefaults.method).toBe("GET");
            expect(httpDefaults.expectedStatusCode).toBe(200);
            expect(httpDefaults.followRedirects).toBe(true);
        });

        it("should provide ping defaults", () => {
            const pingDefaults = DEFAULT_FORM_DATA.ping;

            expect(pingDefaults.type).toBe("ping");
            expect(pingDefaults.checkInterval).toBe(300000);
            expect(pingDefaults.timeout).toBe(30000);
            expect(pingDefaults.retryAttempts).toBe(3);
            expect(pingDefaults.enabled).toBe(true);
            expect(pingDefaults.packetCount).toBe(4);
            expect(pingDefaults.packetSize).toBe(32);
            expect(pingDefaults.maxPacketLoss).toBe(0);
        });

        it("should provide port defaults", () => {
            const portDefaults = DEFAULT_FORM_DATA.port;

            expect(portDefaults.type).toBe("port");
            expect(portDefaults.checkInterval).toBe(300000);
            expect(portDefaults.timeout).toBe(30000);
            expect(portDefaults.retryAttempts).toBe(3);
            expect(portDefaults.enabled).toBe(true);
            expect(portDefaults.port).toBe(80);
            expect(portDefaults.connectionTimeout).toBe(10000);
        });

        it("should have consistent default intervals across types", () => {
            const { http, ping, port } = DEFAULT_FORM_DATA;

            expect(http.checkInterval).toBe(ping.checkInterval);
            expect(ping.checkInterval).toBe(port.checkInterval);
            expect(http.timeout).toBe(ping.timeout);
            expect(ping.timeout).toBe(port.timeout);
            expect(http.retryAttempts).toBe(ping.retryAttempts);
            expect(ping.retryAttempts).toBe(port.retryAttempts);
        });
    });

    describe("AddSiteFormState", () => {
        it("should define proper structure", () => {
            const formState: AddSiteFormState = {
                addMode: "new",
                formData: {
                    identifier: "new-site",
                    name: "New Site",
                    monitor: {
                        type: "http",
                        url: "https://newsite.com",
                        checkInterval: 300000,
                        timeout: 30000,
                        retryAttempts: 3,
                    },
                },
                selectedExistingSite: "",
            };

            expect(formState.addMode).toBe("new");
            expect(formState.formData).toBeDefined();
            expect(formState.selectedExistingSite).toBe("");
        });

        it("should handle existing site mode", () => {
            const existingFormState: AddSiteFormState = {
                addMode: "existing",
                formData: {
                    identifier: "existing-site",
                    name: "Existing Site",
                    monitor: {
                        type: "ping",
                        host: "existing.com",
                        checkInterval: 300000,
                        timeout: 30000,
                        retryAttempts: 3,
                    },
                },
                selectedExistingSite: "site-123",
                formError: "Some error occurred",
            };

            expect(existingFormState.addMode).toBe("existing");
            expect(existingFormState.selectedExistingSite).toBe("site-123");
            expect(existingFormState.formError).toBe("Some error occurred");
        });
    });

    describe("FormMode", () => {
        it("should define valid modes", () => {
            const newMode: FormMode = "new";
            const existingMode: FormMode = "existing";

            expect(newMode).toBe("new");
            expect(existingMode).toBe("existing");
        });
    });

    describe("MonitorFieldValidation", () => {
        it("should define validation structure", () => {
            const validation: MonitorFieldValidation = {
                fieldName: "checkInterval",
                fieldType: "number",
                required: true,
                min: 60000,
                max: 3600000,
                validator: (value) => {
                    if (typeof value !== "number") return "Must be a number";
                    if (value < 60000) return "Minimum interval is 60 seconds";
                    if (value > 3600000) return "Maximum interval is 1 hour";
                    return null;
                },
            };

            expect(validation.fieldName).toBe("checkInterval");
            expect(validation.fieldType).toBe("number");
            expect(validation.required).toBe(true);
            expect(validation.min).toBe(60000);
            expect(validation.max).toBe(3600000);
            expect(typeof validation.validator).toBe("function");
        });

        it("should handle different field types", () => {
            const urlValidation: MonitorFieldValidation = {
                fieldName: "url",
                fieldType: "url",
                required: true,
                pattern: /^https?:\/\/.+/,
            };

            const hostValidation: MonitorFieldValidation = {
                fieldName: "host",
                fieldType: "host",
                required: true,
            };

            const portValidation: MonitorFieldValidation = {
                fieldName: "port",
                fieldType: "port",
                required: true,
                min: 1,
                max: 65535,
            };

            expect(urlValidation.fieldType).toBe("url");
            expect(hostValidation.fieldType).toBe("host");
            expect(portValidation.fieldType).toBe("port");
        });
    });

    describe("Type Safety", () => {
        it("should enforce strict typing", () => {
            const siteData: SiteFormData = {
                identifier: "type-test",
                name: "TypeScript Test",
                monitor: {
                    type: "http",
                    url: "https://typescript.test",
                    checkInterval: 300000,
                    timeout: 30000,
                    retryAttempts: 3,
                },
            };

            expect(typeof siteData.identifier).toBe("string");
            expect(typeof siteData.name).toBe("string");
            expect(typeof siteData.monitor.checkInterval).toBe("number");
            expect(siteData.monitor.type).toBe("http");
        });

        it("should provide discriminated union support", () => {
            const monitors: MonitorFormData[] = [
                {
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 300000,
                    timeout: 30000,
                    retryAttempts: 3,
                },
                {
                    type: "ping",
                    host: "example.com",
                    checkInterval: 300000,
                    timeout: 30000,
                    retryAttempts: 3,
                },
                {
                    type: "port",
                    host: "example.com",
                    port: 80,
                    checkInterval: 300000,
                    timeout: 30000,
                    retryAttempts: 3,
                },
            ];

            monitors.forEach((monitor) => {
                switch (monitor.type) {
                    case "http":
                        expect(monitor.url).toBeDefined();
                        break;
                    case "ping":
                        expect(monitor.host).toBeDefined();
                        break;
                    case "port":
                        expect(monitor.port).toBeDefined();
                        break;
                    default:
                        // TypeScript should catch this at compile time
                        const _exhaustive: never = monitor;
                        throw new Error(
                            `Unhandled monitor type: ${_exhaustive}`
                        );
                }
            });
        });
    });
});
