/**
 * Internal helper contracts for {@link ServiceContainer}.
 *
 * @remarks
 * `electron/services/ServiceContainer.ts` is intentionally large (DI container,
 * initialization sequencing, and event forwarding). This module extracts small
 * utility types and guards so refactors can happen without scrolling through
 * unrelated boilerplate.
 */

import type { EventMetadata } from "@shared/types/events";
import type { Except } from "type-fest";

import {
    castUnchecked,
    isPromiseLike as sharedIsPromiseLike,
    isRecord,
} from "@shared/utils/typeHelpers";

import type { UptimeEvents } from "../events/eventTypes";
import type {
    EnhancedEventPayload,
    EventKey,
    EventPayload,
} from "../events/TypedEventBus";

/**
 * Event payload shape accepted by the event-forwarding layer.
 *
 * @remarks
 * This is the normalized form that may (or may not) include `_meta` and
 * `_originalMeta` properties attached by
 * {@link electron/events/TypedEventBus#TypedEventBus}.
 */
export type ForwardableEventPayload<EventName extends EventKey<UptimeEvents>> =
    ForwardablePayloadBase<EventName> & {
        _meta?: EventMetadata;
        _originalMeta?: EventMetadata;
    };

/**
 * Supported payload formats for manager events forwarded to the orchestrator.
 *
 * @remarks
 * Manager event buses attach metadata to payloads via {@link EventMetadata}. The
 * orchestrator should receive the original payload shape without
 * EventEmitter-specific metadata. This helper type captures both
 * representations so forwarding helpers can normalize payloads safely while
 * preserving type safety.
 */
export type ForwardablePayloadBase<EventName extends EventKey<UptimeEvents>> =
    EventPayload<UptimeEvents, EventName> extends object
        ? Except<
              EventPayload<UptimeEvents, EventName>,
              Extract<
                  "_meta" | "_originalMeta",
                  keyof EventPayload<UptimeEvents, EventName>
              >
          >
        : EventPayload<UptimeEvents, EventName>;

/**
 * Forwardable payload that is guaranteed to include `_meta`.
 */
export type ForwardablePayloadWithMeta<
    EventName extends EventKey<UptimeEvents>,
> = ForwardablePayloadBase<EventName> & {
    _meta: EventMetadata;
    _originalMeta?: EventMetadata;
};

/**
 * Represents a service that optionally exposes an
 * {@link PossiblyInitializableService.initialize | initialize} method.
 */
export interface PossiblyInitializableService {
    /** Optional initializer invoked during container bootstrap. */
    initialize?: (() => Promise<void>) | (() => unknown);
}

/**
 * Type guard that determines if a service exposes an
 * {@link PossiblyInitializableService.initialize | initialize} method.
 */
export function hasInitializeMethod(
    value: unknown
): value is PossiblyInitializableService & {
    initialize: () => unknown;
} {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value["initialize"] === "function";
}

/**
 * Cast {@link EnhancedEventPayload} into its forwardable representation.
 *
 * @remarks
 * This is a type-level normalization helper used by `ServiceContainer` when
 * bridging manager event buses into the orchestrator bus.
 */
export const toForwardablePayload = <EventName extends EventKey<UptimeEvents>>(
    payload: EnhancedEventPayload<EventPayload<UptimeEvents, EventName>>
): ForwardableEventPayload<EventName> =>
    castUnchecked<ForwardableEventPayload<EventName>>(payload);

/**
 * Determines whether a value is promise-like.
 *
 * @remarks
 * Compatibility wrapper for `ServiceContainer` imports. The underlying guard is
 * shared so renderer, Electron, and SDK cleanup paths agree on thenable
 * shapes.
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return sharedIsPromiseLike(value);
}
