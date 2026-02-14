type SharedContext = Record<string, unknown>;

declare const contextValue: SharedContext;

JSON.stringify(contextValue);

export const __typedFixtureModule = "typed-fixture-module";
