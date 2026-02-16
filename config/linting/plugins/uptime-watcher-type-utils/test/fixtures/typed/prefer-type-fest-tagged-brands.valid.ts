import type { Tagged } from "type-fest";

type SiteIdentifier = Tagged<string, "SiteIdentifier">;

declare const siteId: SiteIdentifier;

String(siteId);

export const __typedFixtureModule = "typed-fixture-module";
