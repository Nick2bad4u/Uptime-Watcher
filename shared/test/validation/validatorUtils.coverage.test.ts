/**
 * Additional tests for validatorUtils.ts to achieve complete coverage
 * Targeting specific uncovered lines: 203, 250-253
 */

import { describe, it, expect } from "vitest";
import { isValidHost, isValidPort } from "../../validation/validatorUtils";

describe("ValidatorUtils - Complete Coverage", () => {
    describe("isValidHost - Complete Edge Cases", () => {
        it("should reject non-string values (line 203)", () => {
            // Test non-string types to hit the return false on line 203
            expect(isValidHost(123)).toBe(false);
            expect(isValidHost(null)).toBe(false);
            expect(isValidHost(undefined)).toBe(false);
            expect(isValidHost({})).toBe(false);
            expect(isValidHost([])).toBe(false);
            expect(isValidHost(true)).toBe(false);
            expect(isValidHost(Symbol("test"))).toBe(false);
            expect(isValidHost(() => {})).toBe(false);
        });

        it("should validate valid hosts", () => {
            // Valid IP addresses
            expect(isValidHost("127.0.0.1")).toBe(true);
            expect(isValidHost("192.168.1.1")).toBe(true);
            expect(isValidHost("::1")).toBe(true);
            
            // Valid FQDNs
            expect(isValidHost("example.com")).toBe(true);
            expect(isValidHost("sub.domain.com")).toBe(true);
            
            // Localhost special case
            expect(isValidHost("localhost")).toBe(true);
        });

        it("should reject invalid string hosts", () => {
            // Invalid hostnames that are strings but not valid hosts
            expect(isValidHost("")).toBe(false);
            expect(isValidHost("invalid..host")).toBe(false);
            expect(isValidHost("too-many..dots")).toBe(false);
            expect(isValidHost("_underscore")).toBe(false);
        });
    });

    describe("isValidPort - Complete Edge Cases", () => {
        it("should reject non-number, non-string values (lines 250-253)", () => {
            // Test various non-number, non-string types to hit line 253 (return false)
            expect(isValidPort(null)).toBe(false);
            expect(isValidPort(undefined)).toBe(false);
            expect(isValidPort({})).toBe(false);
            expect(isValidPort([])).toBe(false);
            expect(isValidPort(true)).toBe(false);
            expect(isValidPort(false)).toBe(false);
            expect(isValidPort(Symbol("test"))).toBe(false);
            expect(isValidPort(() => {})).toBe(false);
            expect(isValidPort(/regex/)).toBe(false);
            expect(isValidPort(new Date())).toBe(false);
        });

        it("should validate number ports", () => {
            // Valid number ports (line 249)
            expect(isValidPort(80)).toBe(true);
            expect(isValidPort(443)).toBe(true);
            expect(isValidPort(3000)).toBe(true);
            expect(isValidPort(65_535)).toBe(true);
            
            // Invalid number ports
            expect(isValidPort(0)).toBe(false);
            expect(isValidPort(-1)).toBe(false);
            expect(isValidPort(70_000)).toBe(false);
        });

        it("should validate string ports", () => {
            // Valid string ports (line 251)
            expect(isValidPort("80")).toBe(true);
            expect(isValidPort("443")).toBe(true);
            expect(isValidPort("3000")).toBe(true);
            expect(isValidPort("65535")).toBe(true);
            
            // Invalid string ports
            expect(isValidPort("0")).toBe(false);
            expect(isValidPort("-1")).toBe(false);
            expect(isValidPort("70000")).toBe(false);
            expect(isValidPort("invalid")).toBe(false);
            expect(isValidPort("")).toBe(false);
        });

        it("should handle edge case port values", () => {
            // Test edge cases that might behave differently
            expect(isValidPort(1)).toBe(true);
            expect(isValidPort("1")).toBe(true);
            expect(isValidPort(Number.NaN)).toBe(false);
            expect(isValidPort(Infinity)).toBe(false);
            expect(isValidPort(-Infinity)).toBe(false);
        });
    });

    describe("Type coercion edge cases", () => {
        it("should handle objects that might coerce to strings/numbers", () => {
            // Objects with custom toString/valueOf
            const customStringObj = {
                toString() { return "80"; },
                valueOf() { return 80; }
            };
            
            const customNumberObj = {
                toString() { return "invalid"; },
                valueOf() { return 80; }
            };
            
            // These should still return false because they're objects, not strings/numbers
            expect(isValidPort(customStringObj)).toBe(false);
            expect(isValidPort(customNumberObj)).toBe(false);
            expect(isValidHost(customStringObj)).toBe(false);
            expect(isValidHost(customNumberObj)).toBe(false);
        });

        it("should handle primitive wrapper objects", () => {
            // Primitive wrappers are objects, not primitives
            expect(isValidPort(Number(80))).toBe(true);
            expect(isValidPort(String("80"))).toBe(true);
            expect(isValidHost(String("localhost"))).toBe(true);
        });
    });
});
