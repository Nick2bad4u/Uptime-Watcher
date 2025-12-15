/**
 * Tests for shared notification preference schemas.
 */

import { describe, expect, it } from "vitest";

import {
    parseNotificationPreferenceUpdate,
    validateNotificationPreferenceUpdate,
} from "@shared/validation/notifications";

describe("notification preference validation", () => {
    it("accepts a valid update payload", () => {
        const parsed = validateNotificationPreferenceUpdate({
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
            mutedSiteNotificationIdentifiers: ["site-1"],
        });

        expect(parsed.success).toBeTruthy();
    });

    it("rejects invalid identifiers", () => {
        const parsed = validateNotificationPreferenceUpdate({
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
            mutedSiteNotificationIdentifiers: [""],
        });

        expect(parsed.success).toBeFalsy();
    });

    it("parseNotificationPreferenceUpdate returns a typed object", () => {
        const result = parseNotificationPreferenceUpdate({
            systemNotificationsEnabled: false,
            systemNotificationsSoundEnabled: true,
        });

        expect(result.systemNotificationsEnabled).toBeFalsy();
        expect(result.systemNotificationsSoundEnabled).toBeTruthy();
    });
});
