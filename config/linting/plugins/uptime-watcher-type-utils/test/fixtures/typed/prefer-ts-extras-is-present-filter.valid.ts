declare function isPresent<TValue>(value: TValue): value is NonNullable<TValue>;

declare const nullableEntries: readonly (null | string)[];
declare const nullableMonitors: readonly (null | undefined | { readonly id: string })[];
declare const maybeNumbers: readonly (null | number | undefined)[];

const entries = nullableEntries.filter(isPresent);
const monitors = nullableMonitors.filter(isPresent);
const numbers = maybeNumbers.filter(isPresent);

if (entries.length + monitors.length + numbers.length < 0) {
    throw new TypeError("Unreachable total count");
}

export const __typedFixtureModule = "typed-fixture-module";
