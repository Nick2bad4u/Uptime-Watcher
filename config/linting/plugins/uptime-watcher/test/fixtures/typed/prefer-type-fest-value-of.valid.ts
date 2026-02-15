import type { ValueOf } from "type-fest";

type ObjectValues<T extends object> = ValueOf<T>;

type SiteEventPayload = ValueOf<SiteEventPayloadMap>;

interface SiteEventPayloadMap {
    readonly down: { readonly status: "down" };
    readonly up: { readonly status: "up" };
}
type TemplateVariableMap = Record<string, number | string | undefined>;

type TemplateVariableValue = ValueOf<TemplateVariableMap>;

declare const payload: SiteEventPayload;
declare const variableValue: TemplateVariableValue;
declare const dynamicValue: ObjectValues<{ readonly enabled: boolean }>;

const assertNever = (_value: never): void => {};

if (payload.status === "up" && typeof variableValue === "number") {
    assertNever(dynamicValue as never);
}

export const __typedFixtureModule = "typed-fixture-module";
