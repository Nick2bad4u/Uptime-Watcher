import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { describe, expect, it } from "vitest";

import { isEventMetadata } from "../../events/eventMetadataGuards";

describe(isEventMetadata, () => {
    it("accepts canonical event metadata", () => {
        expect(
            isEventMetadata({
                busId: "bus",
                correlationId: "correlation",
                eventName: "site:added",
                timestamp: MAX_VALID_DATE_EPOCH_MS,
            })
        ).toBeTruthy();
    });

    it("rejects malformed event metadata", () => {
        for (const metadata of [
            null,
            {
                busId: "",
                correlationId: "correlation",
                eventName: "site:added",
                timestamp: 1,
            },
            {
                busId: "bus",
                correlationId: "",
                eventName: "site:added",
                timestamp: 1,
            },
            {
                busId: "bus",
                correlationId: "correlation",
                eventName: "site:added",
                timestamp: MAX_VALID_DATE_EPOCH_MS + 1,
            },
        ]) {
            expect(isEventMetadata(metadata)).toBeFalsy();
        }
    });
});
