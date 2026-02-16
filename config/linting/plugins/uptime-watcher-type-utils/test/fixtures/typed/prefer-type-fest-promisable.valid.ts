import type { Promisable } from "type-fest";

type DeferredAction = () => Promisable<void>;

interface LifecycleHooks {
    onReady: () => Promisable<void>;
}

type Resolver<TValue> = (value: TValue) => Promisable<TValue>;

declare const resolveValue: Resolver<number>;
declare const hooks: LifecycleHooks;

declare const deferredAction: DeferredAction;

deferredAction();
hooks.onReady();
resolveValue(42);

export const __typedFixtureModule = "typed-fixture-module";
