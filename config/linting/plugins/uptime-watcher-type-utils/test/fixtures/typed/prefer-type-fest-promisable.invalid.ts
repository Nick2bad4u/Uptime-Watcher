type DeferredAction = () => Promise<void> | void;

interface LifecycleHooks {
    onReady: () => Promise<void> | void;
}

type Resolver<TValue> = (value: TValue) => Promise<TValue> | TValue;

declare const resolveValue: Resolver<number>;
declare const hooks: LifecycleHooks;

declare const deferredAction: DeferredAction;

deferredAction();
hooks.onReady();
resolveValue(42);

export const __typedFixtureModule = "typed-fixture-module";
