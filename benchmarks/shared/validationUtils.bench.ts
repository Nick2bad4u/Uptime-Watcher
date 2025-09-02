/**
 * Performance benchmarks for shared validation utilities Tests the performance
 * of validation functions under various load conditions
 */

import { bench, describe } from "vitest";
import {
    isNonEmptyString,
    isValidUrl,
    isValidFQDN,
    isValidIdentifier,
    isValidInteger,
    isValidNumeric,
    isValidIdentifierArray,
    isValidPort,
    safeInteger,
} from "../../shared/validation/validatorUtils";

describe("Shared Validation Utils Performance", () => {
    // Test data sets for comprehensive benchmarking
    const validUrls = [
        "https://example.com",
        "http://localhost:3000",
        "https://api.service.com/v1/health",
        "https://subdomain.example.com:8080/path?query=value",
        "https://monitoring.app.io/status/check",
    ];

    const invalidUrls = [
        "invalid-url",
        "ftp://example.com",
        "not a url at all",
        "https://",
        "://missing-protocol",
    ];

    const validFqdns = [
        "example.com",
        "sub.domain.com",
        "api.service.io",
        "health.monitoring.app",
        "status.check.service.net",
    ];

    const invalidFqdns = [
        "invalid_domain",
        ".starting-dot.com",
        "ending-dot.com.",
        "spaces in domain.com",
        `toolong${"a".repeat(300)}.com`,
    ];

    const validIdentifiers = [
        "valid-identifier",
        "test_monitor_123",
        "site-health-check",
        "api_service_monitor",
        "status-checker-v1",
    ];

    const invalidIdentifiers = [
        "",
        "   ",
        "invalid@identifier",
        "test.with.dots",
        "spaces in identifier",
    ];

    const validPorts = [
        80,
        443,
        3000,
        8080,
        65_535,
    ];
    const invalidPorts = [
        0,
        -1,
        65_536,
        99_999,
        -5000,
    ];

    const mixedStringNumbers = [
        "123",
        "456",
        "789",
        "0",
        "-999",
    ];
    const invalidStringNumbers = [
        "abc",
        "12.34",
        "not-number",
        "",
        "   ",
    ];

    bench("isNonEmptyString - valid strings", () => {
        for (const str of validIdentifiers) {
            isNonEmptyString(str);
        }
    });

    bench("isNonEmptyString - invalid values", () => {
        const invalidValues = [
            "",
            "   ",
            null,
            undefined,
            123,
        ];
        for (const value of invalidValues) {
            isNonEmptyString(value);
        }
    });

    bench("isValidUrl - valid URLs", () => {
        for (const url of validUrls) {
            isValidUrl(url);
        }
    });

    bench("isValidUrl - invalid URLs", () => {
        for (const url of invalidUrls) {
            isValidUrl(url);
        }
    });

    bench("isValidFQDN - valid domains", () => {
        for (const domain of validFqdns) {
            isValidFQDN(domain);
        }
    });

    bench("isValidFQDN - invalid domains", () => {
        for (const domain of invalidFqdns) {
            isValidFQDN(domain);
        }
    });

    bench("isValidIdentifier - valid identifiers", () => {
        for (const identifier of validIdentifiers) {
            isValidIdentifier(identifier);
        }
    });

    bench("isValidIdentifier - invalid identifiers", () => {
        for (const identifier of invalidIdentifiers) {
            isValidIdentifier(identifier);
        }
    });

    bench("isValidPort - valid ports", () => {
        for (const port of validPorts) {
            isValidPort(port);
        }
    });

    bench("isValidPort - invalid ports", () => {
        for (const port of invalidPorts) {
            isValidPort(port);
        }
    });

    bench("isValidInteger - valid string numbers", () => {
        for (const str of mixedStringNumbers) {
            isValidInteger(str);
        }
    });

    bench("isValidInteger - invalid string numbers", () => {
        for (const str of invalidStringNumbers) {
            isValidInteger(str);
        }
    });

    bench("isValidNumeric - mixed validation", () => {
        const mixedValues = [...mixedStringNumbers, ...validPorts];
        for (const value of mixedValues) {
            isValidNumeric(value);
        }
    });

    bench("safeInteger - valid conversions", () => {
        for (const str of mixedStringNumbers) {
            safeInteger(str, 0, 0, 10_000);
        }
    });

    bench("safeInteger - invalid conversions with fallback", () => {
        for (const str of invalidStringNumbers) {
            safeInteger(str, 1000, 0, 10_000);
        }
    });

    bench("isValidIdentifierArray - valid arrays", () => {
        const validArrays = [
            validIdentifiers,
            validIdentifiers.slice(0, 3),
            ["single-item"],
            [],
        ];
        for (const arr of validArrays) {
            isValidIdentifierArray(arr);
        }
    });

    bench("isValidIdentifierArray - invalid arrays", () => {
        const invalidArrays = [
            invalidIdentifiers,
            [
                "valid",
                "",
                "invalid",
            ],
            [
                "mixed",
                null,
                "values",
            ],
            "not-an-array",
        ];
        for (const arr of invalidArrays) {
            isValidIdentifierArray(arr);
        }
    });

    // Complex validation scenarios
    bench("complex validation workflow", () => {
        const testConfigs = [
            {
                name: "test-monitor-1",
                url: "https://api.example.com",
                timeout: "5000",
                retries: "3",
                tags: ["production", "api-health"],
            },
            {
                name: "test-monitor-2",
                url: "http://localhost:3000",
                timeout: "10000",
                retries: "1",
                tags: ["development", "local"],
            },
        ];

        for (const config of testConfigs) {
            isValidIdentifier(config.name);
            isValidUrl(config.url);
            isValidInteger(config.timeout);
            isValidInteger(config.retries);
            isValidIdentifierArray(config.tags);

            const timeout = safeInteger(config.timeout, 1000, 1000, 30_000);
            const retries = safeInteger(config.retries, 1, 1, 10);
        }
    });

    // High-volume validation testing
    bench("high-volume url validation", () => {
        const largeUrlSet = Array.from(
            { length: 100 },
            (_, i) => `https://monitor-${i}.example.com/health/check`
        );

        for (const url of largeUrlSet) {
            isValidUrl(url);
        }
    });

    bench("high-volume identifier validation", () => {
        const largeIdentifierSet = Array.from(
            { length: 100 },
            (_, i) => `monitor-${i}-health-check`
        );

        for (const identifier of largeIdentifierSet) {
            isValidIdentifier(identifier);
        }
    });

    // Edge case performance testing
    bench("edge case validation - very long strings", () => {
        const longStrings = [
            "a".repeat(1000),
            `valid-${"identifier-".repeat(50)}`,
            `https://${"subdomain.".repeat(20)}example.com`,
        ];

        for (const str of longStrings) {
            isNonEmptyString(str);
            isValidIdentifier(str);
            isValidUrl(str);
        }
    });

    bench("edge case validation - boundary values", () => {
        const boundaryValues = [
            1,
            65_535,
            0,
            -1,
            65_536,
            "1",
            "65535",
            "0",
            "-1",
            "65536",
        ];

        for (const value of boundaryValues) {
            isValidPort(value);
            isValidInteger(value);
            isValidNumeric(value);
        }
    });
});
