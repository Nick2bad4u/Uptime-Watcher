declare const rawValue: unknown;

const parsed = rawValue as unknown as { readonly id: string };
JSON.stringify(parsed);

export const __typedFixtureModule = "typed-fixture-module";
