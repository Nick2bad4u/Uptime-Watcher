interface SiteEventMap {
    "monitor:status": { readonly status: "down" | "up" };
}

declare class TypedEventBus<TMap extends object> {
    emit<EventName extends keyof TMap>(
        eventName: EventName,
        payload: TMap[EventName]
    ): void;

    onTyped<EventName extends keyof TMap>(
        eventName: EventName,
        listener: (payload: TMap[EventName]) => void
    ): void;
}

const bus = new TypedEventBus<SiteEventMap>();

// @ts-expect-error -- intentional payload mismatch for typed lint rule coverage
bus.emit("monitor:status", { status: "paused" });

bus.onTyped(
    "monitor:status",
    // @ts-expect-error -- intentional listener type mismatch for typed lint rule coverage
    (payload: { readonly status: number }) => payload.status
);

export const __typedFixtureModule = "typed-fixture-module";
