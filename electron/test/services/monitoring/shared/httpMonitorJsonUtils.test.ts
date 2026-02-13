import { describe, expect, it } from "vitest";

import { extractJsonValueAtPath } from "../../../../services/monitoring/shared/httpMonitorJsonUtils";

describe(extractJsonValueAtPath, () => {
    it("resolves nested object values", () => {
        const payload = {
            data: {
                status: {
                    value: "ok",
                },
            },
        };

        expect(extractJsonValueAtPath(payload, "data.status.value")).toBe("ok");
    });

    it("resolves array index paths", () => {
        const payload = {
            data: {
                items: [{ value: "first" }, { value: "second" }],
            },
        };

        expect(extractJsonValueAtPath(payload, "data.items[0].value")).toBe(
            "first"
        );
    });

    it("returns undefined for malformed array index paths", () => {
        const payload = {
            data: {
                items: [{ value: "first" }, { value: "second" }],
            },
        };

        expect(extractJsonValueAtPath(payload, "data.items[0a].value")).toBe(
            undefined
        );
    });
});
