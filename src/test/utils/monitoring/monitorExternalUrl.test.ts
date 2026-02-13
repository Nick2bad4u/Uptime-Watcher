import { describe, expect, it } from "vitest";

import { normalizeMonitorExternalUrl } from "../../../utils/monitoring/monitorExternalUrl";

describe(normalizeMonitorExternalUrl, () => {
    it("returns trimmed valid URLs", () => {
        expect(
            normalizeMonitorExternalUrl("  https://example.com/path  ")
        ).toBe("https://example.com/path");
    });

    it("returns empty string for invalid inputs", () => {
        expect(normalizeMonitorExternalUrl("not-a-url")).toBe("");
        expect(normalizeMonitorExternalUrl(123)).toBe("");
        expect(normalizeMonitorExternalUrl("   ")).toBe("");
    });

    it("rejects URLs containing auth credentials", () => {
        expect(
            normalizeMonitorExternalUrl("https://user:pass@example.com")
        ).toBe("");
    });
});
