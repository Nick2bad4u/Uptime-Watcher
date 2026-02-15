type ObjectValues<T extends object> = T[keyof T];

type SiteEventPayload = SiteEventPayloadMap[keyof SiteEventPayloadMap];

interface SiteEventPayloadMap {
    readonly down: { readonly status: "down" };
    readonly up: { readonly status: "up" };
}
type TemplateVariableMap = Record<string, number | string | undefined>;

type TemplateVariableValue = TemplateVariableMap[keyof TemplateVariableMap];

declare const payload: SiteEventPayload;
declare const variableValue: TemplateVariableValue;
declare const dynamicValue: ObjectValues<{ readonly enabled: boolean }>;

const assertNever = (value: never): void => {
    throw new Error(String(value));
};

if (payload.status === "up" && typeof variableValue === "number") {
    assertNever(dynamicValue as never);
}

export const __typedFixtureModule = "typed-fixture-module";
