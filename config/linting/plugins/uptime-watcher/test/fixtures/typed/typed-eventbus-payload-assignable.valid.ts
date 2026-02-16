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

bus.emit("monitor:status", { status: "up" });
bus.onTyped("monitor:status", (payload) => payload.status);

export const __typedFixtureModule = "typed-fixture-module";
