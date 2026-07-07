/**
 * Test suite for event type contracts.
 *
 * @module EventTypes
 *
 * @file Tests for compile-time event-name contract behavior in the Uptime
 *   Watcher event system.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Events
 *
 * @tags ["events", "categorization", "priority", "utilities"]
 */

import { describe, expect, it } from "vitest";

import type { UptimeEventName } from "../events/eventTypes.js";

const isUptimeEventNameAllowsAnyString =
    false satisfies string extends UptimeEventName ? true : false;

describe("UptimeEventName", () => {
    it("keeps uptime event names closed at the type level", async ({
        task,
        annotate,
    }) => {
        await annotate(
            `Testing closed event names for ${task.name}`,
            "type-safety"
        );
        await annotate("Event system component: type contracts", "component");
        await annotate(
            "Test case: Verifying arbitrary strings are not UptimeEventName",
            "compile-time"
        );

        expect(isUptimeEventNameAllowsAnyString).toBeFalsy();
    });
});
