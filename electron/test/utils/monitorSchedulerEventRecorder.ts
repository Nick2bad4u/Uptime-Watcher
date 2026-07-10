import type { MonitorSchedulerEventBus } from "../../services/monitoring/MonitorScheduler";

/** Event captured from a scheduler event-emitter call. */
export type RecordedMonitorSchedulerEvent = readonly [
    eventName: string,
    payload: unknown,
];

/** Mutable recorder used by scheduler tests without weakening event types. */
export interface MonitorSchedulerEventRecorder {
    readonly calls: RecordedMonitorSchedulerEvent[];
    readonly clear: () => void;
    readonly eventBus: MonitorSchedulerEventBus;
}

/** Creates a typed scheduler event bus and captures each emitted event. */
export function createMonitorSchedulerEventRecorder(): MonitorSchedulerEventRecorder {
    const calls: RecordedMonitorSchedulerEvent[] = [];
    const eventBus: MonitorSchedulerEventBus = {
        async emitTyped(eventName, payload) {
            calls.push([eventName, payload]);
        },
    };

    return {
        calls,
        clear() {
            calls.length = 0;
        },
        eventBus,
    };
}
