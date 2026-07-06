import { normalizeCloudAccountLabel } from "@electron/services/cloud/cloudAccountLabel";
import { describe, expect, it } from "vitest";

describe(normalizeCloudAccountLabel, () => {
    it("compacts whitespace and ASCII control characters", () => {
        expect(normalizeCloudAccountLabel("  me@example.com\n\t ")).toBe(
            "me@example.com"
        );
        expect(normalizeCloudAccountLabel("Nick\r\n Name")).toBe("Nick Name");
    });

    it("returns undefined for missing or empty labels", () => {
        expect(normalizeCloudAccountLabel(undefined)).toBeUndefined();
        expect(normalizeCloudAccountLabel("")).toBeUndefined();
        expect(normalizeCloudAccountLabel(" \n\t ")).toBeUndefined();
    });

    it("bounds oversized labels", () => {
        const label = normalizeCloudAccountLabel("x".repeat(1000));

        expect(label).toBeDefined();
        expect(label).toHaveLength(323);
        expect(label?.endsWith("...")).toBeTruthy();
    });
});
