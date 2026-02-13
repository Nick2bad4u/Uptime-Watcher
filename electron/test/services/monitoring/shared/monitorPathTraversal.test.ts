import { describe, expect, it } from "vitest";

import { extractMonitorValueAtPath } from "../../../../services/monitoring/shared/monitorPathTraversal";

describe("extractMonitorValueAtPath", () => {
    it("resolves dot-separated paths", () => {
        const payload = {
            details: {
                status: {
                    code: "up",
                },
            },
        };

        expect(extractMonitorValueAtPath(payload, "details.status.code")).toBe(
            "up"
        );
    });

    it("supports bracketed array indices when enabled", () => {
        const payload = {
            data: {
                items: [{ name: "alpha" }, { name: "beta" }],
            },
        };

        expect(
            extractMonitorValueAtPath(payload, "data.items[1].name", {
                allowArrayIndexTokens: true,
            })
        ).toBe("beta");
    });

    it("rejects malformed array index tokens", () => {
        const payload = {
            data: {
                items: [{ name: "alpha" }, { name: "beta" }],
            },
        };

        expect(
            extractMonitorValueAtPath(payload, "data.items[1a].name", {
                allowArrayIndexTokens: true,
            })
        ).toBeUndefined();
    });
});
