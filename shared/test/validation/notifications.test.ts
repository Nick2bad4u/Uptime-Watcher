/**
 * Tests for shared notification preference schemas.
 */

import { SITE_IDENTIFIER_MAX_LENGTH } from "@shared/validation/siteFieldConstants";
import {
    parseNotificationPreferenceUpdate,
    validateNotificationPreferenceUpdate,
} from "@shared/validation/notifications";
import { describe, expect, it } from "vitest";

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
        for (const identifier of [
            "",
            " ".repeat(3),
            "site-\u0000control",
            "a".repeat(SITE_IDENTIFIER_MAX_LENGTH + 1),
        ]) {
            const parsed = validateNotificationPreferenceUpdate({
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: false,
                mutedSiteNotificationIdentifiers: [identifier],
            });

            expect(parsed.success).toBeFalsy();
        }
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
