import { describe, expect, it } from "vitest";

import type { MonitorPathTraversalOptions } from "../../../../services/monitoring/shared/monitorPathTraversalOptions";

import { extractMonitorValueAtPath } from "../../../../services/monitoring/shared/monitorPathTraversal";

describe(extractMonitorValueAtPath, () => {
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

    it("rejects malformed dot-separated array indices", () => {
        const payload = {
            data: {
                items: [{ name: "alpha" }, { name: "beta" }],
            },
        };

        expect(
            extractMonitorValueAtPath(payload, "data.items.1a.name")
        ).toBeUndefined();
    });

    it("does not invoke accessors while traversing object paths", () => {
        let getterCalls = 0;
        const payload = {};

        Object.defineProperty(payload, "details", {
            enumerable: true,
            get() {
                getterCalls += 1;
                return {
                    status: "up",
                };
            },
        });

        expect(extractMonitorValueAtPath(payload, "details.status")).toBe(
            undefined
        );
        expect(getterCalls).toBe(0);
    });

    it("does not invoke accessors while normalizing traversal options", () => {
        let getterCalls = 0;
        const payload = {
            data: {
                items: [{ name: "alpha" }],
            },
        };
        const options = {
            blockPrototypeAccess: true,
        } as Record<string, unknown>;

        Object.defineProperty(options, "allowArrayIndexTokens", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("option getter should not run");
            },
        });

        expect(
            extractMonitorValueAtPath(
                payload,
                "data.items[0].name",
                options as MonitorPathTraversalOptions
            )
        ).toBeUndefined();
        expect(getterCalls).toBe(0);
    });

    it("blocks prototype-related path segments by default", () => {
        const payload = {
            safe: Object.defineProperties(
                {},
                {
                    __proto__: {
                        enumerable: true,
                        value: "polluted",
                    },
                    constructor: {
                        enumerable: true,
                        value: {
                            prototype: "polluted",
                        },
                    },
                    prototype: {
                        enumerable: true,
                        value: "polluted",
                    },
                }
            ),
        };

        expect(extractMonitorValueAtPath(payload, "safe.__proto__")).toBe(
            undefined
        );
        expect(
            extractMonitorValueAtPath(payload, "safe.constructor.prototype")
        ).toBeUndefined();
        expect(extractMonitorValueAtPath(payload, "safe.prototype")).toBe(
            undefined
        );
    });

    it("blocks percent-encoded prototype segments after decoding", () => {
        const payload = {
            safe: Object.defineProperty({}, "__proto__", {
                enumerable: true,
                value: "polluted",
            }),
        };

        expect(
            extractMonitorValueAtPath(payload, "safe.%5F%5Fproto%5F%5F")
        ).toBeUndefined();
    });

    it("can resolve own prototype-named data only when explicitly allowed", () => {
        const payload = {
            safe: Object.defineProperty({}, "constructor", {
                enumerable: true,
                value: "data",
            }),
        };

        expect(
            extractMonitorValueAtPath(payload, "safe.constructor", {
                blockPrototypeAccess: false,
            })
        ).toBe("data");
    });

    it("resolves values from null-prototype response objects", () => {
        const payload = Object.create(null) as Record<string, unknown>;
        payload["details"] = Object.assign(Object.create(null), {
            status: "up",
        });

        expect(extractMonitorValueAtPath(payload, "details.status")).toBe("up");
    });
});
