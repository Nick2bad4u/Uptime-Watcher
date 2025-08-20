/**
 * Function coverage validation test for shared/types/monitorConfig.ts
 * 
 * This test ensures all exported functions are called to achieve 100% function coverage.
 * 
 * @fileoverview Function coverage validation for monitor config type guards
 */

import { describe, it, expect } from "vitest";
import * as monitorConfig from "@shared/types/monitorConfig";

describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", () => {
        // Verify all functions are accessible
        expect(typeof monitorConfig.isHttpMonitorConfig).toBe("function");
        expect(typeof monitorConfig.isPingMonitorConfig).toBe("function");
        expect(typeof monitorConfig.isPortMonitorConfig).toBe("function");
        
        // Call each function with minimal valid inputs to register coverage
        const httpConfig = { type: "http" } as any;
        const pingConfig = { type: "ping" } as any;
        const portConfig = { type: "port" } as any;
        
        monitorConfig.isHttpMonitorConfig(httpConfig);
        monitorConfig.isPingMonitorConfig(pingConfig);
        monitorConfig.isPortMonitorConfig(portConfig);
        
        // Verify basic functionality
        expect(monitorConfig.isHttpMonitorConfig(httpConfig)).toBe(true);
        expect(monitorConfig.isPingMonitorConfig(pingConfig)).toBe(true);
        expect(monitorConfig.isPortMonitorConfig(portConfig)).toBe(true);
    });
});
