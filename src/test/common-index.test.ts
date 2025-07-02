/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";

describe("Common Components Index", () => {
    it("should export StatusBadge and HistoryChart", async () => {
        const commonModule = await import("../components/common/index");
        
        expect(commonModule.StatusBadge).toBeDefined();
        expect(commonModule.HistoryChart).toBeDefined();
        expect(commonModule).toHaveProperty("StatusBadge");
        expect(commonModule).toHaveProperty("HistoryChart");
    }, 10000); // Increase timeout to 10 seconds
});
