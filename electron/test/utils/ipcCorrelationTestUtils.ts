import { isIpcCorrelationEnvelope } from "@shared/types/ipc";
import { vi } from "vitest";

const isCorrelationEnvelope = (
    value: unknown
): value is {
    readonly __uptimeWatcherIpcContext: true;
    readonly correlationId: string;
} => isIpcCorrelationEnvelope(value);

const sanitizeIpcInvokeCall = (call: unknown[]): unknown[] => {
    if (call.length === 0) {
        return call;
    }

    const maybeEnvelope = call.at(-1);
    if (!isCorrelationEnvelope(maybeEnvelope)) {
        return call;
    }

    return call.slice(0, -1);
};

export const createCorrelationAwareInvokeMock = (): ReturnType<typeof vi.fn> =>
    new Proxy(vi.fn(), {
        apply(target, thisArg, argArray) {
            try {
                return Reflect.apply(target, thisArg, argArray);
            } finally {
                const lastIndex = target.mock.calls.length - 1;
                if (lastIndex >= 0) {
                    const currentCall = target.mock.calls[lastIndex] ?? [];
                    target.mock.calls[lastIndex] =
                        sanitizeIpcInvokeCall(currentCall);
                }
            }
        },
    }) as ReturnType<typeof vi.fn>;
