/**
 * Adapter helpers for supplying typed `emitTyped` functions to coordinators.
 *
 * @remarks
 * The orchestrator owns the concrete
 * {@link electron/events/TypedEventBus#TypedEventBus} instance, while many
 * coordinators depend on a narrow `emitTyped` callback. Centralizing these
 * adapters avoids repeating inline arrow functions in constructors and keeps
 * type parameters intact.
 */

import type { UptimeEvents } from "../../events/eventTypes";
import type {
    EventKey,
    EventPayload,
    TypedEventBus,
} from "../../events/TypedEventBus";

/** Strongly-typed `emitTyped` function signature for uptime events. */
export type EmitUptimeEvent = <TEventName extends EventKey<UptimeEvents>>(
    eventName: TEventName,
    payload: EventPayload<UptimeEvents, TEventName>
) => Promise<void>;

/**
 * Narrow shape required to emit uptime events.
 */
export type UptimeEventEmitter = Pick<TypedEventBus<UptimeEvents>, "emitTyped">;

/**
 * Creates an emitter for the `system:error` event.
 */
export function createEmitSystemError(
    bus: UptimeEventEmitter
): (payload: EventPayload<UptimeEvents, "system:error">) => Promise<void> {
    return (payload: EventPayload<UptimeEvents, "system:error">) =>
        bus.emitTyped("system:error", payload);
}

/**
 * Creates a strongly-typed `emitTyped` adapter.
 */
export function createEmitUptimeEvent(
    bus: UptimeEventEmitter
): EmitUptimeEvent {
    return async (eventName, payload) => bus.emitTyped(eventName, payload);
}
