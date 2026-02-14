import type { UnknownRecord } from "type-fest";

type SharedContext = UnknownRecord;

declare const contextValue: SharedContext;

JSON.stringify(contextValue);

export const __typedFixtureModule = "typed-fixture-module";
