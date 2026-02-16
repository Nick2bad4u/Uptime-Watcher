import type { JsonValue } from "type-fest";

type IpcPayload = JsonValue;

declare const payload: IpcPayload;

JSON.stringify(payload);

export const __typedFixtureModule = "typed-fixture-module";
