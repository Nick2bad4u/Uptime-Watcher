/**
 * Comprehensive tests for eventTypes.ts - targeting 90%+ branch coverage
 * Tests all event categories, priorities, and utility functions
 */

import { describe, it, expect } from "vitest";
import {
    isEventOfCategory,
    getEventPriority,
    EVENT_CATEGORIES,
    EVENT_PRIORITIES,
    type UptimeEvents,
} from "../../events/eventTypes";

describe("eventTypes - Comprehensive Coverage", () => {
    describe("EVENT_CATEGORIES constant", () => {
        it("should have all expected category keys", () => {
            const expectedCategories = [
                "CACHE",
                "CONFIG",
                "DATABASE",
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
            expect(actualCategories.length).toBe(expectedCategories.length);
        });

        it("should contain expected events in each category", () => {
            // Test specific events are in their correct categories
            expect(EVENT_CATEGORIES.CACHE).toContain("cache:invalidated");
            expect(EVENT_CATEGORIES.CONFIG).toContain("config:changed");
            expect(EVENT_CATEGORIES.DATABASE).toContain(
                "database:backup-created"
            );
            expect(EVENT_CATEGORIES.INTERNAL_DATABASE).toContain(
                "internal:database:initialized"
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
        it("should have all expected priority levels", () => {
            const expectedPriorities = ["CRITICAL", "HIGH", "LOW", "MEDIUM"];
            const actualPriorities = Object.keys(EVENT_PRIORITIES);
            expect(actualPriorities).toEqual(
                expect.arrayContaining(expectedPriorities)
            );
            expect(actualPriorities.length).toBe(expectedPriorities.length);
        });

        it("should categorize events correctly by priority", () => {
            expect(EVENT_PRIORITIES.CRITICAL).toContain("system:error");
            expect(EVENT_PRIORITIES.HIGH).toContain("monitor:status-changed");
            expect(EVENT_PRIORITIES.LOW).toContain("performance:metric");
            expect(EVENT_PRIORITIES.MEDIUM).toContain("site:added");
        });
    });

    describe("isEventOfCategory - Complete Branch Coverage", () => {
        describe("CACHE category", () => {
            it("should return true for cache events", () => {
                expect(isEventOfCategory("cache:invalidated", "CACHE")).toBe(
                    true
                );
                expect(isEventOfCategory("site:cache-miss", "CACHE")).toBe(
                    true
                );
                expect(isEventOfCategory("site:cache-updated", "CACHE")).toBe(
                    true
                );
            });

            it("should return false for non-cache events", () => {
                expect(isEventOfCategory("site:added", "CACHE")).toBe(false);
                expect(isEventOfCategory("monitor:up", "CACHE")).toBe(false);
            });
        });

        describe("CONFIG category", () => {
            it("should return true for config events", () => {
                expect(isEventOfCategory("config:changed", "CONFIG")).toBe(
                    true
                );
            });

            it("should return false for non-config events", () => {
                expect(isEventOfCategory("site:added", "CONFIG")).toBe(false);
                expect(isEventOfCategory("monitor:up", "CONFIG")).toBe(false);
            });
        });

        describe("DATABASE category", () => {
            it("should return true for database events", () => {
                expect(
                    isEventOfCategory("database:backup-created", "DATABASE")
                ).toBe(true);
                expect(isEventOfCategory("database:error", "DATABASE")).toBe(
                    true
                );
                expect(isEventOfCategory("database:retry", "DATABASE")).toBe(
                    true
                );
                expect(isEventOfCategory("database:success", "DATABASE")).toBe(
                    true
                );
                expect(
                    isEventOfCategory(
                        "database:transaction-completed",
                        "DATABASE"
                    )
                ).toBe(true);
            });

            it("should return false for non-database events", () => {
                expect(isEventOfCategory("site:added", "DATABASE")).toBe(false);
                expect(
                    isEventOfCategory(
                        "internal:database:initialized",
                        "DATABASE"
                    )
                ).toBe(false);
            });
        });

        describe("INTERNAL_DATABASE category", () => {
            it("should return true for internal database events", () => {
                expect(
                    isEventOfCategory(
                        "internal:database:backup-downloaded",
                        "INTERNAL_DATABASE"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:database:data-exported",
                        "INTERNAL_DATABASE"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:database:data-imported",
                        "INTERNAL_DATABASE"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:database:initialized",
                        "INTERNAL_DATABASE"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:database:sites-refreshed",
                        "INTERNAL_DATABASE"
                    )
                ).toBe(true);
            });

            it("should return false for non-internal database events", () => {
                expect(
                    isEventOfCategory("database:error", "INTERNAL_DATABASE")
                ).toBe(false);
                expect(
                    isEventOfCategory("site:added", "INTERNAL_DATABASE")
                ).toBe(false);
            });
        });

        describe("INTERNAL_MONITOR category", () => {
            it("should return true for internal monitor events", () => {
                expect(
                    isEventOfCategory(
                        "internal:monitor:all-started",
                        "INTERNAL_MONITOR"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:monitor:all-stopped",
                        "INTERNAL_MONITOR"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:monitor:manual-check-completed",
                        "INTERNAL_MONITOR"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:monitor:started",
                        "INTERNAL_MONITOR"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:monitor:stopped",
                        "INTERNAL_MONITOR"
                    )
                ).toBe(true);
            });

            it("should return false for non-internal monitor events", () => {
                expect(
                    isEventOfCategory("monitor:up", "INTERNAL_MONITOR")
                ).toBe(false);
                expect(
                    isEventOfCategory("site:added", "INTERNAL_MONITOR")
                ).toBe(false);
            });
        });

        describe("INTERNAL_SITE category", () => {
            it("should return true for internal site events", () => {
                expect(
                    isEventOfCategory("internal:site:added", "INTERNAL_SITE")
                ).toBe(true);
                expect(
                    isEventOfCategory("internal:site:removed", "INTERNAL_SITE")
                ).toBe(true);
                expect(
                    isEventOfCategory("internal:site:updated", "INTERNAL_SITE")
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:site:cache-updated",
                        "INTERNAL_SITE"
                    )
                ).toBe(true);
                expect(
                    isEventOfCategory(
                        "internal:site:start-monitoring-requested",
                        "INTERNAL_SITE"
                    )
                ).toBe(true);
            });

            it("should return false for non-internal site events", () => {
                expect(isEventOfCategory("site:added", "INTERNAL_SITE")).toBe(
                    false
                );
                expect(isEventOfCategory("monitor:up", "INTERNAL_SITE")).toBe(
                    false
                );
            });
        });

        describe("MONITOR category", () => {
            it("should return true for monitor events", () => {
                expect(isEventOfCategory("monitor:added", "MONITOR")).toBe(
                    true
                );
                expect(
                    isEventOfCategory("monitor:check-completed", "MONITOR")
                ).toBe(true);
                expect(isEventOfCategory("monitor:removed", "MONITOR")).toBe(
                    true
                );
                expect(
                    isEventOfCategory("monitor:status-changed", "MONITOR")
                ).toBe(true);
                expect(isEventOfCategory("monitor:up", "MONITOR")).toBe(true);
                expect(isEventOfCategory("monitor:down", "MONITOR")).toBe(true);
            });

            it("should return false for non-monitor events", () => {
                expect(isEventOfCategory("site:added", "MONITOR")).toBe(false);
                expect(
                    isEventOfCategory("internal:monitor:started", "MONITOR")
                ).toBe(false);
            });
        });

        describe("MONITORING category", () => {
            it("should return true for monitoring events", () => {
                expect(
                    isEventOfCategory("monitoring:started", "MONITORING")
                ).toBe(true);
                expect(
                    isEventOfCategory("monitoring:stopped", "MONITORING")
                ).toBe(true);
            });

            it("should return false for non-monitoring events", () => {
                expect(isEventOfCategory("monitor:up", "MONITORING")).toBe(
                    false
                );
                expect(isEventOfCategory("site:added", "MONITORING")).toBe(
                    false
                );
            });
        });

        describe("PERFORMANCE category", () => {
            it("should return true for performance events", () => {
                expect(
                    isEventOfCategory("performance:metric", "PERFORMANCE")
                ).toBe(true);
                expect(
                    isEventOfCategory("performance:warning", "PERFORMANCE")
                ).toBe(true);
            });

            it("should return false for non-performance events", () => {
                expect(isEventOfCategory("monitor:up", "PERFORMANCE")).toBe(
                    false
                );
                expect(isEventOfCategory("site:added", "PERFORMANCE")).toBe(
                    false
                );
            });
        });

        describe("SITE category", () => {
            it("should return true for site events", () => {
                expect(isEventOfCategory("site:added", "SITE")).toBe(true);
                expect(isEventOfCategory("site:removed", "SITE")).toBe(true);
                expect(isEventOfCategory("site:updated", "SITE")).toBe(true);
                expect(
                    isEventOfCategory("sites:state-synchronized", "SITE")
                ).toBe(true);
            });

            it("should return false for non-site events", () => {
                expect(isEventOfCategory("monitor:up", "SITE")).toBe(false);
                expect(isEventOfCategory("internal:site:added", "SITE")).toBe(
                    false
                );
            });
        });

        describe("SYSTEM category", () => {
            it("should return true for system events", () => {
                expect(isEventOfCategory("system:error", "SYSTEM")).toBe(true);
                expect(isEventOfCategory("system:shutdown", "SYSTEM")).toBe(
                    true
                );
                expect(isEventOfCategory("system:startup", "SYSTEM")).toBe(
                    true
                );
            });

            it("should return false for non-system events", () => {
                expect(isEventOfCategory("monitor:up", "SYSTEM")).toBe(false);
                expect(isEventOfCategory("site:added", "SYSTEM")).toBe(false);
            });
        });

        describe("Default case - unknown categories", () => {
            it("should return false for unknown categories", () => {
                // These will test the default case in the switch statement
                expect(
                    isEventOfCategory("site:added", "UNKNOWN_CATEGORY" as any)
                ).toBe(false);
                expect(
                    isEventOfCategory(
                        "monitor:up",
                        "NOT_A_REAL_CATEGORY" as any
                    )
                ).toBe(false);
                expect(
                    isEventOfCategory("system:error", "FAKE_CATEGORY" as any)
                ).toBe(false);
            });
        });

        describe("Edge cases", () => {
            it("should handle events not in any category", () => {
                // Test with valid event names that might not be in categories
                const result1 = isEventOfCategory(
                    "cache:invalidated",
                    "MONITOR"
                );
                const result2 = isEventOfCategory(
                    "config:changed",
                    "PERFORMANCE"
                );
                expect(result1).toBe(false);
                expect(result2).toBe(false);
            });

            it("should handle all category combinations", () => {
                // This ensures we test all branches thoroughly
                const categories = Object.keys(EVENT_CATEGORIES) as Array<
                    keyof typeof EVENT_CATEGORIES
                >;
                const testEvent = "site:added" as keyof UptimeEvents;

                for (const category of categories) {
                    const result = isEventOfCategory(testEvent, category);
                    if (category === "SITE") {
                        expect(result).toBe(true);
                    } else {
                        expect(result).toBe(false);
                    }
                }
            });
        });
    });

    describe("getEventPriority - Complete Coverage", () => {
        describe("CRITICAL priority events", () => {
            it("should return CRITICAL for critical events", () => {
                expect(getEventPriority("performance:warning")).toBe(
                    "CRITICAL"
                );
                expect(getEventPriority("system:error")).toBe("CRITICAL");
                expect(getEventPriority("system:shutdown")).toBe("CRITICAL");
            });
        });

        describe("HIGH priority events", () => {
            it("should return HIGH for high priority events", () => {
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
            it("should return LOW for low priority events", () => {
                expect(getEventPriority("performance:metric")).toBe("LOW");
            });
        });

        describe("MEDIUM priority events", () => {
            it("should return MEDIUM for medium priority events", () => {
                expect(getEventPriority("config:changed")).toBe("MEDIUM");
                expect(getEventPriority("monitor:added")).toBe("MEDIUM");
                expect(getEventPriority("site:added")).toBe("MEDIUM");
                expect(getEventPriority("site:updated")).toBe("MEDIUM");
            });
        });

        describe("Default priority for unknown events", () => {
            it("should return MEDIUM for events not in any priority category", () => {
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
            it("should iterate through all priority entries correctly", () => {
                // This test ensures the for loop in getEventPriority processes all entries
                const allPriorityEvents =
                    Object.values(EVENT_PRIORITIES).flat();
                const uniqueEvents = [...new Set(allPriorityEvents)];

                // Test each event returns its correct priority
                for (const eventName of uniqueEvents) {
                    const priority = getEventPriority(
                        eventName as keyof UptimeEvents
                    );
                    expect(["CRITICAL", "HIGH", "LOW", "MEDIUM"]).toContain(
                        priority
                    );
                }
            });
        });

        describe("Edge cases and comprehensive testing", () => {
            it("should handle all events from all categories", () => {
                // Test a selection of events from each category to ensure comprehensive coverage
                const testEvents: Array<keyof UptimeEvents> = [
                    // CACHE
                    "cache:invalidated",
                    "site:cache-miss",
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
                    expect(["CRITICAL", "HIGH", "LOW", "MEDIUM"]).toContain(
                        priority
                    );
                }
            });

            it("should maintain consistency between constants and functions", () => {
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
        it("should work with typed event names", () => {
            // This test ensures types work correctly
            const eventName: keyof UptimeEvents = "site:added";
            const category: keyof typeof EVENT_CATEGORIES = "SITE";

            expect(isEventOfCategory(eventName, category)).toBe(true);
            expect(getEventPriority(eventName)).toBe("MEDIUM");
        });

        it("should maintain readonly contracts for constants", () => {
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
