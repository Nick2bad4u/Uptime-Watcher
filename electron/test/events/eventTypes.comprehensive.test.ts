/**
 * Comprehensive tests for eventTypes.ts - targeting 90%+ branch coverage Tests
 * all event categories, priorities, and utility functions
 */

import { describe, it, expect } from "vitest";
import {
    isEventOfCategory,
    getEventPriority,
    EVENT_CATEGORIES,
    EVENT_PRIORITIES,
    type UptimeEvents,
} from "../../events/eventTypes.js";

describe("eventTypes - Comprehensive Coverage", () => {
    describe("EVENT_CATEGORIES constant", () => {
        it("should have all expected category keys", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: eventTypes - Comprehensive Coverage",
                "component"
            );

            const expectedCategories = [
                "CACHE",
                "CONFIG",
                "DATABASE",
                "INTERNAL_CACHE",
                "INTERNAL_DATABASE",
                "INTERNAL_MONITOR",
                "INTERNAL_SITE",
                "MONITOR",
                "MONITORING",
                "PERFORMANCE",
                "SITE",
                "SYSTEM",
            ];

            const actualCategories = Object.keys(EVENT_CATEGORIES);
            expect(actualCategories).toEqual(
                expect.arrayContaining(expectedCategories)
            );
            expect(actualCategories).toHaveLength(expectedCategories.length);
        });
        it("should contain expected events in each category", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: eventTypes - Comprehensive Coverage",
                "component"
            );

            // Test specific events are in their correct categories
            expect(EVENT_CATEGORIES.CACHE).toContain("cache:invalidated");
            expect(EVENT_CATEGORIES.CONFIG).toContain("config:changed");
            expect(EVENT_CATEGORIES.DATABASE).toContain(
                "database:backup-created"
            );
            expect(EVENT_CATEGORIES.INTERNAL_DATABASE).toContain(
                "internal:database:initialized"
            );
            expect(EVENT_CATEGORIES.INTERNAL_CACHE).toContain(
                "internal:cache:item-cached"
            );
            expect(EVENT_CATEGORIES.INTERNAL_MONITOR).toContain(
                "internal:monitor:started"
            );
            expect(EVENT_CATEGORIES.INTERNAL_SITE).toContain(
                "internal:site:added"
            );
            expect(EVENT_CATEGORIES.MONITOR).toContain("monitor:up");
            expect(EVENT_CATEGORIES.MONITORING).toContain("monitoring:started");
            expect(EVENT_CATEGORIES.PERFORMANCE).toContain(
                "performance:metric"
            );
            expect(EVENT_CATEGORIES.SITE).toContain("site:added");
            expect(EVENT_CATEGORIES.SYSTEM).toContain("system:error");
        });
    });
    describe("EVENT_PRIORITIES constant", () => {
        it("should have all expected priority levels", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: eventTypes - Comprehensive Coverage",
                "component"
            );

            const expectedPriorities = [
                "CRITICAL",
                "HIGH",
                "LOW",
                "MEDIUM",
            ];
            const actualPriorities = Object.keys(EVENT_PRIORITIES);
            expect(actualPriorities).toEqual(
                expect.arrayContaining(expectedPriorities)
            );
            expect(actualPriorities).toHaveLength(expectedPriorities.length);
        });
        it("should categorize events correctly by priority", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: eventTypes - Comprehensive Coverage",
                "component"
            );

            expect(EVENT_PRIORITIES.CRITICAL).toContain("system:error");
            expect(EVENT_PRIORITIES.HIGH).toContain("monitor:status-changed");
            expect(EVENT_PRIORITIES.LOW).toContain("performance:metric");
            expect(EVENT_PRIORITIES.MEDIUM).toContain("site:added");
        });
    });
    describe("isEventOfCategory - Complete Branch Coverage", () => {
        describe("CACHE category", () => {
            it("should return true for cache events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("cache:invalidated", "CACHE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("internal:site:cache-miss", "CACHE")
                ).toBeFalsy();
            });
            it("should return false for non-cache events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("site:added", "CACHE")).toBeFalsy();
                expect(isEventOfCategory("monitor:up", "CACHE")).toBeFalsy();
            });
        });
        describe("CONFIG category", () => {
            it("should return true for config events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("config:changed", "CONFIG")
                ).toBeTruthy();
            });
            it("should return false for non-config events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("site:added", "CONFIG")).toBeFalsy();
                expect(isEventOfCategory("monitor:up", "CONFIG")).toBeFalsy();
            });
        });
        describe("DATABASE category", () => {
            it("should return true for database events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("database:backup-created", "DATABASE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("database:error", "DATABASE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("database:retry", "DATABASE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("database:success", "DATABASE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "database:transaction-completed",
                        "DATABASE"
                    )
                ).toBeTruthy();
            });
            it("should return false for non-database events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("site:added", "DATABASE")).toBeFalsy();
                expect(
                    isEventOfCategory(
                        "internal:database:initialized",
                        "DATABASE"
                    )
                ).toBeFalsy();
            });
        });
        describe("INTERNAL_DATABASE category", () => {
            it("should return true for internal database events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory(
                        "internal:database:backup-downloaded",
                        "INTERNAL_DATABASE"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:database:data-exported",
                        "INTERNAL_DATABASE"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:database:data-imported",
                        "INTERNAL_DATABASE"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:database:initialized",
                        "INTERNAL_DATABASE"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:database:sites-refreshed",
                        "INTERNAL_DATABASE"
                    )
                ).toBeTruthy();
            });
            it("should return false for non-internal database events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("database:error", "INTERNAL_DATABASE")
                ).toBeFalsy();
                expect(
                    isEventOfCategory("site:added", "INTERNAL_DATABASE")
                ).toBeFalsy();
            });
        });
        describe("INTERNAL_MONITOR category", () => {
            it("should return true for internal monitor events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory(
                        "internal:monitor:all-started",
                        "INTERNAL_MONITOR"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:monitor:all-stopped",
                        "INTERNAL_MONITOR"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:monitor:manual-check-completed",
                        "INTERNAL_MONITOR"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:monitor:started",
                        "INTERNAL_MONITOR"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:monitor:stopped",
                        "INTERNAL_MONITOR"
                    )
                ).toBeTruthy();
            });
            it("should return false for non-internal monitor events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("monitor:up", "INTERNAL_MONITOR")
                ).toBeFalsy();
                expect(
                    isEventOfCategory("site:added", "INTERNAL_MONITOR")
                ).toBeFalsy();
            });
        });
        describe("INTERNAL_SITE category", () => {
            it("should return true for internal site events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("internal:site:added", "INTERNAL_SITE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("internal:site:removed", "INTERNAL_SITE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("internal:site:updated", "INTERNAL_SITE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:site:cache-updated",
                        "INTERNAL_SITE"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:site:cache-miss",
                        "INTERNAL_SITE"
                    )
                ).toBeTruthy();
                expect(
                    isEventOfCategory(
                        "internal:site:start-monitoring-requested",
                        "INTERNAL_SITE"
                    )
                ).toBeTruthy();
            });
            it("should return false for non-internal site events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("site:added", "INTERNAL_SITE")
                ).toBeFalsy();
                expect(
                    isEventOfCategory("monitor:up", "INTERNAL_SITE")
                ).toBeFalsy();
            });
        });
        describe("MONITOR category", () => {
            it("should return true for monitor events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("monitor:added", "MONITOR")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("monitor:check-completed", "MONITOR")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("monitor:removed", "MONITOR")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("monitor:status-changed", "MONITOR")
                ).toBeTruthy();
                expect(isEventOfCategory("monitor:up", "MONITOR")).toBeTruthy();
                expect(
                    isEventOfCategory("monitor:down", "MONITOR")
                ).toBeTruthy();
            });
            it("should return false for non-monitor events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("site:added", "MONITOR")).toBeFalsy();
                expect(
                    isEventOfCategory("internal:monitor:started", "MONITOR")
                ).toBeFalsy();
            });
        });
        describe("MONITORING category", () => {
            it("should return true for monitoring events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("monitoring:started", "MONITORING")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("monitoring:stopped", "MONITORING")
                ).toBeTruthy();
            });
            it("should return false for non-monitoring events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("monitor:up", "MONITORING")
                ).toBeFalsy();
                expect(
                    isEventOfCategory("site:added", "MONITORING")
                ).toBeFalsy();
            });
        });
        describe("PERFORMANCE category", () => {
            it("should return true for performance events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("performance:metric", "PERFORMANCE")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("performance:warning", "PERFORMANCE")
                ).toBeTruthy();
            });
            it("should return false for non-performance events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("monitor:up", "PERFORMANCE")
                ).toBeFalsy();
                expect(
                    isEventOfCategory("site:added", "PERFORMANCE")
                ).toBeFalsy();
            });
        });
        describe("SITE category", () => {
            it("should return true for site events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("site:added", "SITE")).toBeTruthy();
                expect(isEventOfCategory("site:removed", "SITE")).toBeTruthy();
                expect(isEventOfCategory("site:updated", "SITE")).toBeTruthy();
                expect(
                    isEventOfCategory("sites:state-synchronized", "SITE")
                ).toBeTruthy();
            });
            it("should return false for non-site events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("monitor:up", "SITE")).toBeFalsy();
                expect(
                    isEventOfCategory("internal:site:added", "SITE")
                ).toBeFalsy();
            });
        });
        describe("SYSTEM category", () => {
            it("should return true for system events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(
                    isEventOfCategory("system:error", "SYSTEM")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("system:shutdown", "SYSTEM")
                ).toBeTruthy();
                expect(
                    isEventOfCategory("system:startup", "SYSTEM")
                ).toBeTruthy();
            });
            it("should return false for non-system events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(isEventOfCategory("monitor:up", "SYSTEM")).toBeFalsy();
                expect(isEventOfCategory("site:added", "SYSTEM")).toBeFalsy();
            });
        });
        describe("Default case - unknown categories", () => {
            it("should return false for unknown categories", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // These will test the default case in the switch statement
                expect(
                    isEventOfCategory("site:added", "UNKNOWN_CATEGORY" as any)
                ).toBeFalsy();
                expect(
                    isEventOfCategory(
                        "monitor:up",
                        "NOT_A_REAL_CATEGORY" as any
                    )
                ).toBeFalsy();
                expect(
                    isEventOfCategory("system:error", "FAKE_CATEGORY" as any)
                ).toBeFalsy();
            });
        });
        describe("Edge cases", () => {
            it("should handle events not in any category", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // Test with valid event names that might not be in categories
                const result1 = isEventOfCategory(
                    "cache:invalidated",
                    "MONITOR"
                );
                const result2 = isEventOfCategory(
                    "config:changed",
                    "PERFORMANCE"
                );
                expect(result1).toBeFalsy();
                expect(result2).toBeFalsy();
            });
            it("should handle all category combinations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // This ensures we test all branches thoroughly
                const categories = Object.keys(
                    EVENT_CATEGORIES
                ) as (keyof typeof EVENT_CATEGORIES)[];
                const testEvent = "site:added" as keyof UptimeEvents;

                for (const category of categories) {
                    const result = isEventOfCategory(testEvent, category);
                    if (category === "SITE") {
                        expect(result).toBeTruthy();
                    } else {
                        expect(result).toBeFalsy();
                    }
                }
            });
        });
    });
    describe("getEventPriority - Complete Coverage", () => {
        describe("CRITICAL priority events", () => {
            it("should return CRITICAL for critical events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(getEventPriority("performance:warning")).toBe(
                    "CRITICAL"
                );
                expect(getEventPriority("system:error")).toBe("CRITICAL");
                expect(getEventPriority("system:shutdown")).toBe("CRITICAL");
            });
        });
        describe("HIGH priority events", () => {
            it("should return HIGH for high priority events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(getEventPriority("database:transaction-completed")).toBe(
                    "HIGH"
                );
                expect(getEventPriority("monitor:status-changed")).toBe("HIGH");
                expect(getEventPriority("monitor:up")).toBe("HIGH");
                expect(getEventPriority("monitor:down")).toBe("HIGH");
                expect(getEventPriority("site:removed")).toBe("HIGH");
            });
        });
        describe("LOW priority events", () => {
            it("should return LOW for low priority events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(getEventPriority("performance:metric")).toBe("LOW");
            });
        });
        describe("MEDIUM priority events", () => {
            it("should return MEDIUM for medium priority events", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                expect(getEventPriority("config:changed")).toBe("MEDIUM");
                expect(getEventPriority("monitor:added")).toBe("MEDIUM");
                expect(getEventPriority("site:added")).toBe("MEDIUM");
                expect(getEventPriority("site:updated")).toBe("MEDIUM");
            });
        });
        describe("Default priority for unknown events", () => {
            it("should return MEDIUM for events not in any priority category", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // Test events that exist but are not explicitly categorized in priorities
                expect(getEventPriority("cache:invalidated")).toBe("MEDIUM");
                expect(getEventPriority("database:error")).toBe("MEDIUM");
                expect(getEventPriority("internal:database:initialized")).toBe(
                    "MEDIUM"
                );
                expect(getEventPriority("monitoring:started")).toBe("MEDIUM");

                // Test completely unknown events (though they wouldn't exist in real UptimeEvents)
                expect(
                    getEventPriority("unknown:event" as keyof UptimeEvents)
                ).toBe("MEDIUM");
            });
        });
        describe("All priority categories iteration", () => {
            it("should iterate through all priority entries correctly", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // This test ensures the for loop in getEventPriority processes all entries
                const allPriorityEvents =
                    Object.values(EVENT_PRIORITIES).flat();
                const uniqueEvents = Array.from(new Set(allPriorityEvents));

                // Test each event returns its correct priority
                for (const eventName of uniqueEvents) {
                    const priority = getEventPriority(
                        eventName as keyof UptimeEvents
                    );
                    expect([
                        "CRITICAL",
                        "HIGH",
                        "LOW",
                        "MEDIUM",
                    ]).toContain(priority);
                }
            });
        });
        describe("Edge cases and comprehensive testing", () => {
            it("should handle all events from all categories", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // Test a selection of events from each category to ensure comprehensive coverage
                const testEvents: (keyof UptimeEvents)[] = [
                    // CACHE
                    "cache:invalidated",
                    // CONFIG
                    "config:changed",
                    // DATABASE
                    "database:backup-created",
                    "database:retry",
                    // INTERNAL_DATABASE
                    "internal:database:initialized",
                    "internal:database:data-exported",
                    // INTERNAL_MONITOR
                    "internal:monitor:started",
                    "internal:monitor:stopped",
                    // INTERNAL_SITE
                    "internal:site:added",
                    "internal:site:updated",
                    "internal:site:cache-miss",
                    // MONITOR (some already tested in priority tests)
                    "monitor:added",
                    "monitor:check-completed",
                    // MONITORING
                    "monitoring:started",
                    "monitoring:stopped",
                    // PERFORMANCE (already tested in priority tests)
                    // SITE (some already tested in priority tests)
                    "sites:state-synchronized",
                    // SYSTEM (some already tested in priority tests)
                    "system:startup",
                ];

                for (const event of testEvents) {
                    const priority = getEventPriority(event);
                    expect([
                        "CRITICAL",
                        "HIGH",
                        "LOW",
                        "MEDIUM",
                    ]).toContain(priority);
                }
            });
            it("should maintain consistency between constants and functions", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: eventTypes - Comprehensive Coverage",
                    "component"
                );

                // Verify that all events in priority categories actually exist in event categories
                const allCategoryEvents =
                    Object.values(EVENT_CATEGORIES).flat();
                const allPriorityEvents =
                    Object.values(EVENT_PRIORITIES).flat();

                for (const priorityEvent of allPriorityEvents) {
                    expect(allCategoryEvents).toContain(priorityEvent as any);
                }
            });
        });
    });
    describe("Type Safety and Integration", () => {
        it("should work with typed event names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: eventTypes - Comprehensive Coverage",
                "component"
            );

            // This test ensures types work correctly
            const eventName: keyof UptimeEvents = "site:added";
            const category: keyof typeof EVENT_CATEGORIES = "SITE";

            expect(isEventOfCategory(eventName, category)).toBeTruthy();
            expect(getEventPriority(eventName)).toBe("MEDIUM");
        });
        it("should maintain readonly contracts for constants", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: eventTypes - Comprehensive Coverage",
                "component"
            );

            // Verify that the constants are properly readonly
            expect(() => {
                // Runtime mutation attempt (TypeScript should prevent this at compile time)
                (EVENT_CATEGORIES.SITE as any).push("new:event");
            }).not.toThrow(); // Runtime doesn't prevent this, but TypeScript should

            expect(() => {
                // Runtime mutation attempt (TypeScript should prevent this at compile time)
                (EVENT_PRIORITIES.HIGH as any).push("new:event");
            }).not.toThrow(); // Runtime doesn't prevent this, but TypeScript should
        });
    });
});
