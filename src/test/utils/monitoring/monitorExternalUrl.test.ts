import { describe, expect, it } from "vitest";

import { normalizeMonitorExternalUrl } from "../../../utils/monitoring/monitorExternalUrl";

describe(normalizeMonitorExternalUrl, () => {
    it("returns trimmed valid URLs", () => {
        expect(
            normalizeMonitorExternalUrl("  https://example.com/path  ")
        ).toBe("https://example.com/path");
    });

    it("returns canonical normalized URLs", () => {
        expect(
            normalizeMonitorExternalUrl(
                "https://example.com/path?query=hello world"
            )
        ).toBe("https://example.com/path?query=hello%20world");
    });

    it("returns empty string for invalid inputs", () => {
        expect(normalizeMonitorExternalUrl("not-a-url")).toBe("");
        expect(normalizeMonitorExternalUrl(123)).toBe("");
        expect(normalizeMonitorExternalUrl(" ".repeat(3))).toBe("");
        expect(normalizeMonitorExternalUrl("https://example.com/\npath")).toBe(
            ""
        );
    });

    it("rejects URLs containing auth credentials", () => {
        expect(
            normalizeMonitorExternalUrl("https://user:pass@example.com")
        ).toBe("");
    });

    it("rejects non-http external-open URLs", () => {
        expect(normalizeMonitorExternalUrl("mailto:ops@example.com")).toBe("");
    });

    it("rejects URLs beyond the external-open byte budget", () => {
        expect(
            normalizeMonitorExternalUrl(
                `https://example.com/${"a".repeat(4096)}`
            )
        ).toBe("");
    });
});
