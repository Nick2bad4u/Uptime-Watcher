import { describe, expect, it, vi } from "vitest";

import {
    createInitialListenerStates,
    createStatusUpdateListenerDescriptors,
    STATUS_UPDATE_LISTENER_COUNT,
} from "../../../../stores/sites/utils/statusUpdateListeners";

describe(createStatusUpdateListenerDescriptors, () => {
    it("keeps the exported listener count aligned with the descriptor list", () => {
        const descriptors = createStatusUpdateListenerDescriptors({
            handleMonitoringStarted: vi.fn(),
            handleMonitoringStopped: vi.fn(),
            processStatusUpdateCandidate: vi.fn(),
        });

        expect(descriptors).toHaveLength(STATUS_UPDATE_LISTENER_COUNT);
        expect(descriptors.map((descriptor) => descriptor.scope)).toEqual([
            "monitor:status-changed",
            "monitor:check-completed",
            "monitoring:started",
            "monitoring:stopped",
        ]);
    });
});

describe(createInitialListenerStates, () => {
    it("creates detached listener states from descriptor labels", () => {
        expect(
            createInitialListenerStates([
                {
                    label: "example",
                    register: async () => () => {},
                    scope: "example",
                },
            ])
        ).toEqual([
            {
                attached: false,
                name: "example",
            },
        ]);
    });
});
