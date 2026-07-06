import { getOwnPropertyValue } from "@shared/utils/errorPropertyAccess";

type DomEventListener =
    | EventListenerOrEventListenerObject
    | ((event: PointerEvent) => void)
    | (() => void);

type ListenerMethod = (
    this: unknown,
    type: string,
    listener: DomEventListener,
    options?: AddEventListenerOptions | boolean
) => void;

const noop = (): void => undefined;

const isObjectLike = (value: unknown): value is object =>
    (typeof value === "object" && value !== null) ||
    typeof value === "function";

const isListenerMethod = (value: unknown): value is ListenerMethod =>
    typeof value === "function";

const getRuntimeListenerMethod = (
    holder: unknown,
    key: "addEventListener" | "removeEventListener"
): ListenerMethod | undefined => {
    if (!isObjectLike(holder)) {
        return undefined;
    }

    try {
        const candidate: unknown = Reflect.get(holder, key);
        return isListenerMethod(candidate) ? candidate : undefined;
    } catch {
        return undefined;
    }
};

/**
 * Safely subscribes to a DOM event on a global object such as `window` or
 * `document`.
 *
 * @remarks
 * Renderer tests and shutdown paths can expose partial globals. This helper
 * probes listener methods defensively and returns a best-effort cleanup
 * callback instead of throwing from hook effects.
 */
export function subscribeToGlobalEvent(
    globalKey: "document" | "window",
    type: string,
    listener: DomEventListener,
    options?: AddEventListenerOptions | boolean,
    removeOptions: AddEventListenerOptions | boolean | undefined = options
): () => void {
    const globalProperty = getOwnPropertyValue(globalThis, globalKey);

    if (!globalProperty.found) {
        return noop;
    }

    const addEventListener = getRuntimeListenerMethod(
        globalProperty.value,
        "addEventListener"
    );
    const removeEventListener = getRuntimeListenerMethod(
        globalProperty.value,
        "removeEventListener"
    );

    if (!addEventListener || !removeEventListener) {
        return noop;
    }

    try {
        const addArgs =
            options === undefined
                ? [type, listener]
                : [
                      type,
                      listener,
                      options,
                  ];
        Reflect.apply(addEventListener, globalProperty.value, addArgs);
    } catch {
        return noop;
    }

    return (): void => {
        try {
            const removeArgs =
                removeOptions === undefined
                    ? [type, listener]
                    : [
                          type,
                          listener,
                          removeOptions,
                      ];
            Reflect.apply(
                removeEventListener,
                globalProperty.value,
                removeArgs
            );
        } catch {
            // Listener cleanup is best-effort during renderer teardown.
        }
    };
}
