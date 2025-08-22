/**
 * Comprehensive test suite for Monitor Configuration types.
 *
 * @file This test suite provides 100% test coverage for the monitor
 *   configuration type definitions including all interfaces, type guards,
 *   default configurations, and validation logic.
 */

import { describe, expect, it } from "vitest";
import type {
    AdvancedMonitorConfig,
    BaseMonitorConfig,
    HttpMonitorConfig,
    PingMonitorConfig,
    PortMonitorConfig,
    MonitorConfig,
    MonitorConfigTemplate,
} from "../../types/monitorConfig";
import {
    isHttpMonitorConfig,
    isPingMonitorConfig,
    isPortMonitorConfig,
    DEFAULT_MONITOR_CONFIG,
} from "../../types/monitorConfig";

describe("Monitor Configuration Types", () => {
    describe("AdvancedMonitorConfig", () => {
        it("should define proper alerting structure", () => {
            const config: AdvancedMonitorConfig = {
                alerting: {
                    alertTypes: [
                        "email",
                        "slack",
                        "webhook",
                    ],
                    failureThreshold: 3,
                    messageTemplate: "Site {name} is down: {error}",
                    recoveryThreshold: 2,
                },
            };

            expect(config.alerting?.alertTypes).toEqual([
                "email",
                "slack",
                "webhook",
            ]);
            expect(config.alerting?.failureThreshold).toBe(3);
            expect(config.alerting?.messageTemplate).toBe(
                "Site {name} is down: {error}"
            );
            expect(config.alerting?.recoveryThreshold).toBe(2);
        });

        it("should define proper data retention structure", () => {
            const config: AdvancedMonitorConfig = {
                dataRetention: {
                    aggregatedDataDays: 365,
                    autoCleanup: true,
                    detailedHistoryDays: 90,
                },
            };

            expect(config.dataRetention?.aggregatedDataDays).toBe(365);
            expect(config.dataRetention?.autoCleanup).toBe(true);
            expect(config.dataRetention?.detailedHistoryDays).toBe(90);
        });

        it("should define proper performance thresholds", () => {
            const config: AdvancedMonitorConfig = {
                performanceThresholds: {
                    responseTimeCritical: 5000,
                    responseTimeWarning: 2000,
                    uptimeCritical: 95,
                    uptimeWarning: 98,
                },
            };

            expect(config.performanceThresholds?.responseTimeCritical).toBe(
                5000
            );
            expect(config.performanceThresholds?.responseTimeWarning).toBe(
                2000
            );
            expect(config.performanceThresholds?.uptimeCritical).toBe(95);
            expect(config.performanceThresholds?.uptimeWarning).toBe(98);
        });

        it("should define proper scheduling configuration", () => {
            const config: AdvancedMonitorConfig = {
                scheduling: {
                    activeDays: [
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                    ],
                    activeHours: {
                        start: "08:00",
                        end: "18:00",
                    },
                    activeTimeZones: ["America/New_York", "Europe/London"],
                    maintenanceWindows: [
                        {
                            start: "2024-01-01T02:00:00Z",
                            end: "2024-01-01T04:00:00Z",
                        },
                    ],
                },
            };

            expect(config.scheduling?.activeDays).toEqual([
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
            ]);
            expect(config.scheduling?.activeHours?.start).toBe("08:00");
            expect(config.scheduling?.activeHours?.end).toBe("18:00");
            expect(config.scheduling?.activeTimeZones).toEqual([
                "America/New_York",
                "Europe/London",
            ]);
            expect(config.scheduling?.maintenanceWindows?.[0]!.start).toBe(
                "2024-01-01T02:00:00Z"
            );
        });
    });

    describe("BaseMonitorConfig", () => {
        it("should define proper base structure", () => {
            const config: BaseMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "monitor-123",
                name: "Test Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
            };

            expect(config.checkInterval).toBe(300_000);
            expect(config.enabled).toBe(true);
            expect(config.id).toBe("monitor-123");
            expect(config.name).toBe("Test Monitor");
            expect(config.retryAttempts).toBe(3);
            expect(config.timeout).toBe(30_000);
            expect(config.type).toBe("http");
        });

        it("should be extended by specific monitor types", () => {
            const httpConfig: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "http-monitor",
                name: "HTTP Test",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
                url: "https://example.com",
                expectedStatusCodes: [200],
                followRedirects: true,
                method: "GET",
            };

            // Should have all BaseMonitorConfig properties
            expect(httpConfig.checkInterval).toBeDefined();
            expect(httpConfig.enabled).toBeDefined();
            expect(httpConfig.id).toBeDefined();
            expect(httpConfig.name).toBeDefined();
            expect(httpConfig.retryAttempts).toBeDefined();
            expect(httpConfig.timeout).toBeDefined();
            expect(httpConfig.type).toBeDefined();
        });
    });

    describe("HttpMonitorConfig", () => {
        it("should define proper HTTP structure", () => {
            const config: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "http-1",
                name: "HTTP Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
                url: "https://example.com",
                expectedStatusCodes: [200, 201],
                followRedirects: true,
                method: "GET",
            };

            expect(config.type).toBe("http");
            expect(config.url).toBe("https://example.com");
            expect(config.expectedStatusCodes).toEqual([200, 201]);
            expect(config.followRedirects).toBe(true);
            expect(config.method).toBe("GET");
        });

        it("should support authentication configuration", () => {
            const config: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "http-auth",
                name: "Authenticated HTTP Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
                url: "https://api.example.com",
                expectedStatusCodes: [200],
                followRedirects: true,
                method: "GET",
                auth: {
                    type: "basic",
                    username: "user",
                    password: "pass",
                },
            };

            expect(config.auth?.type).toBe("basic");
            expect(config.auth?.username).toBe("user");
            expect(config.auth?.password).toBe("pass");
        });

        it("should support certificate configuration", () => {
            const config: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "http-cert",
                name: "Certificate HTTP Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
                url: "https://secure.example.com",
                expectedStatusCodes: [200],
                followRedirects: true,
                method: "GET",
                certificate: {
                    ignoreSslErrors: false,
                    caPath: "/path/to/ca.pem",
                    certPath: "/path/to/cert.pem",
                    keyPath: "/path/to/key.pem",
                },
            };

            expect(config.certificate?.ignoreSslErrors).toBe(false);
            expect(config.certificate?.caPath).toBe("/path/to/ca.pem");
            expect(config.certificate?.certPath).toBe("/path/to/cert.pem");
            expect(config.certificate?.keyPath).toBe("/path/to/key.pem");
        });

        it("should support expected content patterns", () => {
            const config: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "http-content",
                name: "Content HTTP Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
                url: "https://example.com",
                expectedStatusCodes: [200],
                followRedirects: true,
                method: "GET",
                expectedContent: {
                    contains: ["Welcome", "Success"],
                    notContains: ["Error", "Failed"],
                    patterns: ["^.*Welcome.*$", "Status: OK"],
                },
            };

            expect(config.expectedContent?.contains).toEqual([
                "Welcome",
                "Success",
            ]);
            expect(config.expectedContent?.notContains).toEqual([
                "Error",
                "Failed",
            ]);
            expect(config.expectedContent?.patterns).toEqual([
                "^.*Welcome.*$",
                "Status: OK",
            ]);
        });

        it("should support custom headers and request body", () => {
            const config: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "http-custom",
                name: "Custom HTTP Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http",
                url: "https://api.example.com",
                expectedStatusCodes: [201],
                followRedirects: true,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer token123",
                },
                requestBody: {
                    contentType: "application/json",
                    data: '{"test": "data"}',
                },
                userAgent: "UptimeWatcher/1.0",
            };

            expect(config.headers?.["Content-Type"]).toBe("application/json");
            expect(config.headers?.["Authorization"]).toBe("Bearer token123");
            expect(config.requestBody?.contentType).toBe("application/json");
            expect(config.requestBody?.data).toBe('{"test": "data"}');
            expect(config.userAgent).toBe("UptimeWatcher/1.0");
        });
    });

    describe("PingMonitorConfig", () => {
        it("should define proper ping structure", () => {
            const config: PingMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "ping-1",
                name: "Ping Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "ping",
                host: "example.com",
                maxPacketLoss: 5,
                packetCount: 4,
                packetSize: 32,
            };

            expect(config.type).toBe("ping");
            expect(config.host).toBe("example.com");
            expect(config.maxPacketLoss).toBe(5);
            expect(config.packetCount).toBe(4);
            expect(config.packetSize).toBe(32);
        });

        it("should support IP version and RTT configuration", () => {
            const config: PingMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "ping-ipv6",
                name: "IPv6 Ping Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "ping",
                host: "2001:db8::1",
                maxPacketLoss: 0,
                packetCount: 6,
                packetSize: 64,
                ipVersion: "ipv6",
                maxRtt: 100,
            };

            expect(config.ipVersion).toBe("ipv6");
            expect(config.maxRtt).toBe(100);
        });
    });

    describe("PortMonitorConfig", () => {
        it("should define proper port structure", () => {
            const config: PortMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "port-1",
                name: "Port Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "port",
                host: "example.com",
                port: 80,
                connectionTimeout: 10_000,
            };

            expect(config.type).toBe("port");
            expect(config.host).toBe("example.com");
            expect(config.port).toBe(80);
            expect(config.connectionTimeout).toBe(10_000);
        });

        it("should support IP version and protocol configuration", () => {
            const config: PortMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "port-ssl",
                name: "SSL Port Monitor",
                retryAttempts: 3,
                timeout: 30_000,
                type: "port",
                host: "secure.example.com",
                port: 443,
                connectionTimeout: 15_000,
                ipVersion: "ipv4",
                protocol: {
                    useTls: true,
                    sendData:
                        "GET / HTTP/1.1\r\nHost: secure.example.com\r\n\r\n",
                    expectedResponse: "HTTP/1.1 200",
                },
            };

            expect(config.ipVersion).toBe("ipv4");
            expect(config.protocol?.useTls).toBe(true);
            expect(config.protocol?.sendData).toBe(
                "GET / HTTP/1.1\r\nHost: secure.example.com\r\n\r\n"
            );
            expect(config.protocol?.expectedResponse).toBe("HTTP/1.1 200");
        });
    });

    describe("MonitorConfig Union Type", () => {
        it("should accept all monitor types", () => {
            const configs: MonitorConfig[] = [
                {
                    checkInterval: 300_000,
                    enabled: true,
                    id: "http-1",
                    name: "HTTP",
                    retryAttempts: 3,
                    timeout: 30_000,
                    type: "http",
                    url: "https://example.com",
                    expectedStatusCodes: [200],
                    followRedirects: true,
                    method: "GET",
                },
                {
                    checkInterval: 300_000,
                    enabled: true,
                    id: "ping-1",
                    name: "Ping",
                    retryAttempts: 3,
                    timeout: 30_000,
                    type: "ping",
                    host: "example.com",
                    maxPacketLoss: 0,
                    packetCount: 4,
                    packetSize: 32,
                },
                {
                    checkInterval: 300_000,
                    enabled: true,
                    id: "port-1",
                    name: "Port",
                    retryAttempts: 3,
                    timeout: 30_000,
                    type: "port",
                    host: "example.com",
                    port: 80,
                    connectionTimeout: 10_000,
                },
            ];

            expect(configs).toHaveLength(3);
            expect(configs[0]!.type).toBe("http");
            expect(configs[1]!.type).toBe("ping");
            expect(configs[2]!.type).toBe("port");
        });
    });

    describe("MonitorConfigTemplate", () => {
        it("should define proper template structure", () => {
            const template: MonitorConfigTemplate = {
                id: "web-server",
                name: "Web Server Monitor",
                description: "Monitor a web server endpoint",
                category: "Web Services",
                tags: [
                    "http",
                    "web",
                    "server",
                ],
                config: {
                    type: "http",
                    method: "GET",
                    expectedStatusCodes: [200],
                    followRedirects: true,
                    timeout: 30_000,
                },
            };

            expect(template.id).toBe("web-server");
            expect(template.name).toBe("Web Server Monitor");
            expect(template.description).toBe("Monitor a web server endpoint");
            expect(template.category).toBe("Web Services");
            expect(template.tags).toEqual([
                "http",
                "web",
                "server",
            ]);
            expect(template.config.type).toBe("http");
        });

        it("should support different categories and tags", () => {
            const template: MonitorConfigTemplate = {
                id: "database-port",
                name: "Database Port Monitor",
                description: "Monitor database port connectivity",
                category: "Database",
                tags: [
                    "port",
                    "database",
                    "connectivity",
                ],
                config: {
                    type: "port",
                    port: 5432,
                    connectionTimeout: 5000,
                },
            };

            expect(template.category).toBe("Database");
            expect(template.tags).toEqual([
                "port",
                "database",
                "connectivity",
            ]);
        });
    });

    describe("Type Guards", () => {
        const httpConfig: MonitorConfig = {
            checkInterval: 300_000,
            enabled: true,
            id: "http-1",
            name: "HTTP",
            retryAttempts: 3,
            timeout: 30_000,
            type: "http",
            url: "https://example.com",
            expectedStatusCodes: [200],
            followRedirects: true,
            method: "GET",
        };

        const pingConfig: MonitorConfig = {
            checkInterval: 300_000,
            enabled: true,
            id: "ping-1",
            name: "Ping",
            retryAttempts: 3,
            timeout: 30_000,
            type: "ping",
            host: "example.com",
            maxPacketLoss: 0,
            packetCount: 4,
            packetSize: 32,
        };

        const portConfig: MonitorConfig = {
            checkInterval: 300_000,
            enabled: true,
            id: "port-1",
            name: "Port",
            retryAttempts: 3,
            timeout: 30_000,
            type: "port",
            host: "example.com",
            port: 80,
            connectionTimeout: 10_000,
        };

        it("should correctly identify HTTP configurations", () => {
            expect(isHttpMonitorConfig(httpConfig)).toBe(true);
            expect(isHttpMonitorConfig(pingConfig)).toBe(false);
            expect(isHttpMonitorConfig(portConfig)).toBe(false);
        });

        it("should correctly identify ping configurations", () => {
            expect(isPingMonitorConfig(pingConfig)).toBe(true);
            expect(isPingMonitorConfig(httpConfig)).toBe(false);
            expect(isPingMonitorConfig(portConfig)).toBe(false);
        });

        it("should correctly identify port configurations", () => {
            expect(isPortMonitorConfig(portConfig)).toBe(true);
            expect(isPortMonitorConfig(httpConfig)).toBe(false);
            expect(isPortMonitorConfig(pingConfig)).toBe(false);
        });

        it("should provide type narrowing", () => {
            if (isHttpMonitorConfig(httpConfig)) {
                // TypeScript should now know this is HttpMonitorConfig
                expect(httpConfig.url).toBeDefined();
                expect(httpConfig.method).toBeDefined();
            }

            if (isPingMonitorConfig(pingConfig)) {
                // TypeScript should now know this is PingMonitorConfig
                expect(pingConfig.host).toBeDefined();
                expect(pingConfig.packetCount).toBeDefined();
            }

            if (isPortMonitorConfig(portConfig)) {
                // TypeScript should now know this is PortMonitorConfig
                expect(portConfig.host).toBeDefined();
                expect(portConfig.port).toBeDefined();
            }
        });
    });

    describe("DEFAULT_MONITOR_CONFIG", () => {
        it("should provide HTTP defaults", () => {
            const defaults = DEFAULT_MONITOR_CONFIG.http;

            expect(defaults.type).toBe("http");
            expect(defaults.checkInterval).toBe(300_000);
            expect(defaults.enabled).toBe(true);
            expect(defaults.expectedStatusCodes).toEqual([200]);
            expect(defaults.followRedirects).toBe(true);
            expect(defaults.method).toBe("GET");
            expect(defaults.retryAttempts).toBe(3);
            expect(defaults.timeout).toBe(30_000);
        });

        it("should provide ping defaults", () => {
            const defaults = DEFAULT_MONITOR_CONFIG.ping;

            expect(defaults.type).toBe("ping");
            expect(defaults.checkInterval).toBe(300_000);
            expect(defaults.enabled).toBe(true);
            expect(defaults.maxPacketLoss).toBe(0);
            expect(defaults.packetCount).toBe(4);
            expect(defaults.packetSize).toBe(32);
            expect(defaults.retryAttempts).toBe(3);
            expect(defaults.timeout).toBe(30_000);
        });

        it("should provide port defaults", () => {
            const defaults = DEFAULT_MONITOR_CONFIG.port;

            expect(defaults.type).toBe("port");
            expect(defaults.checkInterval).toBe(300_000);
            expect(defaults.connectionTimeout).toBe(10_000);
            expect(defaults.enabled).toBe(true);
            expect(defaults.retryAttempts).toBe(3);
            expect(defaults.timeout).toBe(30_000);
        });

        it("should have consistent default intervals across types", () => {
            const httpInterval = DEFAULT_MONITOR_CONFIG.http.checkInterval;
            const pingInterval = DEFAULT_MONITOR_CONFIG.ping.checkInterval;
            const portInterval = DEFAULT_MONITOR_CONFIG.port.checkInterval;

            expect(httpInterval).toBe(pingInterval);
            expect(pingInterval).toBe(portInterval);
            expect(httpInterval).toBe(300_000); // 5 minutes
        });

        it("should have consistent timeout values", () => {
            const httpTimeout = DEFAULT_MONITOR_CONFIG.http.timeout;
            const pingTimeout = DEFAULT_MONITOR_CONFIG.ping.timeout;
            const portTimeout = DEFAULT_MONITOR_CONFIG.port.timeout;

            expect(httpTimeout).toBe(pingTimeout);
            expect(pingTimeout).toBe(portTimeout);
            expect(httpTimeout).toBe(30_000); // 30 seconds
        });

        it("should have consistent retry attempts", () => {
            const httpRetries = DEFAULT_MONITOR_CONFIG.http.retryAttempts;
            const pingRetries = DEFAULT_MONITOR_CONFIG.ping.retryAttempts;
            const portRetries = DEFAULT_MONITOR_CONFIG.port.retryAttempts;

            expect(httpRetries).toBe(pingRetries);
            expect(pingRetries).toBe(portRetries);
            expect(httpRetries).toBe(3);
        });
    });

    describe("Type Safety", () => {
        it("should enforce strict typing", () => {
            // This test ensures TypeScript compilation catches type errors
            const config: HttpMonitorConfig = {
                checkInterval: 300_000,
                enabled: true,
                id: "test",
                name: "Test",
                retryAttempts: 3,
                timeout: 30_000,
                type: "http", // Must be exactly 'http'
                url: "https://example.com",
                expectedStatusCodes: [200],
                followRedirects: true,
                method: "GET", // Must be valid HTTP method
            };

            expect(config.type).toBe("http");
        });

        it("should provide discriminated union support", () => {
            const configs: MonitorConfig[] = [
                {
                    ...DEFAULT_MONITOR_CONFIG.http,
                    id: "http1",
                    name: "HTTP Monitor",
                    url: "https://example.com",
                } as HttpMonitorConfig,
                {
                    ...DEFAULT_MONITOR_CONFIG.ping,
                    id: "ping1",
                    name: "Ping Monitor",
                    host: "example.com",
                } as PingMonitorConfig,
                {
                    ...DEFAULT_MONITOR_CONFIG.port,
                    id: "port1",
                    name: "Port Monitor",
                    host: "example.com",
                    port: 80,
                } as PortMonitorConfig,
            ];

            // Each config should be properly typed based on its type field
            for (const config of configs) {
                switch (config.type) {
                    case "http": {
                        expect(isHttpMonitorConfig(config)).toBe(true);
                        break;
                    }
                    case "ping": {
                        expect(isPingMonitorConfig(config)).toBe(true);
                        break;
                    }
                    case "port": {
                        expect(isPortMonitorConfig(config)).toBe(true);
                        break;
                    }
                    default: {
                        // This should never happen with proper typing
                        fail(
                            `Unexpected monitor type: ${(config as any).type}`
                        );
                    }
                }
            }
        });
    });
});
