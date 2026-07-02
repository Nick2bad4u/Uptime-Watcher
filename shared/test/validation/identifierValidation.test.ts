import {
    MONITOR_ID_MAX_LENGTH,
    MONITOR_ID_REQUIRED_MESSAGE,
    MONITOR_ID_TOO_LONG_MESSAGE,
} from "@shared/validation/monitorFieldConstants";
import {
    assertValidMonitorId,
    assertValidSiteIdentifier,
    isValidMonitorId,
    isValidSiteIdentifier,
} from "@shared/validation/identifierValidation";
import {
    SITE_IDENTIFIER_MAX_LENGTH,
    SITE_IDENTIFIER_REQUIRED_MESSAGE,
    SITE_IDENTIFIER_TOO_LONG_MESSAGE,
} from "@shared/validation/siteFieldConstants";
import { describe, expect, it } from "vitest";

describe("repository identifier validation", () => {
    describe(assertValidMonitorId, () => {
        it("accepts monitor IDs at the shared max length", () => {
            const monitorId = "m".repeat(MONITOR_ID_MAX_LENGTH);

            expect(() =>
                assertValidMonitorId(monitorId, "test")
            ).not.toThrow();
            expect(isValidMonitorId(monitorId)).toBeTruthy();
        });

        it("rejects empty monitor IDs", () => {
            const emptyMonitorId = " ".repeat(3);

            expect(() => assertValidMonitorId(emptyMonitorId, "test")).toThrow(
                `[test] ${MONITOR_ID_REQUIRED_MESSAGE}`
            );
            expect(isValidMonitorId(emptyMonitorId)).toBeFalsy();
        });

        it("rejects monitor IDs that exceed the shared max length", () => {
            const monitorId = "m".repeat(MONITOR_ID_MAX_LENGTH + 1);

            expect(() => assertValidMonitorId(monitorId, "test")).toThrow(
                `[test] ${MONITOR_ID_TOO_LONG_MESSAGE}`
            );
            expect(isValidMonitorId(monitorId)).toBeFalsy();
        });

        it("rejects monitor IDs with ASCII control characters", () => {
            const monitorId = "monitor\nid";

            expect(() => assertValidMonitorId(monitorId, "test")).toThrow(
                "[test] Monitor ID contains invalid control characters"
            );
            expect(isValidMonitorId(monitorId)).toBeFalsy();
        });
    });

    describe(assertValidSiteIdentifier, () => {
        it("keeps site identifier limits aligned with helper predicates", () => {
            const siteIdentifier = "s".repeat(SITE_IDENTIFIER_MAX_LENGTH);

            expect(() =>
                assertValidSiteIdentifier(siteIdentifier, "test")
            ).not.toThrow();
            expect(isValidSiteIdentifier(siteIdentifier)).toBeTruthy();
        });

        it("rejects empty site identifiers", () => {
            const emptySiteIdentifier = " ".repeat(3);

            expect(() =>
                assertValidSiteIdentifier(emptySiteIdentifier, "test")
            ).toThrow(`[test] ${SITE_IDENTIFIER_REQUIRED_MESSAGE}`);
            expect(isValidSiteIdentifier(emptySiteIdentifier)).toBeFalsy();
        });

        it("rejects site identifiers that exceed the shared max length", () => {
            const siteIdentifier = "s".repeat(SITE_IDENTIFIER_MAX_LENGTH + 1);

            expect(() =>
                assertValidSiteIdentifier(siteIdentifier, "test")
            ).toThrow(`[test] ${SITE_IDENTIFIER_TOO_LONG_MESSAGE}`);
            expect(isValidSiteIdentifier(siteIdentifier)).toBeFalsy();
        });
    });
});
