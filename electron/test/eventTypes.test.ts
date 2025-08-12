/**
 * Test suite for event type utilities and classification functions.
 * 
 * @fileoverview Comprehensive tests for event categorization and priority determination
 * in the Uptime Watcher event system.
 * 
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category Events
 * @module EventTypes
 * @tags ["events", "categorization", "priority", "utilities"]
 */

import { describe, it, expect } from "vitest";
import { isEventOfCategory, getEventPriority } from "../events/eventTypes";

describe("isEventOfCategory", () => {
    it("returns true for event in category", async ({ task, annotate }) => {
        await annotate(`Testing positive event categorization for ${task.name}`, "functional"); await annotate("Event system component: categorization utilities", "component"); await annotate("Test case: Verifying events match their expected categories", "test-case");
        
        
 expect(isEventOfCategory("site:added", "SITE")).toBe(true);
        expect(isEventOfCategory("monitor:added", "MONITOR")).toBe(true);
        expect(isEventOfCategory("system:error", "SYSTEM")).toBe(true);
        });
    it("returns false for event not in category", async ({ task, annotate }) => {
        await annotate(`Testing negative event categorization for ${task.name}`, "functional"); await annotate("Event system component: categorization utilities", "component"); await annotate("Test case: Verifying events reject incorrect categories", "test-case");
        
        
 expect(isEventOfCategory("site:added", "MONITOR")).toBe(false);
        expect(isEventOfCategory("monitor:added", "SITE")).toBe(false);
        expect(isEventOfCategory("system:error", "PERFORMANCE")).toBe(false);
        });
    it("handles unknown event/category gracefully", async ({ task, annotate }) => {
        await annotate(`Testing edge cases for event categorization in ${task.name}`, "edge-case"); await annotate("Event system component: error handling", "component"); await annotate("Test case: Verifying graceful handling of invalid inputs", "error-handling");
        
        
 expect(isEventOfCategory("not:an:event", "SITE")).toBe(false);
        // @ts-expect-error - intentionally testing unknown category
        expect(isEventOfCategory("site:added", "NOT_A_CATEGORY")).toBe(false);
        });        });
describe("getEventPriority", () => {
    it("returns correct priority for known events", async ({ task, annotate }) => {
        await annotate(`Testing event priority mapping for ${task.name}`, "functional"); await annotate("Event system component: priority assignment", "component"); await annotate("Test case: Verifying correct priority levels are assigned", "test-case");
        
        
 expect(getEventPriority("performance:warning")).toBe("CRITICAL");
        expect(getEventPriority("monitor:status-changed")).toBe("HIGH");
        expect(getEventPriority("performance:metric")).toBe("LOW");
        expect(getEventPriority("site:added")).toBe("MEDIUM");
        });
    it("returns MEDIUM for unknown events", async ({ task, annotate }) => {
        await annotate(`Testing default priority behavior for ${task.name}`, "edge-case"); await annotate("Event system component: default behavior", "component"); await annotate("Test case: Verifying default priority assignment for unknown events", "default-behavior");
        
        
 expect(getEventPriority("not:an:event")).toBe("MEDIUM");
        });        });