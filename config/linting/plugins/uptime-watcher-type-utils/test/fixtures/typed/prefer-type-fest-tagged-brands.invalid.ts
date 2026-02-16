type SiteIdentifier = string & {
    readonly __brand: "SiteIdentifier";
};

declare const siteId: SiteIdentifier;

String(siteId);

export const __typedFixtureModule = "typed-fixture-module";
