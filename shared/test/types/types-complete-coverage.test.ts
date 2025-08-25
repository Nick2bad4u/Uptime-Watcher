/**
 * Complete function coverage tests for shared/types.ts
 *
 * @description
 * Tests all exported functions to achieve 100% function coverage
 */

import { describe, it, expect } from "vitest";
import {
  isComputedSiteStatus,
  isMonitorStatus,
  isSiteStatus,
  validateMonitor,
  type Monitor,
  type MonitorStatus,
  type SiteStatus,
} from "../../types";

describe("shared/types.ts - Complete Function Coverage", () => {
  describe("isComputedSiteStatus", () => {
    it("should return true for 'mixed' status", () => {
      expect(isComputedSiteStatus("mixed")).toBe(true);
    });

    it("should return true for 'unknown' status", () => {
      expect(isComputedSiteStatus("unknown")).toBe(true);
    });

    it("should return false for non-computed status", () => {
      expect(isComputedSiteStatus("up")).toBe(false);
      expect(isComputedSiteStatus("down")).toBe(false);
      expect(isComputedSiteStatus("pending")).toBe(false);
      expect(isComputedSiteStatus("paused")).toBe(false);
      expect(isComputedSiteStatus("invalid")).toBe(false);
      expect(isComputedSiteStatus("")).toBe(false);
    });
  });

  describe("isMonitorStatus", () => {
    it("should return true for valid monitor statuses", () => {
      expect(isMonitorStatus("down")).toBe(true);
      expect(isMonitorStatus("paused")).toBe(true);
      expect(isMonitorStatus("pending")).toBe(true);
      expect(isMonitorStatus("up")).toBe(true);
    });

    it("should return false for invalid monitor statuses", () => {
      expect(isMonitorStatus("mixed")).toBe(false);
      expect(isMonitorStatus("unknown")).toBe(false);
      expect(isMonitorStatus("invalid")).toBe(false);
      expect(isMonitorStatus("")).toBe(false);
      expect(isMonitorStatus(" ")).toBe(false);
    });
  });

  describe("isSiteStatus", () => {
    it("should return true for all valid site statuses", () => {
      expect(isSiteStatus("down")).toBe(true);
      expect(isSiteStatus("mixed")).toBe(true);
      expect(isSiteStatus("paused")).toBe(true);
      expect(isSiteStatus("pending")).toBe(true);
      expect(isSiteStatus("unknown")).toBe(true);
      expect(isSiteStatus("up")).toBe(true);
    });

    it("should return false for invalid site statuses", () => {
      expect(isSiteStatus("invalid")).toBe(false);
      expect(isSiteStatus("")).toBe(false);
      expect(isSiteStatus(" ")).toBe(false);
      expect(isSiteStatus("error")).toBe(false);
    });
  });

  describe("validateMonitor", () => {
    const validMonitor: Monitor = {
      id: "test-monitor-1",
      type: "http",
      status: "up",
      monitoring: true,
      responseTime: 150,
      checkInterval: 300000,
      timeout: 10000,
      retryAttempts: 3,
      history: [],
      url: "https://example.com",
    };

    it("should return true for valid monitor", () => {
      expect(validateMonitor(validMonitor)).toBe(true);
    });

    it("should return true for valid monitor with optional fields", () => {
      const monitorWithOptionals = {
        ...validMonitor,
        host: "example.com",
        port: 443,
        lastChecked: new Date(),
        activeOperations: ["check-1", "check-2"],
        expectedValue: "192.168.1.1",
        recordType: "A",
      };
      expect(validateMonitor(monitorWithOptionals)).toBe(true);
    });

    it("should return false for null/undefined monitor", () => {
      expect(validateMonitor(null as any)).toBe(false);
      expect(validateMonitor(undefined as any)).toBe(false);
    });

    it("should return false for non-object monitor", () => {
      expect(validateMonitor("string" as any)).toBe(false);
      expect(validateMonitor(123 as any)).toBe(false);
      expect(validateMonitor([] as any)).toBe(false);
    });

    it("should return false for monitor missing required fields", () => {
      expect(validateMonitor({})).toBe(false);
      expect(validateMonitor({ id: "test" })).toBe(false);
      expect(validateMonitor({ id: "test", type: "http" })).toBe(false);
    });

    it("should return false for monitor with invalid id", () => {
      expect(validateMonitor({ ...validMonitor, id: 123 as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, id: null as any })).toBe(false);
    });

    it("should return false for monitor with invalid type", () => {
      expect(validateMonitor({ ...validMonitor, type: "invalid" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, type: 123 as any })).toBe(false);
    });

    it("should return false for monitor with invalid status", () => {
      expect(validateMonitor({ ...validMonitor, status: "invalid" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, status: 123 as any })).toBe(false);
    });

    it("should return false for monitor with invalid monitoring", () => {
      expect(validateMonitor({ ...validMonitor, monitoring: "true" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, monitoring: 1 as any })).toBe(false);
    });

    it("should return false for monitor with invalid numeric fields", () => {
      expect(validateMonitor({ ...validMonitor, responseTime: "150" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, checkInterval: "300000" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, timeout: "10000" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, retryAttempts: "3" as any })).toBe(false);
    });

    it("should return false for monitor with invalid history", () => {
      expect(validateMonitor({ ...validMonitor, history: "not-array" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, history: null as any })).toBe(false);
    });

    it("should return false for monitor with invalid activeOperations", () => {
      expect(validateMonitor({ ...validMonitor, activeOperations: "not-array" as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, activeOperations: [123] as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, activeOperations: [""] as any })).toBe(false);
      expect(validateMonitor({ ...validMonitor, activeOperations: ["  "] as any })).toBe(false);
    });

    it("should return true for monitor with valid activeOperations", () => {
      expect(validateMonitor({ ...validMonitor, activeOperations: [] })).toBe(true);
      expect(validateMonitor({ ...validMonitor, activeOperations: ["operation-1"] })).toBe(true);
      expect(validateMonitor({ ...validMonitor, activeOperations: ["op-1", "op-2"] })).toBe(true);
    });

    it("should return true for monitor with undefined activeOperations", () => {
      expect(validateMonitor({ ...validMonitor, activeOperations: undefined })).toBe(true);
    });
  });
});
