import { describe, expect, it } from "vitest";

import {
    parseOpsObjectFileNameMetadata,
    parseOpsObjectKeyMetadata,
} from "@electron/services/sync/syncEngineKeyUtils";

describe("syncEngineKeyUtils", () => {
    describe(parseOpsObjectFileNameMetadata, () => {
        it("parses a valid ops filename", () => {
            expect(parseOpsObjectFileNameMetadata("123-0-9.ndjson")).toEqual({
                createdAt: 123,
                firstOpId: 0,
                lastOpId: 9,
            });
        });

        it("rejects exponent notation", () => {
            expect(parseOpsObjectFileNameMetadata("1e3-0-9.ndjson")).toBeNull();
        });

        it("rejects lastOpId < firstOpId", () => {
            expect(parseOpsObjectFileNameMetadata("100-9-1.ndjson")).toBeNull();
        });
    });

    describe(parseOpsObjectKeyMetadata, () => {
        it("parses a valid ops key", () => {
            const result = parseOpsObjectKeyMetadata(
                "sync/devices/device-1/ops/123-0-9.ndjson"
            );

            expect(result).toEqual({
                createdAt: 123,
                deviceId: "device-1",
                lastOpId: 9,
            });
        });

        it("rejects invalid segment counts", () => {
            expect(
                parseOpsObjectKeyMetadata(
                    "sync/devices/a/ops/1-0-1.ndjson/extra"
                )
            ).toBeNull();
        });

        it("rejects non-digit numeric segments (e.g. exponent notation)", () => {
            expect(
                parseOpsObjectKeyMetadata("sync/devices/a/ops/1e3-0-9.ndjson")
            ).toBeNull();
        });

        it("rejects lastOpId < firstOpId", () => {
            expect(
                parseOpsObjectKeyMetadata("sync/devices/a/ops/100-9-1.ndjson")
            ).toBeNull();
        });

        it("rejects invalid deviceId segments", () => {
            expect(
                parseOpsObjectKeyMetadata(
                    "sync/devices/a:evil/ops/100-0-1.ndjson"
                )
            ).toBeNull();

            expect(
                parseOpsObjectKeyMetadata(
                    "sync/devices/ device /ops/100-0-1.ndjson"
                )
            ).toBeNull();
        });
    });
});
