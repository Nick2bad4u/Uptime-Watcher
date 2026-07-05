import { describe, expect, it, vi } from "vitest";

import {
    extractJsonValueAtPath,
    parseJsonPayload,
} from "../../../../services/monitoring/shared/httpMonitorJsonUtils";

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

describe(parseJsonPayload, () => {
    it("parses string JSON payloads", () => {
        const result = parseJsonPayload('{"status":"ok"}');

        expect(result).toEqual({
            ok: true,
            payload: {
                status: "ok",
            },
        });
    });

    it("returns decoded payloads without reparsing", () => {
        const payload = {
            status: "ok",
        };

        const result = parseJsonPayload(payload);

        expect(result).toEqual({
            ok: true,
            payload,
        });
    });

    it("adds monitor payload context to parse failures", () => {
        const onParseError = vi.fn();

        const result = parseJsonPayload("{not-json", onParseError);

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error).toBeInstanceOf(SyntaxError);
            expect(result.error.message).toContain(
                "HTTP JSON payload parsing failed"
            );
            expect(onParseError).toHaveBeenCalledWith(result.error);
        }
    });
});
